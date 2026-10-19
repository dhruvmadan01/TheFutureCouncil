'use strict';
// Generates the Launchpad course pages and the app page shells from launchpad/content.json.
// Run: node scripts/build-launchpad.js
// Edit the course in launchpad/content.json, never in the generated HTML.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'launchpad/content.json'), 'utf8'));
const P = content.program;

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function write(rel, html) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function page({ title, description, path: urlPath, body, scripts, noindex }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} | Launchpad | The Future Council</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="https://thefuturecouncil.in${urlPath}" />
${noindex ? '  <meta name="robots" content="noindex" />\n' : ''}  <link rel="icon" href="/TFC.png" type="image/png" />
  <meta name="theme-color" content="#E2542A" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600&family=DM+Sans:opsz,wght@9..40,500;9..40,700&family=Instrument+Serif:ital@1&display=swap">
  <link rel="stylesheet" href="/tfc-theme.css" />
  <link rel="stylesheet" href="/tfc-premium.css" />
  <link rel="stylesheet" href="/tfc-preview.css" />
  <link rel="stylesheet" href="/launchpad/lp.css" />
  <script src="/mixpanel.min.js"></script>
  <script src="/tfc-analytics.js"></script>
</head>
<body class="pv-site">
  <header class="pv-site-header" id="nav">
  <div class="pv-wrap">
    <a class="pv-lockup" href="/" aria-label="The Future Council home"><div class="pv-logo" role="img" aria-label="TFC logo"></div><span>The Future<br>Council</span></a>
    <nav class="pv-nav" aria-label="Main"><a href="/chapters">Chapters</a><a href="/launchpad" aria-current="page">Launchpad</a><a href="/why">Why Build</a><a href="/investors">Investors</a><a href="/mentors">Mentors</a><a href="/about">About</a><a class="pv-btn" href="/join">Join free</a></nav>
  </div>
</header>
  <main>
${body}
  </main>
  <footer class="pv-site-footer">
  <div class="pv-wrap">
    <div>
      <div class="pv-logo" role="img" aria-label="TFC logo"></div>
      <p class="pv-foot-tag">Find your people. Fund your startup.</p>
      <p>TFC Innovations Pvt. Ltd. (CIN U62011DC2026PTC475213)<br>205 GF, Indra Vihar, Near Mukherjee Nagar, G.T.B. Nagar, North West Delhi, Delhi 110009</p>
      <p><a href="mailto:support@thefuturecouncil.in">support@thefuturecouncil.in</a></p>
      <p>&copy; 2026 TFC Innovations Pvt. Ltd. &middot; The Future Council</p>
    </div>
    <div class="pv-foot-col"><h4>Launchpad</h4><ul>
      <li><a href="/launchpad">Overview</a></li><li><a href="/launchpad/course">The course</a></li><li><a href="/launchpad/playbook">Open playbook</a></li><li><a href="/launchpad/dashboard">Your dashboard</a></li>
      <li><a href="/launchpad/leaderboard">Leaderboard</a></li><li><a href="/launchpad/demo-day">Demo Day</a></li></ul></div>
    <div class="pv-foot-col"><h4>Explore</h4><ul>
      <li><a href="/chapters">Chapters</a></li><li><a href="/why">Why Build</a></li><li><a href="/investors">Investors</a></li>
      <li><a href="/mentors">Mentors</a></li><li><a href="/about">About</a></li></ul></div>
    <div class="pv-foot-col"><h4>Legal</h4><ul>
      <li><a href="/terms">Terms of Service</a></li><li><a href="/privacy">Privacy Policy</a></li><li><a href="/refund">Refund Policy</a></li></ul></div>
  </div>
</footer>
  <script src="/tfc-config.js"></script>
  <script src="/tfc-shared.js"></script>
