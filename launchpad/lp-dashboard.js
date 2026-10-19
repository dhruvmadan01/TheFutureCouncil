/* Launchpad dashboard */
(function () {
  'use strict';
  var root = document.getElementById('lp-app');
  var esc = LP.esc;
  var content = null;
  var me = null;
  var openForm = null; // milestone number whose form is open
  var drafts = {};

  var STATE_LABEL = {
    locked: ['Locked', 'off'], open: ['Open', ''], pending: ['Waiting for review', 'warn'],
    needs_work: ['Needs work', 'bad'], passed: ['Passed', 'ok']
  };

  function start() {
    root.innerHTML = '<p class="lp-muted lp-state">Loading&hellip;</p>';
    Promise.all([LP.fetchContent(), LP.hasToken() ? LP.api('GET', 'me', { auth: true }) : Promise.resolve(null)])
      .then(function (r) {
        content = r[0];
        if (!r[1]) return LP.signInView(root, 'Sign in to open your dashboard', start);
        me = r[1];
        render();
      })
      .catch(function (e) {
        if (e.status === 401) return LP.signInView(root, 'Sign in to open your dashboard', start);
        root.innerHTML = '<p class="lp-notice">' + esc(e.message) + '</p>';
      });
  }

  function render() {
    if (!me.enrolled) return renderEnroll();
    var html = '';
    html += '<div class="lp-row between"><div><span class="lp-tag">' + esc(me.batch.name) + '</span> <span class="lp-muted">' +
      (me.batch.started ? 'Started ' : 'Starts ') + esc(LP.prettyDate(me.batch.startsOn)) + '</span></div>' +
      '<div class="lp-row"><span class="lp-muted">' + esc(me.user.name) + '</span><button class="lp-btn2" data-act="signout">Sign out</button></div></div>';

    if (!me.batch.started) {
      html += '<div class="lp-notice">You are in. Your batch starts on <b>' + esc(LP.prettyDate(me.batch.startsOn)) + '</b> and week 1 opens that day. Until then, start watching the <a href="/launchpad/course/week-1">week 1 talks</a>.</div>';
    }
    var pct = Math.round((me.passedCount / 8) * 100);
    html += '<div class="lp-card" style="margin-top:14px"><div class="lp-row between"><b>' + me.passedCount + ' of 8 weeks passed</b>' +
      (me.demoEligible ? '<span class="lp-tag ok">Eligible for Demo Day ranking</span>' : '<span class="lp-tag off">Pass weeks 1 to 7 and submit week 8 to be considered for Demo Day</span>') +
      '</div><div class="lp-bar" style="margin-top:10px"><i style="width:' + pct + '%"></i></div></div>';

    (me.finalist || []).forEach(function (f) {
      html += '<div class="lp-notice"><b>You are a Demo Day finalist.</b> ' + (f.status === 'done' ? 'Your pitch was on ' : 'Your pitch is on ') + esc(LP.prettyDate(f.heldOn)) + '. Congratulations.</div>';
    });
    if (!(me.finalist || []).length && me.rankedFor) {
      html += '<div class="lp-notice">You have been considered for ' + me.rankedFor + ' Demo Day' + (me.rankedFor > 1 ? 's' : '') + '. If you were not picked this time, you stay in the pool for the next one.</div>';
    }

    html += '<h2 class="lp-h2 pv-display">Your eight weeks</h2><div class="lp-card">';
    me.milestones.forEach(function (s) {
      var m = content.milestones[s.n - 1];
      var lab = STATE_LABEL[s.state];
      var sub = s.state === 'locked' ? 'Opens ' + LP.prettyDate(s.unlocksOn)
        : s.state === 'passed' ? '' : 'Due ' + LP.prettyDate(s.dueOn) + (s.overdue ? ' · past due, you can still submit' : '');
      var canSubmit = s.state === 'open' || s.state === 'needs_work';
      html += '<div class="lp-ms ' + (s.state === 'locked' ? 'locked' : '') + '"><span class="n">' + s.n + '</span>' +
        '<div><b>' + esc(m.title) + '</b><br><span class="lp-muted" style="font-size:14px">' + esc(sub) + '</span>' +
        (s.latest && s.latest.feedback ? '<div class="lp-notice" style="margin:8px 0 0"><b>Feedback:</b> ' + esc(s.latest.feedback) + failedItems(s.latest) + '</div>' : '') +
        (s.state === 'pending' ? '<div class="lp-notice" style="margin:8px 0 0">Your submission is in the queue for a person to review. You will see the result here.</div>' : '') +
        '</div><div class="lp-row"><span class="lp-tag ' + lab[1] + '">' + lab[0] + '</span>' +
        '<a class="lp-btn2" href="/launchpad/course/' + m.slug + '">Lesson</a>' +
        (canSubmit ? '<button class="lp-btn2 solid" data-act="open" data-n="' + s.n + '">' + (s.state === 'needs_work' ? 'Resubmit' : 'Submit') + '</button>' : '') +
        '</div></div>';
      if (openForm === s.n && canSubmit) html += formHtml(m, s);
    });
    html += '</div>';

    if (me.pod) {
      html += '<h2 class="lp-h2 pv-display">Your pod · ' + esc(me.pod.name) + '</h2><div class="lp-card">' +
        '<p class="lp-muted" style="margin-top:0">These founders are on the same weekly schedule. Message each other, share your drafts, and keep each other on pace.</p>';
      me.pod.members.forEach(function (p) {
        html += '<div class="lp-ms" style="grid-template-columns:1fr auto"><div><b>' + esc(p.name) + '</b>' + (p.you ? '' : '') +
          (p.college ? ' <span class="lp-muted">· ' + esc(p.college) + '</span>' : '') + '</div><span class="lp-tag">' + p.passed + ' of 8 passed</span></div>';
      });
      html += '</div>';
    }

    if (me.nextDemoDay) {
      html += '<div class="lp-notice" style="margin-top:20px">Next Demo Day: <b>' + esc(LP.prettyDate(me.nextDemoDay.heldOn)) + '</b>. <a href="/launchpad/demo-day">See how it works</a>.</div>';
    }

    html += '<h2 class="lp-h2 pv-display">Settings</h2><div class="lp-card lp-form"><label style="margin-top:0"><input type="checkbox" id="lp-public" style="width:auto;margin-right:8px"' +
      (me.enrollment.showPublic ? ' checked' : '') + '>Show me on the public leaderboard</label>' +
      '<p class="help">Only your first name, last initial and college appear. Anyone chosen for Demo Day is shown there regardless.</p></div>';

    root.innerHTML = html;
    bind();
  }

  function failedItems(latest) {
    if (!latest.checklist) return '';
    var bad = latest.checklist.filter(function (c) { return !c.met; });
    if (!bad.length) return '';
    return '<ul class="lp-list" style="margin:8px 0 0">' + bad.map(function (c) { return '<li>' + esc(c.item) + (c.note ? ' <span class="lp-muted">(' + esc(c.note) + ')</span>' : '') + '</li>'; }).join('') + '</ul>';
  }

  function formHtml(m, s) {
    var prior = (drafts[m.n]) || (s.latest && s.latest.answers) || {};
    var html = '<form class="lp-form" data-n="' + m.n + '" style="padding:6px 0 18px 58px" novalidate>';
    html += '<p class="lp-muted" style="margin:0 0 4px">Check the <a href="/launchpad/course/' + m.slug + '">lesson checklist</a> first. Everything marked * is required.</p>';
    m.fields.forEach(function (f) {
      var v = prior[f.id] == null ? '' : prior[f.id];
      html += '<label for="f-' + f.id + '">' + esc(f.label) + (f.required ? ' *' : '') + '</label>';
      if (f.help) html += '<div class="help">' + esc(f.help) + '</div>';
      if (f.type === 'textarea') {
        html += '<textarea id="f-' + f.id + '" name="' + f.id + '">' + esc(v) + '</textarea><div class="count" data-count="' + f.id + '" data-min="' + (f.min || 0) + '"></div>';
      } else {
        var type = f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text';
        html += '<input id="f-' + f.id + '" name="' + f.id + '" type="' + type + '" value="' + esc(v) + '"' + (f.type === 'url' ? ' placeholder="https://"' : '') + '>';
      }
      html += '<div class="err" data-err="' + f.id + '"></div>';
    });
    html += '<div class="lp-row" style="margin-top:16px"><button class="lp-btn2 solid" type="submit">Submit week ' + m.n + '</button><button class="lp-btn2" type="button" data-act="close">Cancel</button></div>' +
      '<p class="lp-muted" style="font-size:13px">A review checks your answers against the lesson checklist. It takes under a minute, and you can resubmit after feedback.</p></form>';
    return html;
  }

  function renderEnroll() {
    root.innerHTML = '<div class="lp-card lp-form" style="max-width:560px"><h2 class="lp-h3" style="margin-top:0">Join Launchpad</h2>' +
      '<p class="lp-p" style="margin-top:0">Signed in as <b>' + esc(me.user.email) + '</b>. Joining is free. You will be placed in the next batch, which starts on <b>' + esc(LP.prettyDate(me.nextIntake)) + '</b>, and put in a pod of four or five founders.</p>' +
      '<label for="lp-college">College or university</label><input id="lp-college" maxlength="120" placeholder="e.g. Delhi Technological University">' +
      '<div class="err" id="lp-enroll-err"></div>' +
      '<p class="help" style="margin-top:14px">By joining you agree to our <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>. Launchpad takes no fee and no equity.</p>' +
      '<div class="lp-row"><button class="lp-btn2 solid" id="lp-enroll">Join Launchpad</button><button class="lp-btn2" data-act="signout">Sign out</button></div></div>';
    root.querySelector('#lp-enroll').addEventListener('click', function (ev) {
      var btn = ev.currentTarget;
      btn.disabled = true;
      LP.api('POST', 'enroll', { auth: true, body: { college: root.querySelector('#lp-college').value } })
        .then(function (d) { me = d; LP.toast('Welcome to Launchpad.'); render(); })
        .catch(function (e) { btn.disabled = false; root.querySelector('#lp-enroll-err').textContent = e.message; });
    });
    root.querySelector('[data-act="signout"]').addEventListener('click', function () { LP.signOut(); start(); });
  }

  function collect(form) {
    var out = {};
    new FormData(form).forEach(function (v, k) { out[k] = v; });
    return out;
  }

  function bind() {
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('change', onChange);
    updateCounts();
  }
  // Re-render replaces innerHTML but the listeners live on root, so bind once.
  var bound = false;
  var origBind = bind;
  bind = function () { if (!bound) { origBind(); bound = true; } else updateCounts(); };

  function updateCounts() {
    root.querySelectorAll('[data-count]').forEach(function (el) {
      var ta = root.querySelector('#f-' + el.getAttribute('data-count'));
      var min = Number(el.getAttribute('data-min')) || 0;
      if (ta) el.textContent = ta.value.length + (min ? ' / ' + min + ' minimum' : '');
    });
  }

  function onInput(ev) {
    var form = ev.target.closest && ev.target.closest('form[data-n]');
    if (form) { drafts[form.getAttribute('data-n')] = collect(form); updateCounts(); }
  }

  function onChange(ev) {
    if (ev.target.id === 'lp-public') {
      LP.api('POST', 'settings', { auth: true, body: { showPublic: ev.target.checked } })
        .then(function (d) { me = d; LP.toast(ev.target.checked ? 'You are on the leaderboard.' : 'You are hidden from the leaderboard.'); })
        .catch(function (e) { LP.toast(e.message); });
    }
  }

  function onClick(ev) {
    var b = ev.target.closest && ev.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'signout') { LP.signOut(); start(); }
    if (act === 'open') { openForm = Number(b.getAttribute('data-n')); render(); var f = root.querySelector('form[data-n]'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    if (act === 'close') { openForm = null; render(); }
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
        openForm = null;
        var st = d.submission.status;
        LP.toast(st === 'passed' ? 'Week ' + n + ' passed.' : st === 'needs_work' ? 'Not there yet. Read the feedback.' : 'Submitted. A person will review it.');
        return LP.api('GET', 'me', { auth: true });
      })
      .then(function (d) { me = d; render(); })
      .catch(function (e) {
        btn.disabled = false;
        btn.textContent = 'Submit week ' + n;
        if (e.fields) {
          Object.keys(e.fields).forEach(function (k) { var el = form.querySelector('[data-err="' + k + '"]'); if (el) el.textContent = e.fields[k]; });
          var first = form.querySelector('.err:not(:empty)');
          if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (e.status === 401) {
          start();
        } else {
          LP.toast(e.message);
        }
      });
  }

  start();
})();
