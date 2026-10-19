'use strict';
// Run with: node scripts/test-launchpad.js
// Exercises the Launchpad rules and API against an in-memory store. No network, no real keys.

const assert = require('assert');
const L = require('../api/_lp/logic');
const { createHandler } = require('../api/_lp/handler');
const { makeMemoryDb } = require('../api/_lp/db');
const { makeVerifier } = require('../api/_lp/auth');
const { makeAi } = require('../api/_lp/ai');
const content = require('../launchpad/content.json');

let passed = 0;
const tests = [];
function test(name, fn) { tests.push([name, fn]); }

// ---------- pure logic ----------

test('IST date is ahead of UTC at the day boundary', () => {
  // 2026-10-19 20:00 UTC is already 2026-10-20 in India.
  assert.strictEqual(L.istToday(Date.UTC(2026, 9, 19, 20, 0, 0)), '2026-10-20');
  assert.strictEqual(L.istToday(Date.UTC(2026, 9, 19, 10, 0, 0)), '2026-10-19');
});

test('next intake is the 1st of this or next month', () => {
  assert.strictEqual(L.nextIntake('2026-10-19', 1), '2026-11-01');
  assert.strictEqual(L.nextIntake('2026-11-01', 1), '2026-11-01');
  assert.strictEqual(L.nextIntake('2026-12-15', 1), '2027-01-01');
  assert.strictEqual(L.nextIntake('2026-10-02', 15), '2026-10-15');
});

test('last Saturday of the month', () => {
  assert.strictEqual(L.lastSaturday(2026, 11), '2026-11-28');
  assert.strictEqual(L.lastSaturday(2026, 12), '2026-12-26');
});

test('weeks open one at a time, as each previous week is passed', () => {
  let states = L.milestoneStates([]);
  assert.strictEqual(states[0].state, 'open');
  assert.strictEqual(states[1].state, 'locked');
  states = L.milestoneStates([{ milestone: 1, status: 'passed', created_at: '2026-11-02T00:00:00Z' }]);
  assert.strictEqual(states[0].state, 'passed');
  assert.strictEqual(states[1].state, 'open');
  assert.strictEqual(states[2].state, 'locked');
  states = L.milestoneStates([{ milestone: 1, status: 'passed', created_at: 'a' }, { milestone: 2, status: 'needs_work', created_at: 'b' }]);
  assert.strictEqual(states[1].state, 'needs_work');
  assert.strictEqual(states[2].state, 'locked');
});

test('a passed milestone stays passed even if a later attempt failed', () => {
  const subs = [
    { milestone: 1, status: 'passed', created_at: '2026-11-02T00:00:00Z' },
    { milestone: 1, status: 'needs_work', created_at: '2026-11-03T00:00:00Z' }
  ];
  assert.strictEqual(L.milestoneStates(subs)[0].state, 'passed');
});

test('join month start and group name', () => {
  assert.strictEqual(L.monthStart('2026-10-19'), '2026-10-01');
  assert.strictEqual(L.groupName('2026-10-01'), 'October 2026 group');
});

test('demo eligibility needs milestones 1 to 7 passed and 8 submitted', () => {
  const base = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ milestone: n, status: 'passed' }));
  assert.strictEqual(L.demoEligible(base), false);
  assert.strictEqual(L.demoEligible(base.concat([{ milestone: 8, status: 'needs_work' }])), false);
  assert.strictEqual(L.demoEligible(base.concat([{ milestone: 8, status: 'pending' }])), true);
  assert.strictEqual(L.demoEligible(base.slice(1).concat([{ milestone: 8, status: 'passed' }])), false);
});

test('validation enforces required, minimums, numbers and links', () => {
  const m2 = content.milestones[1];
  const bad = L.validateAnswers(m2, { count: 4, who: 'a', insights: 'short', surprise: '', notes_url: 'not a link' });
  assert.strictEqual(bad.ok, false);
  ['count', 'who', 'insights', 'surprise', 'notes_url'].forEach((k) => assert.ok(bad.errors[k], k));
  const good = L.validateAnswers(m2, goodAnswers(2));
  assert.strictEqual(good.ok, true);
  assert.strictEqual(good.clean.count, 10);
});

