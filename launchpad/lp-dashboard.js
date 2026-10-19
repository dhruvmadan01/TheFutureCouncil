/* Launchpad app: journey map, week workspace, pod wall. Self-paced: a week opens when the one before it is passed. */
(function () {
  'use strict';
  var root = document.getElementById('lp-app');
  var esc = LP.esc;
  var content = null;
  var me = null;
  var wall = [];
  var tab = 'learn';          // learn | do | template | submit
  var drafts = {};
  var ticks = {};             // self-check ticks per week
  var celebrate = null;       // week number just passed
  var bound = false;

  var LABEL = {
    locked: ['Locked', 'off'], open: ['Ready', ''], pending: ['In review', 'warn'],
    needs_work: ['Needs work', 'bad'], passed: ['Passed', 'ok']
  };

  function weekFromHash() {
    var m = /^#week-(\d)$/.exec(location.hash || '');
    var n = m ? Number(m[1]) : 0;
    return n >= 1 && n <= 8 ? n : 0;
  }
  function go(hash) { location.hash = hash; }

  function ago(iso) {
    var s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
    if (s < 90) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return Math.round(s / 86400) + ' d ago';
  }

  // ---------- loading ----------

  function start() {
    root.innerHTML = '<p class="lp-muted lp-state">Loading&hellip;</p>';
    Promise.all([LP.fetchContent(), LP.hasToken() ? LP.api('GET', 'me', { auth: true }) : Promise.resolve(null)])
      .then(function (r) {
        content = r[0];
        if (!r[1]) return welcome();
        me = r[1];
        if (!me.enrolled) return renderEnroll();
        return loadWall().then(render);
      })
      .catch(function (e) {
        if (e.status === 401) return welcome();
        root.innerHTML = '<p class="lp-notice">' + esc(e.status === 503 ? 'Launchpad opens very soon. Check back shortly.' : e.message) + '</p>';
      });
  }

  function loadWall() {
    return LP.api('GET', 'pod-wall', { auth: true }).then(function (d) { wall = d.feed; }).catch(function () { wall = []; });
  }

  function refreshMe() {
    return LP.api('GET', 'me', { auth: true }).then(function (d) { me = d; });
  }

  // ---------- signed out / enrol ----------

  function welcome() {
    root.innerHTML = '<div class="lp-app-hero" style="grid-template-columns:1fr"><div><h2>Start building today.</h2><p>Eight steps take you from an idea to a pitch. Start any day, go at your own pace, and each step opens when you pass the one before. You get a pod of fellow founders and a shot at the monthly Demo Day.</p><button class="lp-cta" id="lp-signin">Sign in with Google to start</button> <a class="lp-cta ghost" href="/launchpad/course">Look around first</a><p class="lp-muted" id="lp-signin-err" style="color:#f3b4a8;margin:12px 0 0"></p></div></div>' +
      journeyPreview();
    root.querySelector('#lp-signin').addEventListener('click', function () {
      LP.signIn().then(start).catch(function (e) { root.querySelector('#lp-signin-err').textContent = e.message; });
    });
  }

  function journeyPreview() {
    return '<ol class="lp-path">' + content.milestones.map(function (m) {
      return '<li class="lp-node ' + (m.n === 1 ? 'open' : 'locked') + '"><span class="lp-dot">' + m.n + '</span><div class="body"><h3>' + esc(m.title) + '</h3><p>' + esc(m.tagline) + '</p></div></li>';
    }).join('') + '</ol>';
  }

  function renderEnroll() {
    root.innerHTML = '<div class="lp-app-hero" style="grid-template-columns:1fr"><div><h2>Welcome, ' + esc(me.user.name.split(' ')[0]) + '.</h2><p>One last thing before you start. You will be placed in a pod of four or five founders who joined around the same time.</p>' +
      '<div class="lp-form" style="max-width:420px"><label for="lp-college" style="color:#fff;margin-top:0">Your college or university</label><input id="lp-college" maxlength="120" placeholder="e.g. Delhi Technological University"><div class="err" id="lp-enroll-err" style="color:#f3b4a8"></div></div>' +
      '<p style="margin:14px 0"><button class="lp-cta" id="lp-enroll">Start Week 1</button></p><p class="lp-muted" style="color:#bdb5aa;font-size:13px;margin:0">Free. No fee, no equity. By joining you agree to our <a href="/terms" style="color:#fff">terms</a> and <a href="/privacy" style="color:#fff">privacy policy</a>. You are signed in as ' + esc(me.user.email) + '.</p></div></div>' + journeyPreview();
    root.querySelector('#lp-enroll').addEventListener('click', function (ev) {
      var btn = ev.currentTarget;
      btn.disabled = true;
      LP.api('POST', 'enroll', { auth: true, body: { college: root.querySelector('#lp-college').value } })
        .then(function (d) { me = d; return loadWall(); })
        .then(function () { go('#week-1'); render(); })
        .catch(function (e) { btn.disabled = false; root.querySelector('#lp-enroll-err').textContent = e.message; });
    });
  }

  // ---------- views ----------

  function render() {
    var n = weekFromHash();
    var html = n ? workspace(n) : home();
    if (celebrate) html += celebration(celebrate);
    root.innerHTML = html;
    var counts = root.querySelectorAll('[data-count]');
    counts.forEach(updateCount);
    if (!bound) { bind(); bound = true; }
  }

  function nextWeek() {
    var s = me.milestones.filter(function (x) { return x.state !== 'passed' && x.state !== 'locked'; })[0];
    return s ? s.n : null;
  }

  function ring(passed) {
    var r = 50, c = 2 * Math.PI * r, d = (passed / 8) * c;
    return '<div class="lp-ring"><svg width="118" height="118" viewBox="0 0 118 118"><circle class="track" cx="59" cy="59" r="' + r + '" fill="none" stroke-width="10"/><circle class="fill" cx="59" cy="59" r="' + r + '" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + d.toFixed(1) + ' ' + c.toFixed(1) + '"/></svg><b><span>' + passed + '<small>of 8</small></span></b></div>';
  }

  function home() {
    var nx = nextWeek();
    var nm = nx ? content.milestones[nx - 1] : null;
    var st = nx ? me.milestones[nx - 1] : null;
    var first = me.user.name.split(' ')[0];
    var html = '<div class="lp-app-hero">' + ring(me.passedCount) + '<div>';
    if (me.passedCount === 8) {
      html += '<h2>You finished all eight steps.</h2><p>That is the whole path from idea to pitch. ' + (me.demoEligible ? 'You are in the pool for the next Demo Day.' : 'Your final submission is waiting for review.') + '</p>';
    } else if (me.passedCount === 0 && st && st.attempts === 0) {
      html += '<h2>Ready when you are, ' + esc(first) + '.</h2><p>Step 1 is picking a problem worth solving. It takes most people about a week.</p><button class="lp-cta" data-go="#week-1">Start Week 1</button>';
    } else if (nm) {
      var verb = st.state === 'needs_work' ? 'Fix and resubmit' : st.state === 'pending' ? 'See your submission' : 'Continue';
      html += '<h2>Next up: ' + esc(nm.title) + '</h2><p>' + esc(nm.tagline) + '</p><button class="lp-cta" data-go="#week-' + nx + '">' + verb + ' &middot; Week ' + nx + '</button>';
    }
    html += '</div></div>';

    (me.finalist || []).forEach(function (f) {
      html += '<div class="lp-notice"><b>You are a Demo Day finalist.</b> ' + (f.status === 'done' ? 'You pitched on ' : 'You pitch on ') + esc(LP.prettyDate(f.heldOn)) + '. Congratulations.</div>';
    });
    if (!(me.finalist || []).length && me.rankedFor) {
      html += '<div class="lp-notice">You have been considered for ' + me.rankedFor + ' Demo Day' + (me.rankedFor > 1 ? 's' : '') + '. If you were not picked, you stay in the pool for the next one.</div>';
    }

    html += '<ol class="lp-path">';
    me.milestones.forEach(function (s) {
      var m = content.milestones[s.n - 1];
      var lab = LABEL[s.state];
      var open = s.state !== 'locked';
      html += '<li class="lp-node ' + s.state + '"><span class="lp-dot">' + (s.state === 'passed' ? '&#10003;' : s.n) + '</span><div class="body"><h3>' + esc(m.title) + '</h3><p>' + esc(s.state === 'locked' ? 'Opens when you pass week ' + (s.n - 1) + '.' : m.tagline) + '</p></div>' +
        '<div class="lp-row"><span class="lp-tag ' + lab[1] + '">' + lab[0] + '</span>' +
        (open ? '<button class="lp-btn2' + (s.state === 'open' || s.state === 'needs_work' ? ' solid' : '') + '" data-go="#week-' + s.n + '">' + (s.state === 'passed' ? 'Review' : s.state === 'pending' ? 'View' : 'Open') + '</button>' : '') + '</div></li>';
    });
    html += '</ol>';

    html += '<div class="lp-notice" style="margin-top:22px">' + (me.demoEligible
      ? 'You are eligible for Demo Day ranking. Founders are ranked on demand, execution, pitch and momentum, then the top ones are interviewed.'
      : 'Demo Day is every month. Pass weeks 1 to 7 and submit week 8 to be considered.') +
      (me.nextDemoDay ? ' Next: <b>' + esc(LP.prettyDate(me.nextDemoDay.heldOn)) + '</b>. <a href="/launchpad/demo-day">How it works</a>.' : ' <a href="/launchpad/demo-day">How it works</a>.') + '</div>';

    html += '<div class="lp-two" style="margin-top:22px"><div>' + podCard() + '</div><div>' + wallCard() + '</div></div>';

    html += '<div class="lp-card lp-form" style="margin-top:22px"><div class="lp-row between"><label style="margin:0;font-weight:400"><input type="checkbox" id="lp-public" style="width:auto;margin-right:8px"' + (me.enrollment.showPublic ? ' checked' : '') + '>Show me on the public leaderboard and wins feed (first name, last initial, college)</label><button class="lp-btn2" data-act="signout">Sign out</button></div></div>';
    return html;
  }

  function podCard() {
    if (!me.pod) return '';
    var html = '<div class="lp-card"><h3 class="lp-h3" style="margin-top:0">Your pod &middot; ' + esc(me.pod.name) + '</h3><p class="lp-muted" style="margin:0 0 6px;font-size:14px">Founders working through the same steps. Cheer each other on and ask for help here first.</p>';
    me.pod.members.forEach(function (p) {
      html += '<div class="lp-member"><div><b>' + esc(p.name) + '</b>' + (p.college ? ' <span class="lp-muted" style="font-size:13px">' + esc(p.college) + '</span>' : '') + '<div class="lp-bar" style="margin-top:6px"><i style="width:' + Math.round(p.passed / 8 * 100) + '%"></i></div></div><span class="lp-tag">' + p.passed + '/8</span></div>';
    });
    if (me.pod.members.length < 4) html += '<p class="lp-muted" style="font-size:13px;margin:12px 0 0">Your pod fills up as more founders join this month.</p>';
    return html + '</div>';
  }

  function wallCard() {
    var html = '<div class="lp-card"><h3 class="lp-h3" style="margin-top:0">Pod wall</h3><div class="lp-compose"><textarea id="lp-post" maxlength="500" placeholder="What did you try this week? Ask your pod a question or share a win."></textarea><button class="lp-btn2 solid" data-act="post">Post</button></div><ul class="lp-feed">';
    if (!wall.length) html += '<li class="lp-muted">Nothing here yet. Post first and say hello.</li>';
    wall.forEach(function (x) {
      if (x.type === 'pass') {
        html += '<li><span class="win">&#10003; ' + esc(x.name) + (x.name === 'You' ? '' : '') + ' passed Week ' + x.milestone + '</span>: ' + esc(x.title) + '<div class="meta">' + ago(x.createdAt) + '</div></li>';
      } else {
        html += '<li><b>' + esc(x.name) + '</b> ' + esc(x.body) + '<div class="meta">' + ago(x.createdAt) + (x.mine ? '<button data-act="delpost" data-id="' + x.id + '">delete</button>' : '') + '</div></li>';
      }
    });
    return html + '</ul></div>';
  }

  // ---------- week workspace ----------

  function workspace(n) {
    var m = content.milestones[n - 1];
    var s = me.milestones[n - 1];
    if (s.state === 'locked') return '<div class="lp-notice">Week ' + n + ' opens when you pass week ' + (n - 1) + '. <button class="lp-btn2" data-go="#">Back to your journey</button></div>';
    var tabs = [['learn', 'Learn'], ['do', 'Do'], ['template', 'Template'], ['submit', 'Submit']];
    var html = '<div class="lp-ws-head"><button class="lp-btn2" data-go="#">&larr; Your journey</button></div>' +
      '<div class="lp-row between"><div><span class="lp-tag">Week ' + n + ' of 8</span> <span class="lp-tag ' + LABEL[s.state][1] + '">' + LABEL[s.state][0] + '</span></div><span class="lp-muted" style="font-size:14px">Take as long as you need. Most founders spend about a week.</span></div>' +
      '<h2 class="pv-display" style="font-size:clamp(30px,5vw,52px);margin:14px 0 4px">' + esc(m.title) + '</h2><p class="lp-muted" style="margin:0;font-size:18px;max-width:60ch">' + esc(m.tagline) + '</p>' +
      '<div class="lp-notice"><b>You hand in:</b> ' + esc(m.outcome) + '</div>';
    html += '<div class="lp-steps">' + tabs.map(function (t, i) { return '<button data-tab="' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '"><i>' + (i + 1) + '</i>' + t[1] + '</button>'; }).join('') + '</div>';
    html += '<div class="lp-panel">' + panel(m, s, n) + '</div>';
    var idx = tabs.map(function (t) { return t[0]; }).indexOf(tab);
    html += '<div class="lp-flowbtns">' + (idx > 0 ? '<button class="lp-btn2" data-tab="' + tabs[idx - 1][0] + '">&larr; ' + tabs[idx - 1][1] + '</button>' : '<span></span>') +
      (idx < tabs.length - 1 ? '<button class="lp-cta" data-tab="' + tabs[idx + 1][0] + '">' + tabs[idx + 1][1] + ' &rarr;</button>' : '') + '</div>';
    return html;
  }

  function panel(m, s, n) {
    if (tab === 'learn') {
      var primary = m.watch.filter(function (w) { return w.embedId; })[0];
      var html = '<h3 class="lp-h3">Why this step matters</h3><p class="lp-p">' + esc(m.why) + '</p>';
      if (primary) html += '<div class="lp-video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(primary.embedId) + '" title="' + esc(primary.title) + '" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
      html += '<ul class="lp-watch">' + m.watch.map(function (w) {
        return '<li><a href="' + esc(w.url) + '" target="_blank" rel="noopener">' + esc(w.title) + ' &#8599;</a><br><span class="lp-muted">' + esc(w.by) + (w.org ? ', ' + esc(w.org) : '') + ' &middot; ' + (w.kind === 'video' ? 'Video' : 'Essay') + '</span>' + (w.focus ? '<br>' + esc(w.focus) : '') + '</li>';
      }).join('') + '</ul><p class="lp-credit">' + esc(content.program.credit) + '</p>';
      return html;
    }
    if (tab === 'do') {
      return '<h3 class="lp-h3">The work</h3><ol class="lp-list">' + m.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
        '<h3 class="lp-h3">Common mistakes</h3><ul class="lp-list">' + m.mistakes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    }
    if (tab === 'template') {
      return '<div class="lp-row between"><h3 class="lp-h3" style="margin:0">' + esc(m.template.title) + '</h3><button class="lp-btn2" data-act="copy">Copy template</button></div><div class="lp-pre" id="lp-tpl" style="margin-top:12px">' + esc(m.template.body) + '</div>';
    }
    return submitPanel(m, s, n);
  }

  function submitPanel(m, s, n) {
    var html = '';
    if (s.state === 'passed') {
      html += '<div class="lp-notice" style="margin-top:0"><b>Week ' + n + ' is passed.</b> ' + (s.latest && s.latest.feedback ? esc(s.latest.feedback) : '') + '</div>';
      var nx = me.milestones[n];
      html += '<p>' + (nx ? '<button class="lp-cta" data-go="#week-' + (n + 1) + '" data-tab-reset="learn">Start Week ' + (n + 1) + '</button>' : '<button class="lp-cta" data-go="#">Back to your journey</button>') + '</p>';
      if (s.latest && s.latest.answers) {
        html += '<h3 class="lp-h3">What you submitted</h3>' + m.fields.map(function (f) { var v = s.latest.answers[f.id]; return v == null ? '' : '<p style="margin:8px 0"><span class="lp-muted" style="font-size:13px">' + esc(f.label) + '</span><br>' + esc(v) + '</p>'; }).join('');
      }
      return html;
    }
    if (s.state === 'pending') {
      return '<div class="lp-notice" style="margin-top:0">Your submission is waiting for a person to review it. You will see the result here. You do not need to do anything.</div>';
    }
    if (s.latest && s.latest.feedback) {
      html += '<div class="lp-notice" style="margin-top:0"><b>Feedback on your last try:</b> ' + esc(s.latest.feedback) + failed(s.latest) + '</div>';
    }
    var prior = drafts[n] || (s.latest && s.latest.answers) || {};
    html += '<div class="lp-split"><form class="lp-form" data-n="' + n + '" novalidate><p class="lp-muted" style="margin:0">Required fields are marked *.</p>';
    m.fields.forEach(function (f) {
      var v = prior[f.id] == null ? '' : prior[f.id];
      html += '<label for="f-' + f.id + '">' + esc(f.label) + (f.required ? ' *' : '') + '</label>' + (f.help ? '<div class="help">' + esc(f.help) + '</div>' : '');
      if (f.type === 'textarea') html += '<textarea id="f-' + f.id + '" name="' + f.id + '">' + esc(v) + '</textarea><div class="count" data-count="' + f.id + '" data-min="' + (f.min || 0) + '"></div>';
      else html += '<input id="f-' + f.id + '" name="' + f.id + '" type="' + (f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text') + '" value="' + esc(v) + '"' + (f.type === 'url' ? ' placeholder="https://"' : '') + '>';
      html += '<div class="err" data-err="' + f.id + '"></div>';
    });
    html += '<div style="margin-top:20px"><button class="lp-cta" type="submit">Submit week ' + n + '</button></div><p class="lp-muted" style="font-size:13px">Your answers are checked against the list on the right, usually in under a minute. If something is missing you will see exactly what, and can fix and resubmit.</p></form>' +
      '<aside class="lp-side"><h4>Before you submit</h4><p class="lp-muted" style="font-size:13px;margin:0 0 6px">Tick each one honestly. This is what gets checked.</p>';
    var t = ticks[n] || {};
    m.checklist.forEach(function (c, i) { html += '<label><input type="checkbox" data-tick="' + i + '"' + (t[i] ? ' checked' : '') + '>' + esc(c) + '</label>'; });
    return html + '</aside></div>';
  }

  function failed(latest) {
    if (!latest.checklist) return '';
    var bad = latest.checklist.filter(function (c) { return !c.met; });
    if (!bad.length) return '';
    return '<ul class="lp-list" style="margin:8px 0 0">' + bad.map(function (c) { return '<li>' + esc(c.item) + (c.note ? ' <span class="lp-muted">(' + esc(c.note) + ')</span>' : '') + '</li>'; }).join('') + '</ul>';
  }

  function celebration(n) {
    var m = content.milestones[n - 1];
    var colors = ['#E2542A', '#1E6B2E', '#111', '#F2B84B', '#6AA9E9'];
    var bits = '';
    for (var i = 0; i < 28; i += 1) bits += '<i style="left:' + Math.round(Math.random() * 100) + '%;background:' + colors[i % colors.length] + ';animation-delay:' + (Math.random() * 0.6).toFixed(2) + 's"></i>';
    var last = n === 8;
    return '<div class="lp-celebrate" data-act="closecel"><div class="box"><div class="lp-confetti">' + bits + '</div><span class="lp-tag ok">Week ' + n + ' passed</span><h2>' + (last ? 'You finished the path.' : 'Nice work.') + '</h2><p class="lp-p" style="margin:0 auto 18px">' + (last ? 'You are in the pool for the next Demo Day. Your pod can see you finished.' : 'You passed ' + esc(m.title) + '. Your pod can see it on the wall.') + '</p>' +
      (last ? '<button class="lp-cta" data-act="closecel" data-go="#">See your journey</button>' : '<button class="lp-cta" data-act="closecel" data-go="#week-' + (n + 1) + '" data-tab-reset="learn">Start Week ' + (n + 1) + '</button> <button class="lp-btn2" data-act="closecel" data-go="#">Not yet</button>') + '</div></div>';
  }

  // ---------- events ----------

  function updateCount(el) {
    var ta = root.querySelector('#f-' + el.getAttribute('data-count'));
    var min = Number(el.getAttribute('data-min')) || 0;
    if (ta) el.textContent = ta.value.length + (min ? ' / ' + min + ' minimum' : '');
  }

  function collect(form) { var out = {}; new FormData(form).forEach(function (v, k) { out[k] = v; }); return out; }

  function bind() {
    window.addEventListener('hashchange', function () { if (me && me.enrolled) { window.scrollTo({ top: 0 }); render(); } });
    root.addEventListener('input', function (ev) {
      var form = ev.target.closest && ev.target.closest('form[data-n]');
      if (form) { drafts[form.getAttribute('data-n')] = collect(form); root.querySelectorAll('[data-count]').forEach(updateCount); }
    });
    root.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t.id === 'lp-public') {
        LP.api('POST', 'settings', { auth: true, body: { showPublic: t.checked } }).then(function (d) { me = d; LP.toast(t.checked ? 'You are on the public board.' : 'You are hidden from the public board.'); }).catch(function (e) { LP.toast(e.message); });
      }
      if (t.hasAttribute && t.hasAttribute('data-tick')) {
        var n = weekFromHash();
        ticks[n] = ticks[n] || {};
        ticks[n][t.getAttribute('data-tick')] = t.checked;
      }
    });
    root.addEventListener('click', onClick);
    root.addEventListener('submit', onSubmit);
  }

  function onClick(ev) {
    var el = ev.target.closest && ev.target.closest('[data-go],[data-tab],[data-act]');
    if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'closecel') {
      if (!el.hasAttribute('data-go') && ev.target !== el) return; // a click inside the box does not close it
      celebrate = null;
      if (!el.hasAttribute('data-go')) { render(); return; }
    }
    if (el.hasAttribute('data-tab-reset')) tab = el.getAttribute('data-tab-reset');
    if (el.hasAttribute('data-tab')) { tab = el.getAttribute('data-tab'); render(); window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' }); return; }
    if (el.hasAttribute('data-go')) {
      var h = el.getAttribute('data-go');
      if (h === '#') { history.pushState('', document.title, location.pathname + location.search); render(); window.scrollTo({ top: 0 }); }
      else if (location.hash === h) render();
      else go(h);
      return;
    }
    if (act === 'signout') { LP.signOut(); me = null; start(); }
    if (act === 'copy') {
      var txt = root.querySelector('#lp-tpl').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { LP.toast('Template copied.'); }, function () { LP.toast('Select the text and copy it.'); });
    }
    if (act === 'post') {
      var box = root.querySelector('#lp-post');
      if (!box.value.trim()) return;
      el.disabled = true;
      LP.api('POST', 'post', { auth: true, body: { body: box.value } }).then(function (d) { wall = d.feed; render(); }).catch(function (e) { el.disabled = false; LP.toast(e.message); });
    }
    if (act === 'delpost') {
      LP.api('POST', 'post-delete', { auth: true, body: { id: el.getAttribute('data-id') } }).then(loadWall).then(render).catch(function (e) { LP.toast(e.message); });
    }
  }

  function onSubmit(ev) {
    var form = ev.target.closest && ev.target.closest('form[data-n]');
    if (!form) return;
    ev.preventDefault();
    var n = Number(form.getAttribute('data-n'));
    var btn = form.querySelector('button[type="submit"]');
    form.querySelectorAll('[data-err]').forEach(function (e) { e.textContent = ''; });
    btn.disabled = true;
    btn.textContent = 'Reviewing…';
    LP.api('POST', 'submit', { auth: true, body: { milestone: n, answers: collect(form) } })
      .then(function (d) {
        delete drafts[n];
        return refreshMe().then(loadWall).then(function () {
          if (d.submission.status === 'passed') celebrate = n;
          else LP.toast(d.submission.status === 'needs_work' ? 'Not there yet. Read the feedback.' : 'Submitted. A person will review it.');
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      })
      .catch(function (e) {
        btn.disabled = false;
        btn.textContent = 'Submit week ' + n;
        if (e.fields) {
          Object.keys(e.fields).forEach(function (k) { var el = form.querySelector('[data-err="' + k + '"]'); if (el) el.textContent = e.fields[k]; });
          var first = form.querySelector('.err:not(:empty)');
          if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (e.status === 401) { start(); } else { LP.toast(e.message); }
      });
  }

  start();
})();
