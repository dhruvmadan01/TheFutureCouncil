'use strict';
// Launchpad API. One serverless function, many actions: /api/lp?action=...
//
//   public   program, leaderboard, demo-day
//   signed in  me, enroll, submit, settings
//   admin    admin-overview, admin-review, admin-rescore, admin-demoday,
//            admin-rank-candidates, admin-rank-one, admin-rank-save, admin-finalists, admin-rebalance
//
// Every dependency is injected so the same code runs against Supabase in production and an in-memory store in tests.

const content = require('../../launchpad/content.json');
const L = require('./logic');

const P = content.program;
const milestoneByN = {};
content.milestones.forEach((m) => { milestoneByN[m.n] = m; });

function httpError(status, message, extra) {
  const e = new Error(message);
  e.status = status;
  e.extra = extra;
  return e;
}

function createHandler(deps) {
  const { db, verifyToken, ai, cfg } = deps;
  const now = deps.nowMs || (() => Date.now());
  const today = () => L.istToday(now());
  const adminEmails = (cfg.adminEmails || []).map((e) => e.toLowerCase());

  // ---------- helpers ----------

  async function requireUser(req) {
    const header = req.headers.authorization || req.headers.Authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const user = await verifyToken(token);
    if (!user) throw httpError(401, 'Please sign in with Google again.');
    return user;
  }

  async function requireAdmin(req) {
    const user = await requireUser(req);
    if (!adminEmails.includes(user.email)) throw httpError(403, 'This area is for the TFC team.');
    return user;
  }

  async function findEnrollment(email) {
    const rows = await db.select('lp_enrollments', { eq: { email } });
    return rows[0] || null;
  }

  async function ensureBatch(startsOn) {
    const found = await db.select('lp_batches', { eq: { starts_on: startsOn } });
    if (found[0]) return found[0];
    return (await db.insert('lp_batches', { name: L.groupName(startsOn), starts_on: startsOn }))[0];
  }

  async function nextDemoDay() {
    const days = await db.select('lp_demo_days', { eq: { status: 'upcoming' }, order: ['held_on', 'asc'] });
    return days.find((d) => d.held_on >= today()) || days[0] || null;
  }

  async function buildMe(enrollment, user) {
    const [batchRows, podRows, subs, rankings, finalists] = await Promise.all([
      db.select('lp_batches', { eq: { id: enrollment.batch_id } }),
      enrollment.pod_id ? db.select('lp_pods', { eq: { id: enrollment.pod_id } }) : Promise.resolve([]),
      db.select('lp_submissions', { eq: { enrollment_id: enrollment.id }, order: ['created_at', 'desc'] }),
      db.select('lp_rankings', { eq: { enrollment_id: enrollment.id } }),
      db.select('lp_finalists', { eq: { enrollment_id: enrollment.id } })
    ]);
    const batch = batchRows[0];
    const pod = podRows[0] || null;
    let mates = [];
    if (pod) {
      const members = await db.select('lp_enrollments', { eq: { pod_id: pod.id } });
      const memberIds = members.map((m) => m.id);
      const passed = memberIds.length ? await db.select('lp_submissions', { in: { enrollment_id: memberIds }, eq: { status: 'passed' } }) : [];
      mates = members.map((m) => ({
        name: m.id === enrollment.id ? 'You' : L.publicName(m.name),
        college: m.college || null,
        isLead: !!pod.lead_email && pod.lead_email.toLowerCase() === m.email.toLowerCase(),
        passed: new Set(passed.filter((s) => s.enrollment_id === m.id).map((s) => s.milestone)).size,
        you: m.id === enrollment.id
      }));
    }
    const states = L.milestoneStates(subs);
    const passedCount = states.filter((s) => s.state === 'passed').length;
    const finalistDays = finalists.length ? await db.select('lp_demo_days', { in: { id: finalists.map((f) => f.demo_day_id) } }) : [];
    return {
      enrolled: true,
      today: today(),
      user: { name: enrollment.name, email: enrollment.email },
      enrollment: { id: enrollment.id, college: enrollment.college, showPublic: enrollment.show_public },
      batch: { id: batch.id, name: batch.name, startsOn: batch.starts_on, started: true },
      pod: pod ? { id: pod.id, name: pod.name, members: mates } : null,
      milestones: states,
      passedCount,
      demoEligible: L.demoEligible(subs),
      rankedFor: rankings.length,
      finalist: finalistDays.map((d) => ({ demoDayId: d.id, heldOn: d.held_on, status: d.status })),
      nextDemoDay: await publicDemoDay(await nextDemoDay())
    };
  }

  async function publicDemoDay(day, withFinalists) {
    if (!day) return null;
    const out = { id: day.id, heldOn: day.held_on, title: day.title || null, status: day.status, streamUrl: day.stream_url || null };
    if (withFinalists) {
      const fin = await db.select('lp_finalists', { eq: { demo_day_id: day.id }, order: ['position', 'asc'] });
      const enrollments = fin.length ? await db.select('lp_enrollments', { in: { id: fin.map((f) => f.enrollment_id) } }) : [];
      out.finalists = fin.map((f) => {
        const e = enrollments.find((x) => x.id === f.enrollment_id) || {};
        return {
          position: f.position,
          name: e.name ? L.publicName(e.name) : 'Founder',
          college: e.college || null,
          startupName: f.startup_name,
          oneLiner: f.one_liner,
          pitchUrl: day.status === 'done' ? f.pitch_url : null
        };
      });
    }
    return out;
  }

  async function scoreAndStore(submission, milestone) {
    if (!ai.enabled) return submission;
    try {
      const result = await ai.scoreSubmission(milestone, submission.answers);
      const patch = {
        status: result.passed ? 'passed' : 'needs_work',
        checklist: result.checklist,
        feedback: result.feedback,
        scored_by: 'ai',
        scored_at: new Date(now()).toISOString()
      };
      const updated = await db.update('lp_submissions', { eq: { id: submission.id } }, patch);
      return updated[0] || Object.assign({}, submission, patch);
    } catch (err) {
      // Leave it pending so the team can review it by hand.
      return submission;
    }
  }

  function summarise(s) {
    return { id: s.id, milestone: s.milestone, status: s.status, feedback: s.feedback || null, checklist: s.checklist || null, scoredBy: s.scored_by || null, createdAt: s.created_at };
  }

  // ---------- public ----------

  async function actionProgram() {
    const next = L.nextIntake(today(), P.intakeDay);
    return {
      status: 200,
      cache: 60,
      body: {
        today: today(),
        nextIntake: next,
        nextDemoDay: await publicDemoDay(await nextDemoDay()),
        demoDaySlots: P.demoDaySlots,
        aiReview: !!ai.enabled
      }
    };
  }

  async function actionLeaderboard() {
    const [enrollments, pods, batches, passed] = await Promise.all([
      db.select('lp_enrollments'),
      db.select('lp_pods'),
      db.select('lp_batches'),
      db.select('lp_submissions', { eq: { status: 'passed' } })
    ]);
    const passedBy = {};
    passed.forEach((s) => { (passedBy[s.enrollment_id] = passedBy[s.enrollment_id] || new Set()).add(s.milestone); });
    const count = (e) => (passedBy[e.id] ? passedBy[e.id].size : 0);
    const batchName = (id) => (batches.find((b) => b.id === id) || {}).name || '';

    const individuals = enrollments
      .filter((e) => e.show_public)
      .map((e) => ({ name: L.publicName(e.name), college: e.college || null, batch: batchName(e.batch_id), passed: count(e) }))
      .filter((r) => r.passed > 0)
      .sort((a, b) => b.passed - a.passed || a.name.localeCompare(b.name))
      .slice(0, 50);

    const podRows = pods.map((p) => {
      const members = enrollments.filter((e) => e.pod_id === p.id);
      const total = members.reduce((n, e) => n + count(e), 0);
      return { name: p.name, batch: batchName(p.batch_id), members: members.length, passed: total, average: members.length ? Math.round((total / members.length) * 10) / 10 : 0 };
    }).filter((p) => p.members > 0 && p.passed > 0).sort((a, b) => b.average - a.average || b.passed - a.passed).slice(0, 20);

    return { status: 200, cache: 60, body: { individuals, pods: podRows, founders: enrollments.length } };
  }

  async function actionDemoDay() {
    const upcoming = await nextDemoDay();
    const past = (await db.select('lp_demo_days', { eq: { status: 'done' }, order: ['held_on', 'desc'], limit: 6 }));
    return {
      status: 200,
      cache: 60,
      body: {
        today: today(),
        slots: P.demoDaySlots,
        upcoming: await publicDemoDay(upcoming, true),
        past: await Promise.all(past.map((d) => publicDemoDay(d, true)))
      }
    };
  }

  // ---------- signed in ----------

  async function actionMe(req) {
    const user = await requireUser(req);
    const enrollment = await findEnrollment(user.email);
    if (!enrollment) {
      return { status: 200, body: { enrolled: false, today: today(), user, nextIntake: L.nextIntake(today(), P.intakeDay), nextDemoDay: await publicDemoDay(await nextDemoDay()) } };
    }
    return { status: 200, body: await buildMe(enrollment, user) };
  }

  async function actionEnroll(req) {
    const user = await requireUser(req);
    const body = req.body || {};
    let enrollment = await findEnrollment(user.email);
    if (!enrollment) {
      const college = String(body.college || '').trim().slice(0, 120);
      const startsOn = L.monthStart(today());
      const batch = await ensureBatch(startsOn);
      const pods = await db.select('lp_pods', { eq: { batch_id: batch.id }, order: ['id', 'asc'] });
      const members = pods.length ? await db.select('lp_enrollments', { in: { pod_id: pods.map((p) => p.id) } }) : [];
      const withMembers = pods.map((p) => ({ id: p.id, members: members.filter((m) => m.pod_id === p.id) }));
      let podId = L.choosePod(withMembers, college, P.podSizeMax);
      if (!podId) {
        podId = (await db.insert('lp_pods', { batch_id: batch.id, name: `Pod ${pods.length + 1}` }))[0].id;
      }
      enrollment = (await db.insert('lp_enrollments', {
        email: user.email, name: user.name, college: college || null, batch_id: batch.id, pod_id: podId, show_public: true
      }))[0];
    }
    return { status: 200, body: await buildMe(enrollment, user) };
  }

  async function actionSubmit(req) {
    const user = await requireUser(req);
    const body = req.body || {};
    const n = Number(body.milestone);
    const milestone = milestoneByN[n];
    if (!milestone) throw httpError(400, 'Unknown milestone.');
    const enrollment = await findEnrollment(user.email);
    if (!enrollment) throw httpError(403, 'Join Launchpad first.');

    if (n > 1) {
      const prev = await db.select('lp_submissions', { eq: { enrollment_id: enrollment.id, milestone: n - 1, status: 'passed' }, limit: 1 });
      if (!prev.length) throw httpError(403, `Pass week ${n - 1} first. Each week opens when the one before it is passed.`);
    }
    const existing = await db.select('lp_submissions', { eq: { enrollment_id: enrollment.id, milestone: n }, order: ['created_at', 'desc'], limit: 50 });
    if (existing.some((s) => s.status === 'passed')) throw httpError(409, 'You have already passed this milestone.');
    const dayAgo = now() - 86400000;
    if (existing.filter((s) => Date.parse(s.created_at) > dayAgo).length >= 5) {
      throw httpError(429, 'You have submitted this milestone five times today. Try again tomorrow, and use the feedback you already have.');
    }

    const check = L.validateAnswers(milestone, body.answers);
    if (!check.ok) throw httpError(400, 'Some answers need attention.', { fields: check.errors });

    let submission = (await db.insert('lp_submissions', { enrollment_id: enrollment.id, milestone: n, answers: check.clean, status: 'pending', created_at: new Date(now()).toISOString() }))[0];
    submission = await scoreAndStore(submission, milestone);
    return { status: 200, body: { submission: summarise(submission), reviewedByAi: submission.scored_by === 'ai' } };
  }

  async function actionSettings(req) {
    const user = await requireUser(req);
    const enrollment = await findEnrollment(user.email);
    if (!enrollment) throw httpError(403, 'Join Launchpad first.');
    const body = req.body || {};
    const patch = {};
    if (typeof body.showPublic === 'boolean') patch.show_public = body.showPublic;
    if (typeof body.college === 'string') patch.college = body.college.trim().slice(0, 120) || null;
    if (Object.keys(patch).length) await db.update('lp_enrollments', { eq: { id: enrollment.id } }, patch);
    return { status: 200, body: await buildMe(Object.assign({}, enrollment, patch), user) };
  }

  // ---------- admin ----------

  async function actionAdminOverview(req) {
    await requireAdmin(req);
    const [batches, pods, enrollments, pending, days, finalists] = await Promise.all([
      db.select('lp_batches', { order: ['starts_on', 'desc'] }),
      db.select('lp_pods'),
      db.select('lp_enrollments'),
      db.select('lp_submissions', { eq: { status: 'pending' }, order: ['created_at', 'asc'], limit: 200 }),
      db.select('lp_demo_days', { order: ['held_on', 'desc'] }),
      db.select('lp_finalists')
    ]);
    return {
      status: 200,
      body: {
        today: today(),
        nextIntake: L.nextIntake(today(), P.intakeDay),
        suggestedDemoDay: (() => { const t = today(); let y = Number(t.slice(0, 4)); let m = Number(t.slice(5, 7)); let d = L.lastSaturday(y, m); if (d < t) { m += 1; if (m > 12) { m = 1; y += 1; } d = L.lastSaturday(y, m); } return d; })(),
        aiReview: !!ai.enabled,
        batches: batches.map((b) => ({
          id: b.id, name: b.name, startsOn: b.starts_on,
          founders: enrollments.filter((e) => e.batch_id === b.id).length,
          pods: pods.filter((p) => p.batch_id === b.id).map((p) => ({ id: p.id, name: p.name, lead: p.lead_email || null, members: enrollments.filter((e) => e.pod_id === p.id).map((e) => ({ id: e.id, name: e.name, email: e.email, college: e.college })) }))
        })),
        pending: pending.map((s) => {
          const e = enrollments.find((x) => x.id === s.enrollment_id) || {};
          const m = milestoneByN[s.milestone];
          return { id: s.id, milestone: s.milestone, title: m ? m.title : '', founder: e.name, email: e.email, createdAt: s.created_at, answers: s.answers, fields: m ? m.fields.map((f) => ({ id: f.id, label: f.label })) : [] };
        }),
        demoDays: days.map((d) => ({ id: d.id, heldOn: d.held_on, title: d.title, streamUrl: d.stream_url, status: d.status, finalists: finalists.filter((f) => f.demo_day_id === d.id).length })),
        slots: P.demoDaySlots
      }
    };
  }

  async function actionAdminReview(req) {
    const admin = await requireAdmin(req);
    const b = req.body || {};
    if (!['passed', 'needs_work'].includes(b.status)) throw httpError(400, 'Status must be passed or needs_work.');
    const rows = await db.update('lp_submissions', { eq: { id: b.submissionId } }, {
      status: b.status,
      feedback: String(b.feedback || '').slice(0, 1500) || null,
      scored_by: admin.email,
      scored_at: new Date(now()).toISOString()
    });
    if (!rows[0]) throw httpError(404, 'Submission not found.');
    return { status: 200, body: { ok: true } };
  }

  async function actionAdminRescore(req) {
    await requireAdmin(req);
    if (!ai.enabled) throw httpError(400, 'AI review is not configured. Add ANTHROPIC_API_KEY in Vercel.');
    const sub = (await db.select('lp_submissions', { eq: { id: (req.body || {}).submissionId } }))[0];
    if (!sub) throw httpError(404, 'Submission not found.');
    const out = await scoreAndStore(sub, milestoneByN[sub.milestone]);
    return { status: 200, body: { submission: summarise(out) } };
  }

  async function actionAdminDemoDay(req) {
    await requireAdmin(req);
    const b = req.body || {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.heldOn || ''))) throw httpError(400, 'Enter the date as YYYY-MM-DD.');
    const row = { held_on: b.heldOn, title: String(b.title || '').slice(0, 120) || null, stream_url: String(b.streamUrl || '').slice(0, 500) || null, status: b.status === 'done' ? 'done' : 'upcoming' };
    if (b.id) {
      const out = await db.update('lp_demo_days', { eq: { id: b.id } }, row);
      if (!out[0]) throw httpError(404, 'Demo Day not found.');
      return { status: 200, body: { demoDay: out[0] } };
    }
    return { status: 200, body: { demoDay: (await db.insert('lp_demo_days', row))[0] } };
  }

  async function eligibleFounders(demoDayId) {
    const [enrollments, subs, rankings, finalists] = await Promise.all([
      db.select('lp_enrollments'),
      db.select('lp_submissions'),
      db.select('lp_rankings'),
      db.select('lp_finalists')
    ]);
    const finalistIds = new Set(finalists.map((f) => f.enrollment_id));
    const out = [];
    enrollments.forEach((e) => {
      const mine = subs.filter((s) => s.enrollment_id === e.id);
      if (!L.demoEligible(mine)) return;
      const earlier = rankings.filter((r) => r.enrollment_id === e.id && String(r.demo_day_id) !== String(demoDayId));
      const thisDay = rankings.find((r) => r.enrollment_id === e.id && String(r.demo_day_id) === String(demoDayId));
      const thisFinalist = finalists.some((f) => f.enrollment_id === e.id && String(f.demo_day_id) === String(demoDayId));
      // A founder is ranked for their first Demo Day plus the carry-over window, and never again once they have pitched.
      if (finalistIds.has(e.id) && !thisFinalist) return;
      if (earlier.length > P.carryOverDemoDays) return;
      out.push({
        enrollmentId: e.id, name: e.name, email: e.email, college: e.college || null,
        passed: L.passedSet(mine).size, rankedBefore: earlier.length,
        ranking: thisDay ? { scores: thisDay.scores, total: thisDay.total, notes: thisDay.notes, interviewNotes: thisDay.interview_notes } : null,
        finalist: thisFinalist
      });
    });
    out.sort((a, b) => ((b.ranking ? Number(b.ranking.total) : -1) - (a.ranking ? Number(a.ranking.total) : -1)) || a.name.localeCompare(b.name));
    return out;
  }

  async function actionAdminRankCandidates(req) {
    await requireAdmin(req);
    const demoDayId = (req.query || {}).demoDayId;
    if (!demoDayId) throw httpError(400, 'Choose a Demo Day first.');
    return { status: 200, body: { candidates: await eligibleFounders(demoDayId), poolMin: P.interviewPoolMin, poolMax: P.interviewPoolMax, slots: P.demoDaySlots } };
  }

  async function actionAdminRankOne(req) {
    await requireAdmin(req);
    if (!ai.enabled) throw httpError(400, 'AI ranking is not configured. Enter scores by hand, or add ANTHROPIC_API_KEY in Vercel.');
    const b = req.body || {};
    const enrollment = (await db.select('lp_enrollments', { eq: { id: b.enrollmentId } }))[0];
    if (!enrollment) throw httpError(404, 'Founder not found.');
    const subs = await db.select('lp_submissions', { eq: { enrollment_id: enrollment.id }, order: ['created_at', 'desc'] });
    const profile = {};
    content.milestones.forEach((m) => {
      const best = subs.find((s) => s.milestone === m.n && s.status === 'passed') || subs.find((s) => s.milestone === m.n);
      if (best) profile[`week ${m.n}: ${m.title}`] = best.answers;
    });
    const result = await ai.rankFounder(profile);
    const row = { demo_day_id: b.demoDayId, enrollment_id: enrollment.id, scores: result.scores, total: result.total, notes: result.notes };
    const saved = await db.upsert('lp_rankings', [row], ['demo_day_id', 'enrollment_id']);
    return { status: 200, body: { ranking: { scores: saved[0].scores, total: saved[0].total, notes: saved[0].notes } } };
  }

  async function actionAdminRankSave(req) {
    await requireAdmin(req);
    const b = req.body || {};
    const existing = (await db.select('lp_rankings', { eq: { demo_day_id: b.demoDayId, enrollment_id: b.enrollmentId } }))[0];
    const row = { demo_day_id: b.demoDayId, enrollment_id: b.enrollmentId };
    if (b.total !== undefined && b.total !== '') row.total = Math.max(0, Math.min(100, Number(b.total) || 0));
    if (b.interviewNotes !== undefined) row.interview_notes = String(b.interviewNotes).slice(0, 2000);
    if (b.notes !== undefined) row.notes = String(b.notes).slice(0, 2000);
    if (existing) await db.update('lp_rankings', { eq: { id: existing.id } }, row);
    else await db.insert('lp_rankings', row);
    return { status: 200, body: { ok: true } };
  }

  async function actionAdminFinalists(req) {
    await requireAdmin(req);
    const b = req.body || {};
    const ids = Array.isArray(b.enrollmentIds) ? b.enrollmentIds : [];
    if (ids.length > P.demoDaySlots) throw httpError(400, `A Demo Day has at most ${P.demoDaySlots} slots.`);
    const day = (await db.select('lp_demo_days', { eq: { id: b.demoDayId } }))[0];
    if (!day) throw httpError(404, 'Demo Day not found.');
    const rows = [];
    for (let i = 0; i < ids.length; i += 1) {
      const subs = await db.select('lp_submissions', { eq: { enrollment_id: ids[i], milestone: 8 }, order: ['created_at', 'desc'] });
      const final = subs.find((s) => s.status === 'passed') || subs[0];
      if (!final) throw httpError(400, `Founder ${ids[i]} has not submitted milestone 8.`);
      const a = final.answers || {};
      rows.push({ demo_day_id: day.id, enrollment_id: ids[i], position: i + 1, startup_name: a.startup_name || null, one_liner: a.one_liner || null, pitch_url: a.pitch_url || null, deck_url: a.deck_url || null, brief: a.brief || null });
    }
    await db.remove('lp_finalists', { eq: { demo_day_id: day.id } });
    if (rows.length) await db.insert('lp_finalists', rows);
    return { status: 200, body: { count: rows.length } };
  }

  async function actionAdminRebalance(req) {
    await requireAdmin(req);
    const b = req.body || {};
    const batch = (await db.select('lp_batches', { eq: { id: b.batchId } }))[0];
    if (!batch) throw httpError(404, 'Batch not found.');
    const members = await db.select('lp_enrollments', { eq: { batch_id: batch.id }, order: ['id', 'asc'] });
    const pods = await db.select('lp_pods', { eq: { batch_id: batch.id }, order: ['id', 'asc'] });
    const needed = L.podCount(members.length, P.podSizeMax);
    const targets = pods.slice(0, needed);
    while (targets.length < needed) {
      targets.push((await db.insert('lp_pods', { batch_id: batch.id, name: `Pod ${targets.length + 1}` }))[0]);
    }
    // Deal founders round-robin, spreading colleges, so pods end up evenly sized.
    const byCollege = members.slice().sort((a, b2) => String(a.college || '').localeCompare(String(b2.college || '')));
    for (let i = 0; i < byCollege.length; i += 1) {
      const pod = targets[i % needed];
      if (byCollege[i].pod_id !== pod.id) await db.update('lp_enrollments', { eq: { id: byCollege[i].id } }, { pod_id: pod.id });
    }
    for (const extra of pods.slice(needed)) await db.remove('lp_pods', { eq: { id: extra.id } });
    return { status: 200, body: { pods: needed, founders: members.length } };
  }


  // ---------- community ----------

  const POST_MAX = 500;

  async function actionPodWall(req) {
    const user = await requireUser(req);
    const enrollment = await findEnrollment(user.email);
    if (!enrollment) throw httpError(403, 'Join Launchpad first.');
    if (!enrollment.pod_id) return { status: 200, body: { feed: [] } };
    const members = await db.select('lp_enrollments', { eq: { pod_id: enrollment.pod_id } });
    const ids = members.map((m) => m.id);
    const [posts, passed] = await Promise.all([
      db.select('lp_posts', { eq: { pod_id: enrollment.pod_id }, order: ['created_at', 'desc'], limit: 40 }),
      ids.length ? db.select('lp_submissions', { in: { enrollment_id: ids }, eq: { status: 'passed' }, order: ['created_at', 'desc'], limit: 60 }) : Promise.resolve([])
    ]);
    const nameOf = (id) => { const m = members.find((x) => x.id === id); return !m ? 'Founder' : m.id === enrollment.id ? 'You' : L.publicName(m.name); };
    const seen = new Set();
    const events = [];
    passed.forEach((x) => {
      const key = x.enrollment_id + ':' + x.milestone;
      if (seen.has(key)) return;
      seen.add(key);
      events.push({ type: 'pass', name: nameOf(x.enrollment_id), milestone: x.milestone, title: (milestoneByN[x.milestone] || {}).title || '', createdAt: x.scored_at || x.created_at });
    });
    const talk = posts.map((x) => ({ type: 'post', id: x.id, name: nameOf(x.enrollment_id), body: x.body, createdAt: x.created_at, mine: x.enrollment_id === enrollment.id }));
    const feed = events.concat(talk).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 50);
    return { status: 200, body: { feed } };
  }

  async function actionPost(req) {
    const user = await requireUser(req);
    const enrollment = await findEnrollment(user.email);
    if (!enrollment || !enrollment.pod_id) throw httpError(403, 'Join Launchpad first.');
    const text = String((req.body || {}).body || '').replace(/\s+/g, ' ').trim();
    if (text.length < 2) throw httpError(400, 'Write a few words first.');
    if (text.length > POST_MAX) throw httpError(400, `Keep it under ${POST_MAX} characters.`);
    const mine = await db.select('lp_posts', { eq: { enrollment_id: enrollment.id }, order: ['created_at', 'desc'], limit: 20 });
    const dayAgo = now() - 86400000;
    if (mine.filter((x) => Date.parse(x.created_at) > dayAgo).length >= 10) throw httpError(429, 'That is plenty for today. Try again tomorrow.');
    await db.insert('lp_posts', { enrollment_id: enrollment.id, pod_id: enrollment.pod_id, body: text, created_at: new Date(now()).toISOString() });
    return actionPodWall(req);
  }

  async function actionPostDelete(req) {
    const user = await requireUser(req);
    const id = (req.body || {}).id;
    const post = (await db.select('lp_posts', { eq: { id } }))[0];
    if (!post) throw httpError(404, 'Post not found.');
    const enrollment = await findEnrollment(user.email);
    const isOwner = enrollment && enrollment.id === post.enrollment_id;
    if (!isOwner && !adminEmails.includes(user.email)) throw httpError(403, 'You can only delete your own posts.');
    await db.remove('lp_posts', { eq: { id } });
    return { status: 200, body: { ok: true } };
  }

  async function actionWins() {
    const [passed, enrollments] = await Promise.all([
      db.select('lp_submissions', { eq: { status: 'passed' }, order: ['created_at', 'desc'], limit: 150 }),
      db.select('lp_enrollments', { eq: { show_public: true } })
    ]);
    const seen = new Set();
    const wins = [];
    passed.forEach((x) => {
      const e = enrollments.find((r) => r.id === x.enrollment_id);
      const key = x.enrollment_id + ':' + x.milestone;
      if (!e || seen.has(key)) return;
      seen.add(key);
      wins.push({ name: L.publicName(e.name), college: e.college || null, milestone: x.milestone, title: (milestoneByN[x.milestone] || {}).title || '', at: x.scored_at || x.created_at });
    });
    return { status: 200, cache: 30, body: { wins: wins.slice(0, 30) } };
  }

  const routes = {
    'GET program': actionProgram,
    'GET leaderboard': actionLeaderboard,
    'GET demo-day': actionDemoDay,
    'GET me': actionMe,
    'POST enroll': actionEnroll,
    'POST submit': actionSubmit,
    'POST settings': actionSettings,
    'GET pod-wall': actionPodWall,
    'POST post': actionPost,
    'POST post-delete': actionPostDelete,
    'GET wins': actionWins,
    'GET admin-overview': actionAdminOverview,
    'POST admin-review': actionAdminReview,
    'POST admin-rescore': actionAdminRescore,
    'POST admin-demoday': actionAdminDemoDay,
    'GET admin-rank-candidates': actionAdminRankCandidates,
    'POST admin-rank-one': actionAdminRankOne,
    'POST admin-rank-save': actionAdminRankSave,
    'POST admin-finalists': actionAdminFinalists,
    'POST admin-rebalance': actionAdminRebalance
  };

  return async function handler(req, res) {
    const send = (status, body, cache) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', cache ? `public, s-maxage=${cache}, stale-while-revalidate=300` : 'no-store');
      res.status(status).send(JSON.stringify(body));
    };
    try {
      const action = String((req.query || {}).action || '');
      const route = routes[`${req.method} ${action}`];
      if (!route) return send(action ? 405 : 400, { error: 'Unknown request.' });
      const out = await route(req);
      return send(out.status, out.body, out.cache);
    } catch (err) {
      if (err && err.status && err.status < 500) return send(err.status, Object.assign({ error: err.message }, err.extra || {}));
      console.error('[lp]', err && err.message);
      return send(500, { error: 'Something went wrong on our side. Please try again.' });
    }
  };
}

module.exports = { createHandler };