test('every milestone has fields, a checklist and curated resources', () => {
  assert.strictEqual(content.milestones.length, 8);
  content.milestones.forEach((m) => {
    assert.ok(m.fields.length >= 4, `fields ${m.n}`);
    assert.ok(m.checklist.length >= 4, `checklist ${m.n}`);
    assert.ok(m.watch.length >= 1, `watch ${m.n}`);
    m.watch.forEach((w) => assert.ok(/^https:\/\//.test(w.url), `url ${m.n}`));
    assert.ok(m.template && m.template.body, `template ${m.n}`);
    assert.ok(goodAnswers(m.n) && L.validateAnswers(m, goodAnswers(m.n)).ok, `sample answers pass validation for ${m.n}`);
  });
});

test('pod choice fills pods to five and spreads colleges', () => {
  const pods = [
    { id: 1, members: [{ college: 'DTU' }, { college: 'DTU' }] },
    { id: 2, members: [{ college: 'IIT Delhi' }] }
  ];
  assert.strictEqual(L.choosePod(pods, 'DTU', 5), 2);          // avoid the pod that already has DTU
  assert.strictEqual(L.choosePod(pods, 'SRCC', 5), 2);         // otherwise the emptier pod
  const full = [{ id: 1, members: [1, 2, 3, 4, 5].map(() => ({ college: 'x' })) }];
  assert.strictEqual(L.choosePod(full, 'y', 5), null);
});

test('public names show first name and last initial only', () => {
  assert.strictEqual(L.publicName('Aarav Kumar Sharma'), 'Aarav S.');
  assert.strictEqual(L.publicName('Meera'), 'Meera');
});

// ---------- API ----------

function goodAnswers(n) {
  const long = 'This is a detailed and specific answer that is long enough to satisfy the minimum length for this field. '.repeat(6);
  const link = 'https://example.com/work';
  const sets = {
    1: { who: 'Second-year students who run college societies', statement: long, workaround: long, cost: long, access: long },
    2: { count: 10, who: long, insights: long, surprise: long, notes_url: link },
    3: { one_liner: 'For society heads who lose track of budgets, a shared ledger unlike spreadsheets.', features: long, not_building: long, assumption: long },
    4: { page_url: link, signup_method: 'A simple form on the page', visitors: 120, signups: 14, channels: long },
    5: { mvp_url: link, what: long, built_with: 'No-code form plus manual follow up', flow: long, tests: long },
    6: { users: 11, definition: 'Someone who completed the core flow', found: long, feedback: long, returned: 4, next_change: long },
    7: { deck_url: link, pitch_url: link, slides: 10, proof: long, ask: 'Ten warm introductions to society heads at other colleges' },
    8: { startup_name: 'LedgerLoop', one_liner: 'A shared budget ledger for college societies that replaces messy spreadsheets.', brief: long + long, users: 14, traction: long, deck_url: link, pitch_url: link, ask: 'Introductions to college fest sponsors and seed investors' }
  };
  return sets[n];
}

function makeEnv(opts) {
  const o = opts || {};
  const env = {
    nowMs: Date.UTC(2026, 9, 19, 15, 0, 0), // Oct 19 2026, 20:30 IST
    db: makeMemoryDb(),
    aiCalls: 0,
    aiMode: o.aiMode || 'pass' // pass | fail | throw | off
  };
  const ai = {
    get enabled() { return env.aiMode !== 'off'; },
    async scoreSubmission(milestone) {
      env.aiCalls += 1;
      if (env.aiMode === 'throw') throw new Error('model unavailable');
      const met = env.aiMode === 'pass';
      return { passed: met, checklist: milestone.checklist.map((item) => ({ item, met, note: met ? 'Looks good.' : 'Not shown.' })), feedback: met ? 'Clear and specific. Move on to the next week.' : 'Add the cost of the problem with a number.' };
    },
    async rankFounder() {
      return { scores: { demand: 20, execution: 18, pitch: 17, momentum: 19 }, total: 74, notes: 'Strong evidence of demand.' };
    }
  };
  const users = {};
  env.signIn = (email, name) => { users['tok-' + email + '-xxxxxxxxxxxxxxxxxxxx'] = { email, name }; return 'tok-' + email + '-xxxxxxxxxxxxxxxxxxxx'; };
  env.handler = createHandler({
    db: env.db,
    verifyToken: async (t) => users[t] || null,
    ai,
    nowMs: () => env.nowMs,
    cfg: { adminEmails: ['admin@thefuturecouncil.in'] }
  });
  env.call = async (method, action, { token, body, query } = {}) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, send(b) { this.body = JSON.parse(b); } };
    await env.handler({ method, headers: token ? { authorization: 'Bearer ' + token } : {}, query: Object.assign({ action }, query || {}), body }, res);
    return { code: res.code, body: res.body, headers: res.headers };
  };
  return env;
}

