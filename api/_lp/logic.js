'use strict';
// Pure Launchpad rules. No network, no database, so everything here is easy to test.

const pad = (n) => String(n).padStart(2, '0');

// "Today" in India, as YYYY-MM-DD. The program runs on Indian dates.
function istToday(nowMs) {
  return new Date((nowMs === undefined ? Date.now() : nowMs) + 19800000).toISOString().slice(0, 10);
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// The next intake date on or after `todayIso`. A new batch starts on the intakeDay of every month.
function nextIntake(todayIso, intakeDay) {
  const day = intakeDay || 1;
  let y = Number(todayIso.slice(0, 4));
  let m = Number(todayIso.slice(5, 7));
  let candidate = `${y}-${pad(m)}-${pad(day)}`;
  if (candidate < todayIso) {
    m += 1;
    if (m > 12) { m = 1; y += 1; }
    candidate = `${y}-${pad(m)}-${pad(day)}`;
  }
  return candidate;
}

function monthName(iso) {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Number(iso.slice(5, 7)) - 1];
}

function batchName(startsOn) {
  return `${monthName(startsOn)} ${startsOn.slice(0, 4)} batch`;
}

// Last Saturday of a month (month is 1 to 12). Used only as a suggested default for the admin.
function lastSaturday(year, month) {
  const d = new Date(Date.UTC(year, month, 0)); // last day of the month
  while (d.getUTCDay() !== 6) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// One milestone unlocks each week. Milestone n opens at start + (n-1) weeks and is due when n+1 opens.
function milestoneStates(startsOn, todayIso, submissions) {
  const byMilestone = {};
  (submissions || []).forEach((s) => {
    (byMilestone[s.milestone] = byMilestone[s.milestone] || []).push(s);
  });
  const out = [];
  for (let n = 1; n <= 8; n += 1) {
    const unlocksOn = addDays(startsOn, (n - 1) * 7);
    const dueOn = addDays(startsOn, n * 7);
    const subs = (byMilestone[n] || []).slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const passed = subs.find((s) => s.status === 'passed');
    const latest = subs[0] || null;
    let state;
    if (todayIso < unlocksOn) state = 'locked';
    else if (passed) state = 'passed';
    else if (latest && latest.status === 'pending') state = 'pending';
    else if (latest && latest.status === 'needs_work') state = 'needs_work';
    else state = 'open';
    out.push({
      n,
      state,
      unlocksOn,
      dueOn,
      overdue: state !== 'passed' && state !== 'locked' && todayIso >= dueOn,
      attempts: subs.length,
      latest: latest ? {
        id: latest.id,
        status: latest.status,
        feedback: latest.feedback || null,
        checklist: latest.checklist || null,
        scoredBy: latest.scored_by || null,
        createdAt: latest.created_at,
        answers: latest.answers
      } : null
    });
  }
  return out;
}

function passedSet(submissions) {
  const s = new Set();
  (submissions || []).forEach((x) => { if (x.status === 'passed') s.add(x.milestone); });
  return s;
}

// A founder can be ranked for Demo Day once milestones 1 to 7 are passed and milestone 8 is submitted.
function demoEligible(submissions) {
  const passed = passedSet(submissions);
  for (let n = 1; n <= 7; n += 1) if (!passed.has(n)) return false;
  return (submissions || []).some((s) => s.milestone === 8 && (s.status === 'passed' || s.status === 'pending'));
}

const URL_RE = /^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]{2,}$/i;

function validateAnswers(milestone, answers) {
  const errors = {};
  const clean = {};
  const input = answers && typeof answers === 'object' ? answers : {};
  milestone.fields.forEach((f) => {
    const raw = input[f.id];
    const text = raw === undefined || raw === null ? '' : String(raw).trim();
    if (!text) {
      if (f.required) errors[f.id] = 'This field is required.';
      return;
    }
    if (f.type === 'number') {
      const num = Number(text);
      if (!Number.isFinite(num)) { errors[f.id] = 'Enter a number.'; return; }
      if (f.min !== undefined && num < f.min) { errors[f.id] = `Must be at least ${f.min}.`; return; }
      if (f.max !== undefined && num > f.max) { errors[f.id] = `Must be at most ${f.max}.`; return; }
      clean[f.id] = num;
      return;
    }
    if (f.type === 'url') {
      if (text.length > 500 || !URL_RE.test(text)) { errors[f.id] = 'Enter a full link starting with http:// or https://.'; return; }
      clean[f.id] = text;
      return;
    }
    const max = f.max || (f.type === 'textarea' ? 5000 : 500);
    if (f.min && text.length < f.min) { errors[f.id] = `Write at least ${f.min} characters (you have ${text.length}).`; return; }
    if (text.length > max) { errors[f.id] = `Keep this under ${max} characters.`; return; }
    clean[f.id] = text;
  });
  return { ok: Object.keys(errors).length === 0, errors, clean };
}

// Put a new founder in a pod: a pod with room, preferring one with nobody from the same college.
// `pods` is [{ id, members: [{ college }] }]. Returns a pod id, or null when a new pod is needed.
function choosePod(pods, college, maxSize) {
  const max = maxSize || 5;
  const open = (pods || []).filter((p) => p.members.length < max);
  if (!open.length) return null;
  const norm = (c) => String(c || '').trim().toLowerCase();
  const mine = norm(college);
  const score = (p) => {
    const sameCollege = mine ? p.members.filter((m) => norm(m.college) === mine).length : 0;
    return sameCollege * 100 + p.members.length;
  };
  open.sort((a, b) => score(a) - score(b) || a.id - b.id);
  return open[0].id;
}

// "Aarav Sharma" -> "Aarav S."
function publicName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Founder';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function podCount(members, maxSize) {
  return Math.max(1, Math.ceil(members / (maxSize || 5)));
}

module.exports = {
  istToday, addDays, nextIntake, monthName, batchName, lastSaturday,
  milestoneStates, passedSet, demoEligible, validateAnswers, choosePod, publicName, podCount
};