${(scripts || []).map((s) => `  <script src="${s}"></script>`).join('\n')}
</body>
</html>
`;
}

function hero(label, h1, lede, extra) {
  return `  <section class="pv-page-hero">
    <div class="pv-wrap">
      <p class="pv-label pv-muted" style="margin-bottom: 20px">${label}</p>
      <h1 class="pv-display">${h1}</h1>
      ${lede ? `<p class="pv-lede">${lede}</p>` : ''}
      ${extra || ''}
    </div>
  </section>`;
}

function linkList(items) {
  return `<ul class="lp-watch">${items.map((w) => `<li><a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.title)} &#8599;</a><br><span class="lp-muted">${esc(w.by)}${w.org ? ', ' + esc(w.org) : ''} · ${w.kind === 'video' ? 'Video' : 'Essay'}</span>${w.focus ? `<br>${esc(w.focus)}` : ''}</li>`).join('')}</ul>`;
}

// ---------- course ----------

function weekPage(m) {
  const prev = content.milestones.find((x) => x.n === m.n - 1);
  const next = content.milestones.find((x) => x.n === m.n + 1);
  const primary = m.watch.find((w) => w.embedId);
  const embed = primary
    ? `<div class="lp-video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(primary.embedId)}" title="${esc(primary.title)}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="lp-muted" style="font-size:14px">${esc(primary.title)}, ${esc(primary.by)}${primary.org ? ', ' + esc(primary.org) : ''}.</p>`
    : '';
  const body = `${hero(`<a href="/launchpad/course" style="color:inherit">Course</a> · Week ${m.n} of ${P.pathWeeks}`, esc(m.title), esc(m.tagline))}
  <section class="pv-section">
    <div class="lp-wrap lp-narrow">
      <div class="lp-card"><b>What you hand in this week</b><p class="lp-p" style="margin:6px 0 0">${esc(m.outcome)}</p></div>
      <h2 class="lp-h2 pv-display">Why this week matters</h2>
      <p class="lp-p">${esc(m.why)}</p>
      <h2 class="lp-h2 pv-display">1. Watch and read</h2>
      ${embed}
      ${linkList(m.watch)}
      <h2 class="lp-h2 pv-display">2. Do the work</h2>
      <ol class="lp-list">${m.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <h2 class="lp-h2 pv-display">3. Use the template</h2>
      <p class="lp-muted" style="margin-bottom:8px">${esc(m.template.title)}. Copy it, fill it in, then enter your answers on your dashboard.</p>
      <div class="lp-pre">${esc(m.template.body)}</div>
      <h2 class="lp-h2 pv-display">4. What a pass looks like</h2>
      <p class="lp-muted">Your submission is checked against this list. Meet every line and the week is passed.</p>
      <ul class="lp-check">${m.checklist.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      <h2 class="lp-h2 pv-display">Common mistakes</h2>
      <ul class="lp-list">${m.mistakes.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      <div class="lp-notice">${m.n === P.pathWeeks ? 'Your final submission is what investors see on Demo Day, so write it for a stranger who has never heard of your startup. Your startup name, one-liner, deck and pitch link may be shown publicly if you are chosen as a finalist.' : `Passing this week unlocks: ${esc(m.unlocks)}.`}</div>
      <div class="pv-actions" style="margin-top:20px"><a class="pv-btn" href="/launchpad/dashboard">Submit week ${m.n} on your dashboard</a></div>
      <div class="lp-weeknav">
        ${prev ? `<a href="/launchpad/course/${prev.slug}">&larr; Week ${prev.n}: ${esc(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a href="/launchpad/course/${next.slug}">Week ${next.n}: ${esc(next.title)} &rarr;</a>` : '<a href="/launchpad/demo-day">See Demo Day &rarr;</a>'}
      </div>
      <p class="lp-credit">${esc(P.credit)}</p>
    </div>
  </section>`;
  return page({
    title: `Week ${m.n}: ${m.title}`,
    description: `${m.tagline} Launchpad week ${m.n}: curated talks, steps, template and checklist.`,
    path: `/launchpad/course/${m.slug}`,
    body
  });
}

function courseIndex() {
  const rows = content.milestones.map((m) => `<a class="lp-card" href="/launchpad/course/${m.slug}" style="display:block;text-decoration:none;color:inherit"><span class="lp-tag">Week ${m.n}</span><h3 class="lp-h3" style="margin-top:10px">${esc(m.title)}</h3><p class="lp-muted" style="margin:0">${esc(m.tagline)}</p></a>`).join('\n');
  const body = `${hero('Launchpad · The course', `Eight weeks. <span class="pv-accent">Idea to Demo Day.</span>`, `Every week has the best free talks on the internet, a short list of steps, a template and a clear checklist. Anyone can read the course. Sign in to submit your work, get reviewed and join a pod.`, `<div class="pv-actions"><a class="pv-btn" href="/launchpad/dashboard">Start on your dashboard</a><a class="pv-note" href="${esc(P.hub.url)}" target="_blank" rel="noopener">${esc(P.hub.title)} &#8599;</a></div>`)}
  <section class="pv-section">
    <div class="lp-wrap">
      <div class="lp-grid">
${rows}
      </div>
      <p class="lp-credit">${esc(P.credit)}</p>
    </div>
  </section>`;
  return page({ title: 'The course', description: 'Launchpad is an eight-week path from idea to Demo Day, built on the best free startup talks, with weekly milestones and templates.', path: '/launchpad/course', body });
}

// ---------- app shells ----------

function appShell({ label, h1, lede, id, urlPath, title, description, scripts, noindex }) {
  const body = `${hero(label, h1, lede)}
  <section class="pv-section">
    <div class="lp-wrap">
      <div id="${id}" aria-live="polite"><p class="lp-muted lp-state">Loading&hellip;</p></div>
      <noscript><p class="lp-notice">This page needs JavaScript.</p></noscript>
    </div>
  </section>`;
  return page({ title, description, path: urlPath, body, scripts: ['/launchpad/lp-client.js'].concat(scripts), noindex });
}


// ---------- open playbook ----------

const LICENCE = 'The playbook text, checklists and templates written by The Future Council are shared under Creative Commons Attribution 4.0 (CC BY 4.0). Use them, copy them and adapt them, including to run your own program, as long as you credit The Future Council and link back to thefuturecouncil.in/launchpad/playbook. The linked talks and essays belong to their authors and are not covered by this licence.';
const RUBRIC = [
  ['Demand', 'Evidence that real people want this: conversations, signups, returning users.'],
  ['Execution', 'Quality of what was built and shipped, and how fast.'],
  ['Pitch', 'Clarity of the idea, the brief and the ask.'],
  ['Momentum', 'Progress across the eight weeks, not just the final state.']
];
const RUN = [
  ['Start a batch on a fixed date each month', 'Everyone in a batch starts together. Week 1 opens on the start date and a new week opens every seven days.'],
  ['Put founders in pods of four to five', 'Mix colleges where you can. Pods give accountability: each founder can see where the others are.'],
  ['Review against the written checklist', 'A week is passed only when every line on its checklist is met. Give specific feedback and allow resubmission.'],
  ['Check the work that cannot be checked in writing', 'Sample passed weeks by hand, open the links, and have pod members confirm each other\'s landing pages, MVPs and users.'],
  ['Rank at the end, then interview', 'Score everyone who passed weeks 1 to 7 on the four-part rubric. Interview the top 25 to 30 and ask for a live demo.'],
  ['Hold a Demo Day', 'Up to 20 founders pitch for three minutes each to invited investors and mentors, followed by questions. Send investors a one-page brief per founder beforehand.']
];

function playbookMarkdown() {
  const L = [];
  L.push('# The Launchpad Playbook', '', 'A free eight-week path from idea to Demo Day for student founders, by The Future Council.', '', `Read it online: https://thefuturecouncil.in/launchpad/playbook`, '', '## How it works', '', 'One milestone a week for eight weeks, in pods of four to five founders, then a ranked selection and a Demo Day. Batches start monthly.', '');
  content.milestones.forEach((m) => {
    L.push(`## Week ${m.n}: ${m.title}`, '', m.tagline, '', `**Hand in:** ${m.outcome}`, '', `**Why it matters:** ${m.why}`, '', '**Watch and read**', '');
    m.watch.forEach((w) => L.push(`- [${w.title}](${w.url}) (${w.by}${w.org ? ', ' + w.org : ''})${w.focus ? '. ' + w.focus : ''}`));
    L.push('', '**Steps**', '');
    m.steps.forEach((x, i) => L.push(`${i + 1}. ${x}`));
    L.push('', `**${m.template.title}**`, '', '```', m.template.body, '```', '', '**Pass checklist**', '');
    m.checklist.forEach((c) => L.push(`- [ ] ${c}`));
    L.push('', '**Common mistakes**', '');
    m.mistakes.forEach((c) => L.push(`- ${c}`));
    L.push('');
  });
  L.push('## Choosing the Demo Day founders', '', 'Score each of four areas from 0 to 25, on what the founder built and learned, never on college or grades.', '');
  RUBRIC.forEach((r) => L.push(`- **${r[0]}:** ${r[1]}`));
  L.push('', '## Running it yourself', '');
  RUN.forEach((r, i) => L.push(`${i + 1}. **${r[0]}.** ${r[1]}`));
  L.push('', '## Licence', '', LICENCE, '', P.credit, '');
  return L.join('\n');
}

function playbookPage() {
  const stages = content.milestones.map((m) => `<details class="lp-card"><summary><b>Week ${m.n}: ${esc(m.title)}</b> <span class="lp-muted">${esc(m.tagline)}</span></summary>
        <p class="lp-p"><b>Hand in:</b> ${esc(m.outcome)}</p>
        <p class="lp-p">${esc(m.why)}</p>
        <h3 class="lp-h3">Pass checklist</h3><ul class="lp-check">${m.checklist.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        <p style="margin-top:14px"><a href="/launchpad/course/${m.slug}">Open the full week: talks, steps and template &rarr;</a></p></details>`).join('\n      ');
  const body = `${hero('Launchpad · Open playbook', `The Launchpad <span class="pv-accent">playbook.</span>`, `The whole framework from idea to Demo Day, free for anyone to read, copy and run. Use it on your own, with friends, or to start a program at your college.`, `<div class="pv-actions"><a class="pv-btn" href="/launchpad/playbook.md" download>Download as Markdown</a><a class="pv-note" href="/launchpad/dashboard">Or join the next batch</a></div>`)}
  <section class="pv-section">
    <div class="lp-wrap lp-narrow">
      <h2 class="lp-h2 pv-display">The path</h2>
      <p class="lp-p">Eight weeks, one milestone a week. Each milestone has one thing to hand in and a written checklist that decides whether it counts. Do the weeks in order, in a group of four or five founders, and finish with a Demo Day.</p>
      <div style="margin-top:18px">
      ${stages}
      </div>
      <h2 class="lp-h2 pv-display">How Demo Day founders are chosen</h2>
      <p class="lp-p">Everyone who passes weeks 1 to 7 and submits week 8 is scored from 0 to 25 on each area below. College and grades are not part of it.</p>
      <ul class="lp-list">${RUBRIC.map((r) => `<li><b>${r[0]}.</b> ${esc(r[1])}</li>`).join('')}</ul>
      <h2 class="lp-h2 pv-display">Run it yourself</h2>
      <ol class="lp-list">${RUN.map((r) => `<li><b>${esc(r[0])}.</b> ${esc(r[1])}</li>`).join('')}</ol>
      <div class="lp-notice">Want to run Launchpad at your college or incubator, with our course pages, review system and Demo Day? Write to <a href="mailto:support@thefuturecouncil.in?subject=Run%20Launchpad%20at%20our%20college">support@thefuturecouncil.in</a>.</div>
      <h2 class="lp-h2 pv-display">Licence</h2>
      <p class="lp-p">${esc(LICENCE)}</p>
      <p class="lp-credit">${esc(P.credit)}</p>
    </div>
  </section>`;
  return page({ title: 'Open playbook', description: 'The Launchpad playbook: a free eight-week path from idea to Demo Day for student founders. Read it, copy it, run it.', path: '/launchpad/playbook', body });
}

const out = [];
write('launchpad/playbook/index.html', playbookPage()); 
write('launchpad/playbook.md', playbookMarkdown());
write('launchpad/course/index.html', courseIndex()); out.push('launchpad/course/index.html');
content.milestones.forEach((m) => {
  const rel = `launchpad/course/${m.slug}/index.html`;
  write(rel, weekPage(m)); out.push(rel);
});

const shells = [
  { dir: 'dashboard', label: 'Launchpad · Your dashboard', h1: 'Your <span class="pv-accent">dashboard.</span>', lede: 'Enroll, submit each week, see your pod and your feedback.', id: 'lp-app', title: 'Dashboard', description: 'Your Launchpad dashboard.', scripts: ['/launchpad/lp-dashboard.js'], noindex: true },
  { dir: 'leaderboard', label: 'Launchpad · Leaderboard', h1: 'Who is <span class="pv-accent">moving.</span>', lede: 'Founders and pods ranked by milestones passed. First name and last initial only, and anyone can opt out.', id: 'lp-app', title: 'Leaderboard', description: 'Launchpad leaderboard of founders and pods by milestones passed.', scripts: ['/launchpad/lp-leaderboard.js'] },
  { dir: 'demo-day', label: 'Launchpad · Demo Day', h1: 'The founders of <span class="pv-accent">the month.</span>', lede: 'Each month, up to twenty founders who finished the eight weeks pitch to investors.', id: 'lp-app', title: 'Demo Day', description: 'Launchpad Demo Day: the founders of the month and past pitches.', scripts: ['/launchpad/lp-demoday.js'] },
  { dir: 'admin', label: 'Launchpad · Admin', h1: 'Run the <span class="pv-accent">program.</span>', lede: 'Reviews, Demo Day ranking and pods.', id: 'lp-app', title: 'Admin', description: 'Launchpad admin.', scripts: ['/launchpad/lp-admin.js'], noindex: true }
];
shells.forEach((s) => {
  const rel = `launchpad/${s.dir}/index.html`;
  write(rel, appShell(Object.assign({ urlPath: `/launchpad/${s.dir}` }, s))); out.push(rel);
});

out.push('launchpad/playbook/index.html', 'launchpad/playbook.md');
console.log('Wrote ' + out.length + ' files:\n  ' + out.join('\n  '));