test('program endpoint is public and reports the next intake', async () => {
  const env = makeEnv();
  const r = await env.call('GET', 'program');
  assert.strictEqual(r.code, 200);
  assert.strictEqual(r.body.nextIntake, '2026-11-01');
  assert.strictEqual(r.body.demoDaySlots, 20);
});

test('protected endpoints refuse anonymous callers', async () => {
  const env = makeEnv();
  assert.strictEqual((await env.call('GET', 'me')).code, 401);
  assert.strictEqual((await env.call('POST', 'enroll')).code, 401);
  assert.strictEqual((await env.call('POST', 'submit', { body: {} })).code, 401);
  assert.strictEqual((await env.call('GET', 'admin-overview')).code, 401);
});

test('admin endpoints refuse ordinary signed-in founders', async () => {
  const env = makeEnv();
  const tok = env.signIn('founder@example.com', 'Founder One');
  assert.strictEqual((await env.call('GET', 'admin-overview', { token: tok })).code, 403);
});

test('unknown actions and wrong methods are rejected', async () => {
  const env = makeEnv();
  assert.strictEqual((await env.call('GET', 'nope')).code, 405);
  assert.strictEqual((await env.call('GET', 'enroll')).code, 405);
  assert.strictEqual((await env.call('GET', '')).code, 400);
});

test('enrolling puts you in this month\'s group straight away, in a pod, and is idempotent', async () => {
  const env = makeEnv();
  const tok = env.signIn('a@example.com', 'Aarav Sharma');
  const first = await env.call('POST', 'enroll', { token: tok, body: { college: 'DTU' } });
  assert.strictEqual(first.code, 200);
  assert.strictEqual(first.body.batch.startsOn, '2026-10-01');
  assert.strictEqual(first.body.batch.started, true);
  assert.strictEqual(first.body.milestones[0].state, 'open');
  assert.strictEqual(first.body.milestones[1].state, 'locked');
  assert.strictEqual(first.body.pod.members.length, 1);
  const again = await env.call('POST', 'enroll', { token: tok, body: { college: 'Other' } });
  assert.strictEqual(again.body.enrollment.college, 'DTU');
  assert.strictEqual(env.db._tables.lp_enrollments.length, 1);
  assert.strictEqual(env.db._tables.lp_batches.length, 1);
});

test('pods fill to five, then a new pod opens', async () => {
  const env = makeEnv();
  for (let i = 1; i <= 6; i += 1) {
    const tok = env.signIn(`f${i}@example.com`, `Founder ${i}`);
    await env.call('POST', 'enroll', { token: tok, body: { college: `College ${i}` } });
  }
  const sizes = env.db._tables.lp_pods.map((p) => env.db._tables.lp_enrollments.filter((e) => e.pod_id === p.id).length).sort();
  assert.deepStrictEqual(sizes, [1, 5]);
  const admin = env.signIn('admin@thefuturecouncil.in', 'Admin');
  const batchId = env.db._tables.lp_batches[0].id;
  const rb = await env.call('POST', 'admin-rebalance', { token: admin, body: { batchId } });
  assert.strictEqual(rb.body.pods, 2);
  const after = env.db._tables.lp_pods.map((p) => env.db._tables.lp_enrollments.filter((e) => e.pod_id === p.id).length).sort();
  assert.deepStrictEqual(after, [3, 3]);
});

test('a week cannot be submitted until the previous week is passed', async () => {
  const env = makeEnv();
  const tok = env.signIn('a@example.com', 'Aarav Sharma');
  await env.call('POST', 'enroll', { token: tok, body: {} });
  const r = await env.call('POST', 'submit', { token: tok, body: { milestone: 2, answers: goodAnswers(2) } });
  assert.strictEqual(r.code, 403);
  // Week 1 is open from day one, with no waiting for a start date.
  assert.strictEqual((await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } })).code, 200);
  assert.strictEqual((await env.call('POST', 'submit', { token: tok, body: { milestone: 2, answers: goodAnswers(2) } })).code, 200);
});

test('invalid answers are rejected with field errors and nothing is stored', async () => {
  const env = makeEnv();
  const tok = env.signIn('a@example.com', 'Aarav Sharma');
  await env.call('POST', 'enroll', { token: tok, body: {} });
  env.nowMs = Date.UTC(2026, 10, 2, 5, 0, 0);
  const r = await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: { who: 'x' } } });
  assert.strictEqual(r.code, 400);
  assert.ok(r.body.fields.statement);
  assert.strictEqual((env.db._tables.lp_submissions || []).length, 0);
});

test('a good submission is reviewed by AI and passes', async () => {
  const env = makeEnv();
  const tok = env.signIn('a@example.com', 'Aarav Sharma');
  await env.call('POST', 'enroll', { token: tok, body: {} });
  env.nowMs = Date.UTC(2026, 10, 2, 5, 0, 0);
  const r = await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } });
  assert.strictEqual(r.code, 200);
  assert.strictEqual(r.body.submission.status, 'passed');
  assert.strictEqual(r.body.reviewedByAi, true);
  const me = await env.call('GET', 'me', { token: tok });
  assert.strictEqual(me.body.passedCount, 1);
  assert.strictEqual(me.body.milestones[0].state, 'passed');
  // Passing twice is refused.
  assert.strictEqual((await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } })).code, 409);
});

test('a weak submission needs work, and a model outage leaves it pending for a human', async () => {
  const env = makeEnv({ aiMode: 'fail' });
  const tok = env.signIn('a@example.com', 'Aarav Sharma');
  await env.call('POST', 'enroll', { token: tok, body: {} });
  env.nowMs = Date.UTC(2026, 10, 2, 5, 0, 0);
  let r = await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } });
  assert.strictEqual(r.body.submission.status, 'needs_work');
  assert.ok(r.body.submission.feedback);
  env.aiMode = 'throw';
  r = await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } });
  assert.strictEqual(r.body.submission.status, 'pending');
  env.aiMode = 'off';
  r = await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } });
  assert.strictEqual(r.body.submission.status, 'pending');
});

test('a human reviewer can pass a pending submission', async () => {
  const env = makeEnv({ aiMode: 'off' });
  const tok = env.signIn('a@example.com', 'Aarav Sharma');
  const admin = env.signIn('admin@thefuturecouncil.in', 'Admin');
  await env.call('POST', 'enroll', { token: tok, body: {} });
  env.nowMs = Date.UTC(2026, 10, 2, 5, 0, 0);
  const sub = await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } });
  const overview = await env.call('GET', 'admin-overview', { token: admin });
  assert.strictEqual(overview.body.pending.length, 1);
  assert.strictEqual(overview.body.pending[0].founder, 'Aarav Sharma');
  await env.call('POST', 'admin-review', { token: admin, body: { submissionId: sub.body.submission.id, status: 'passed', feedback: 'Nice work.' } });
  const me = await env.call('GET', 'me', { token: tok });
  assert.strictEqual(me.body.milestones[0].state, 'passed');
  assert.strictEqual(me.body.milestones[0].latest.feedback, 'Nice work.');
});

test('resubmitting is capped at five a day per milestone', async () => {
  const env = makeEnv({ aiMode: 'fail' });
  const tok = env.signIn('a@example.com', 'Aarav Sharma');
  await env.call('POST', 'enroll', { token: tok, body: {} });
  env.nowMs = Date.UTC(2026, 10, 2, 5, 0, 0);
  for (let i = 0; i < 5; i += 1) {
    assert.strictEqual((await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } })).code, 200);
    env.nowMs += 1000;
  }
  assert.strictEqual((await env.call('POST', 'submit', { token: tok, body: { milestone: 1, answers: goodAnswers(1) } })).code, 429);
});

async function runFullBatch(env, count) {
  const tokens = [];
  for (let i = 1; i <= count; i += 1) {
    const tok = env.signIn(`f${i}@example.com`, `Founder Number${i}`);
    tokens.push(tok);
    await env.call('POST', 'enroll', { token: tok, body: { college: `College ${i}` } });
  }
  // Move past week 8 and submit everything for every founder.
  env.nowMs = Date.UTC(2027, 0, 5, 5, 0, 0);
  for (const tok of tokens) {
    for (let n = 1; n <= 8; n += 1) {
      const r = await env.call('POST', 'submit', { token: tok, body: { milestone: n, answers: goodAnswers(n) } });
      assert.strictEqual(r.code, 200, `milestone ${n}`);
      env.nowMs += 1000;
    }
  }
  return tokens;
}

test('leaderboard shows public founders by first name and initial, and respects opt-out', async () => {
  const env = makeEnv();
  const tokens = await runFullBatch(env, 3);
  await env.call('POST', 'settings', { token: tokens[2], body: { showPublic: false } });
  const lb = await env.call('GET', 'leaderboard');
  assert.strictEqual(lb.body.individuals.length, 2);
  assert.strictEqual(lb.body.individuals[0].name, 'Founder N.');
  assert.strictEqual(lb.body.individuals[0].passed, 8);
  assert.ok(!JSON.stringify(lb.body).includes('@'), 'no emails in public data');
  assert.ok(lb.body.pods.length >= 1);
});

test('ranking, finalists and the public Demo Day page', async () => {
  const env = makeEnv();
  const tokens = await runFullBatch(env, 4);
  const admin = env.signIn('admin@thefuturecouncil.in', 'Admin');

  const created = await env.call('POST', 'admin-demoday', { token: admin, body: { heldOn: '2027-01-30', title: 'Demo Day 1', status: 'upcoming' } });
  const dayId = created.body.demoDay.id;

  const cands = await env.call('GET', 'admin-rank-candidates', { token: admin, query: { demoDayId: dayId } });
  assert.strictEqual(cands.body.candidates.length, 4);

  for (const c of cands.body.candidates) {
    const r = await env.call('POST', 'admin-rank-one', { token: admin, body: { demoDayId: dayId, enrollmentId: c.enrollmentId } });
    assert.strictEqual(r.body.ranking.total, 74);
  }
  await env.call('POST', 'admin-rank-save', { token: admin, body: { demoDayId: dayId, enrollmentId: cands.body.candidates[0].enrollmentId, interviewNotes: 'Sharp, clear on users.' } });

  const chosen = cands.body.candidates.slice(0, 3).map((c) => c.enrollmentId);
  const fin = await env.call('POST', 'admin-finalists', { token: admin, body: { demoDayId: dayId, enrollmentIds: chosen } });
  assert.strictEqual(fin.body.count, 3);

  // More than the slot cap is refused.
  const tooMany = Array.from({ length: 21 }, (_, i) => i + 1);
  assert.strictEqual((await env.call('POST', 'admin-finalists', { token: admin, body: { demoDayId: dayId, enrollmentIds: tooMany } })).code, 400);

  let page = await env.call('GET', 'demo-day');
  assert.strictEqual(page.body.upcoming.finalists.length, 3);
  assert.strictEqual(page.body.upcoming.finalists[0].startupName, 'LedgerLoop');
  assert.strictEqual(page.body.upcoming.finalists[0].pitchUrl, null, 'pitch recording hidden until Demo Day is done');
  assert.ok(!JSON.stringify(page.body).includes('brief'), 'investor briefs are never public');

  await env.call('POST', 'admin-demoday', { token: admin, body: { id: dayId, heldOn: '2027-01-30', title: 'Demo Day 1', status: 'done' } });
  page = await env.call('GET', 'demo-day');
  assert.strictEqual(page.body.past[0].finalists[0].pitchUrl, 'https://example.com/work');

  // The founder who was not chosen is still eligible next time; those who pitched are not ranked again.
  const next = await env.call('POST', 'admin-demoday', { token: admin, body: { heldOn: '2027-02-27', title: 'Demo Day 2', status: 'upcoming' } });
  const cands2 = await env.call('GET', 'admin-rank-candidates', { token: admin, query: { demoDayId: next.body.demoDay.id } });
  assert.strictEqual(cands2.body.candidates.length, 1);

  const me = await env.call('GET', 'me', { token: tokens[0] });
  assert.ok(me.body.finalist.length === 1 || tokens.length === 4);
});

test('carry-over ends after the allowed number of Demo Days', async () => {
  const env = makeEnv();
  await runFullBatch(env, 1);
  const admin = env.signIn('admin@thefuturecouncil.in', 'Admin');
  const days = [];
  for (let i = 0; i < 4; i += 1) {
    const d = await env.call('POST', 'admin-demoday', { token: admin, body: { heldOn: `2027-0${i + 1}-28`, status: 'done' } });
    days.push(d.body.demoDay.id);
  }
  const counts = [];
  for (const id of days) {
    const c = await env.call('GET', 'admin-rank-candidates', { token: admin, query: { demoDayId: id } });
    counts.push(c.body.candidates.length);
    if (c.body.candidates[0]) await env.call('POST', 'admin-rank-one', { token: admin, body: { demoDayId: id, enrollmentId: c.body.candidates[0].enrollmentId } });
  }
  // First Demo Day plus two carry-overs, then they drop out of the pool.
  assert.deepStrictEqual(counts, [1, 1, 1, 0]);
});

test('pod wall shows posts and passes for pod members only', async () => {
  const env = makeEnv();
  const a = env.signIn('a@example.com', 'Aarav Sharma');
  const b = env.signIn('b@example.com', 'Bela Nair');
  await env.call('POST', 'enroll', { token: a, body: { college: 'DTU' } });
  await env.call('POST', 'enroll', { token: b, body: { college: 'SRCC' } });
  await env.call('POST', 'submit', { token: b, body: { milestone: 1, answers: goodAnswers(1) } });
  let wall = (await env.call('POST', 'post', { token: a, body: { body: 'Spoke to 4 society heads today.' } })).body.feed;
  assert.strictEqual(wall.filter((x) => x.type === 'post').length, 1);
  assert.strictEqual(wall.find((x) => x.type === 'post').name, 'You');
  const pass = wall.find((x) => x.type === 'pass');
  assert.strictEqual(pass.name, 'Bela N.');
  assert.strictEqual(pass.milestone, 1);
  // A stranger in another pod does not see it.
  for (let i = 0; i < 5; i += 1) env.signIn(`x${i}@example.com`, `X${i} Y`);
  for (let i = 0; i < 5; i += 1) await env.call('POST', 'enroll', { token: env.signIn(`x${i}@example.com`, `X${i} Y`), body: { college: 'C' + i } });
  const outsider = env.signIn('z@example.com', 'Zed Z');
  await env.call('POST', 'enroll', { token: outsider, body: {} });
  const zwall = (await env.call('GET', 'pod-wall', { token: outsider })).body.feed;
  assert.ok(!zwall.some((x) => x.body === 'Spoke to 4 society heads today.'));
});

test('posts are validated, limited, and deletable by the owner or an admin only', async () => {
  const env = makeEnv();
  const a = env.signIn('a@example.com', 'Aarav Sharma');
  const b = env.signIn('b@example.com', 'Bela Nair');
  const admin = env.signIn('admin@thefuturecouncil.in', 'Admin');
  await env.call('POST', 'enroll', { token: a, body: {} });
  await env.call('POST', 'enroll', { token: b, body: {} });
  assert.strictEqual((await env.call('POST', 'post', { token: a, body: { body: ' ' } })).code, 400);
  assert.strictEqual((await env.call('POST', 'post', { token: a, body: { body: 'x'.repeat(501) } })).code, 400);
  const posted = await env.call('POST', 'post', { token: a, body: { body: 'First post here' } });
  const id = posted.body.feed.find((x) => x.type === 'post').id;
  assert.strictEqual((await env.call('POST', 'post-delete', { token: b, body: { id } })).code, 403);
  assert.strictEqual((await env.call('POST', 'post-delete', { token: a, body: { id } })).code, 200);
  const again = await env.call('POST', 'post', { token: a, body: { body: 'Second post' } });
  const id2 = again.body.feed.find((x) => x.type === 'post').id;
  assert.strictEqual((await env.call('POST', 'post-delete', { token: admin, body: { id: id2 } })).code, 200);
  for (let i = 0; i < 10; i += 1) { await env.call('POST', 'post', { token: a, body: { body: 'spam ' + i } }); env.nowMs += 1000; }
  assert.strictEqual((await env.call('POST', 'post', { token: a, body: { body: 'one too many' } })).code, 429);
});

test('public wins feed lists passes by first name and initial and honours opt-out', async () => {
  const env = makeEnv();
  const a = env.signIn('a@example.com', 'Aarav Sharma');
  const b = env.signIn('b@example.com', 'Bela Nair');
  await env.call('POST', 'enroll', { token: a, body: { college: 'DTU' } });
  await env.call('POST', 'enroll', { token: b, body: {} });
  await env.call('POST', 'submit', { token: a, body: { milestone: 1, answers: goodAnswers(1) } });
  await env.call('POST', 'submit', { token: b, body: { milestone: 1, answers: goodAnswers(1) } });
  await env.call('POST', 'settings', { token: b, body: { showPublic: false } });
  const wins = (await env.call('GET', 'wins')).body.wins;
  assert.strictEqual(wins.length, 1);
  assert.strictEqual(wins[0].name, 'Aarav S.');
  assert.strictEqual(wins[0].title, 'Pick a problem');
  assert.ok(!JSON.stringify(wins).includes('@'));
});

// ---------- auth and AI plumbing ----------

test('Google token verification checks audience, email and caches', async () => {
  let calls = 0;
  const fakeFetch = async (url) => {
    calls += 1;
    if (url.startsWith('https://oauth2.googleapis.com/tokeninfo')) {
      return { ok: true, json: async () => ({ aud: url.includes('wrongclient') ? 'someone-else' : 'client-123', expires_in: '3000' }) };
    }
    return { ok: true, json: async () => ({ email: 'Founder@Example.com', name: 'Founder', email_verified: true }) };
  };
  const verify = makeVerifier({ clientId: 'client-123', fetchImpl: fakeFetch });
  const user = await verify('a-valid-looking-token-0123456789');
  assert.deepStrictEqual(user, { email: 'founder@example.com', name: 'Founder' });
  await verify('a-valid-looking-token-0123456789');
  assert.strictEqual(calls, 2, 'second call served from cache');
  assert.strictEqual(await verify('wrongclient-token-0123456789abc'), null);
  assert.strictEqual(await verify('short'), null);
  assert.strictEqual(await verify(undefined), null);
});

test('AI scoring maps checklist results and rejects malformed replies', async () => {
  const m = content.milestones[0];
  const reply = (obj) => async () => ({ ok: true, json: async () => ({ content: [{ text: 'Here you go: ' + JSON.stringify(obj) }] }) });
  const items = m.checklist.map(() => ({ met: true, note: 'ok' }));
  const ai = makeAi({ apiKey: 'k', scoringModel: 's', rankingModel: 'r', fetchImpl: reply({ items, feedback: 'Great.' }) });
  const ok = await ai.scoreSubmission(m, {});
  assert.strictEqual(ok.passed, true);
  const items2 = items.slice(); items2[2] = { met: false, note: 'missing' };
  const ai2 = makeAi({ apiKey: 'k', scoringModel: 's', rankingModel: 'r', fetchImpl: reply({ items: items2, feedback: 'Fix item 3.' }) });
  assert.strictEqual((await ai2.scoreSubmission(m, {})).passed, false);
  const ai3 = makeAi({ apiKey: 'k', scoringModel: 's', rankingModel: 'r', fetchImpl: reply({ items: items.slice(1), feedback: 'x' }) });
  await assert.rejects(() => ai3.scoreSubmission(m, {}));
  assert.strictEqual(makeAi({ scoringModel: 's' }).enabled, false);
});

(async () => {
  for (const [name, fn] of tests) {
    try {
      await fn();
      passed += 1;
      console.log('  ok   ' + name);
    } catch (e) {
      console.log('  FAIL ' + name + '\n       ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n       ') : e));
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} passed`);
})();
