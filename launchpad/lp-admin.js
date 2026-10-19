/* Launchpad admin: review queue, Demo Days, ranking, pods */
(function () {
  'use strict';
  var root = document.getElementById('lp-app');
  var esc = LP.esc;
  var ov = null;
  var rankDay = null;     // selected demo day id
  var rank = null;        // { candidates, slots, poolMin, poolMax }
  var picked = {};        // enrollmentId -> true

  function start() {
    if (!LP.hasToken()) return LP.signInView(root, 'Sign in with an admin account', start);
    LP.api('GET', 'admin-overview', { auth: true }).then(function (d) { ov = d; render(); }).catch(function (e) {
      if (e.status === 401) return LP.signInView(root, 'Sign in with an admin account', start);
      root.innerHTML = '<p class="lp-notice">' + esc(e.status === 403 ? 'This account is not an admin. Add the email to LP_ADMIN_EMAILS in Vercel.' : e.message) + '</p>';
    });
  }

  function render() {
    var html = '<div class="lp-row between"><span class="lp-muted">Today ' + esc(LP.prettyDate(ov.today)) + ' · next intake ' + esc(LP.prettyDate(ov.nextIntake)) + ' · AI review ' + (ov.aiReview ? 'on' : '<b>off</b>') + '</span><button class="lp-btn2" data-act="signout">Sign out</button></div>';

    html += '<h2 class="lp-h2 pv-display">Needs a person (' + ov.pending.length + ')</h2>';
    if (!ov.pending.length) html += '<div class="lp-card lp-muted">Nothing waiting. Submissions the AI could not review land here.</div>';
    ov.pending.forEach(function (s) {
      html += '<div class="lp-card lp-form" data-sub="' + s.id + '"><div class="lp-row between"><b>Week ' + s.milestone + ': ' + esc(s.title) + '</b><span class="lp-muted">' + esc(s.founder) + ' · ' + esc(s.email) + '</span></div>';
      s.fields.forEach(function (f) {
        var v = (s.answers || {})[f.id];
        var link = LP.safeUrl(v);
        html += '<p style="margin:10px 0 0"><span class="lp-muted" style="font-size:13px">' + esc(f.label) + '</span><br>' + (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(link) + '</a>' : esc(v == null ? '' : v)) + '</p>';
      });
      html += '<label>Feedback to the founder</label><textarea class="fb" style="min-height:70px"></textarea><div class="lp-row" style="margin-top:10px"><button class="lp-btn2 solid" data-act="review" data-id="' + s.id + '" data-status="passed">Pass</button><button class="lp-btn2" data-act="review" data-id="' + s.id + '" data-status="needs_work">Needs work</button>' + (ov.aiReview ? '<button class="lp-btn2" data-act="rescore" data-id="' + s.id + '">Try AI again</button>' : '') + '</div></div>';
    });

    html += '<h2 class="lp-h2 pv-display">Demo Days</h2><div class="lp-card lp-form"><div class="lp-row" style="align-items:flex-end">' +
      '<div><label style="margin-top:0">Date</label><input id="dd-date" type="date" value="' + esc(ov.suggestedDemoDay) + '"></div>' +
      '<div><label style="margin-top:0">Title</label><input id="dd-title" placeholder="Demo Day"></div>' +
      '<div><label style="margin-top:0">Stream link</label><input id="dd-stream" placeholder="https://"></div>' +
      '<div><button class="lp-btn2 solid" data-act="newday">Add Demo Day</button></div></div></div>';
    ov.demoDays.forEach(function (d) {
      html += '<div class="lp-card"><div class="lp-row between"><div><b>' + esc(LP.prettyDate(d.heldOn)) + '</b> ' + (d.title ? esc(d.title) : '') + ' <span class="lp-tag ' + (d.status === 'done' ? 'ok' : '') + '">' + d.status + '</span> <span class="lp-muted">' + d.finalists + ' of ' + ov.slots + ' finalists</span></div>' +
        '<div class="lp-row"><button class="lp-btn2" data-act="rank" data-id="' + d.id + '">Rank &amp; pick</button>' +
        '<button class="lp-btn2" data-act="toggleday" data-id="' + d.id + '" data-status="' + (d.status === 'done' ? 'upcoming' : 'done') + '" data-date="' + esc(d.heldOn) + '" data-title="' + esc(d.title || '') + '" data-stream="' + esc(d.streamUrl || '') + '">Mark ' + (d.status === 'done' ? 'upcoming' : 'done') + '</button></div></div></div>';
    });

    if (rank) html += rankHtml();

    html += '<h2 class="lp-h2 pv-display">Batches and pods</h2>';
    ov.batches.forEach(function (b) {
      html += '<div class="lp-card"><div class="lp-row between"><div><b>' + esc(b.name) + '</b> <span class="lp-muted">starts ' + esc(LP.prettyDate(b.startsOn)) + ' · ' + b.founders + ' founders · ' + b.pods.length + ' pods</span></div><button class="lp-btn2" data-act="rebalance" data-id="' + b.id + '">Rebalance pods</button></div>' +
        '<p class="lp-muted" style="font-size:13px;margin:8px 0 0">' + b.pods.map(function (p) { return esc(p.name) + ' (' + p.members.length + ')'; }).join(' · ') + '</p></div>';
    });
    if (!ov.batches.length) html += '<div class="lp-card lp-muted">No batches yet. One is created when the first founder joins.</div>';

    root.innerHTML = html;
  }

  function rankHtml() {
    var day = ov.demoDays.filter(function (d) { return String(d.id) === String(rankDay); })[0];
    var n = Object.keys(picked).filter(function (k) { return picked[k]; }).length;
    var html = '<h2 class="lp-h2 pv-display">Rank and pick · ' + esc(day ? LP.prettyDate(day.heldOn) : '') + '</h2>' +
      '<div class="lp-notice">' + rank.candidates.length + ' eligible. Interview roughly the top ' + rank.poolMin + ' to ' + rank.poolMax + ', then pick up to ' + rank.slots + '. The AI score looks only at what they built and learned, and reads their written answers, not their links. Open the decks before you decide.</div>' +
      '<div class="lp-row" style="margin:10px 0"><button class="lp-btn2 solid" data-act="rankall">Score everyone without a score (AI)</button><button class="lp-btn2 solid" data-act="savefinal"' + (n && n <= rank.slots ? '' : ' disabled') + '>Save ' + n + ' finalist' + (n === 1 ? '' : 's') + '</button><span class="lp-muted" id="rank-status"></span></div>' +
      '<div class="lp-card" style="overflow-x:auto"><table class="lp-board"><thead><tr><th>Pick</th><th>Founder</th><th>Score</th><th>Notes</th><th>Interview notes</th></tr></thead><tbody>';
    rank.candidates.forEach(function (c) {
      var r = c.ranking || {};
      html += '<tr data-e="' + c.enrollmentId + '"><td><input type="checkbox" data-pick="' + c.enrollmentId + '"' + (picked[c.enrollmentId] ? ' checked' : '') + '></td>' +
        '<td><b>' + esc(c.name) + '</b><br><span class="lp-muted" style="font-size:13px">' + esc(c.college || '') + ' · ' + esc(c.email) + (c.rankedBefore ? ' · carried over ' + c.rankedBefore + '×' : '') + '</span></td>' +
        '<td><input class="sc" type="number" min="0" max="100" style="width:70px;padding:6px" value="' + (r.total == null ? '' : esc(r.total)) + '"></td>' +
        '<td style="font-size:13px;max-width:280px">' + esc(r.notes || '') + '</td>' +
        '<td><textarea class="in" style="min-height:60px;min-width:180px;padding:6px">' + esc(r.interviewNotes || '') + '</textarea><br><button class="lp-btn2" style="padding:3px 10px;font-size:13px" data-act="saverank" data-e="' + c.enrollmentId + '">Save</button></td></tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function loadRank(id) {
    rankDay = id;
    return LP.api('GET', 'admin-rank-candidates', { auth: true, query: { demoDayId: id } }).then(function (d) {
      rank = d; picked = {};
      d.candidates.forEach(function (c) { if (c.finalist) picked[c.enrollmentId] = true; });
      render();
    });
  }

  function fail(e) { LP.toast(e.message); }

  root.addEventListener('change', function (ev) {
    var id = ev.target.getAttribute && ev.target.getAttribute('data-pick');
    if (id) { picked[id] = ev.target.checked; render(); }
  });

  root.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    var id = b.getAttribute('data-id');
    if (act === 'signout') { LP.signOut(); start(); }
    if (act === 'review') {
      var fb = b.closest('[data-sub]').querySelector('.fb').value;
      LP.api('POST', 'admin-review', { auth: true, body: { submissionId: id, status: b.getAttribute('data-status'), feedback: fb } }).then(function () { LP.toast('Saved.'); start(); }).catch(fail);
    }
    if (act === 'rescore') {
      b.disabled = true;
      LP.api('POST', 'admin-rescore', { auth: true, body: { submissionId: id } }).then(function (d) { LP.toast('AI result: ' + d.submission.status); start(); }).catch(function (e) { b.disabled = false; fail(e); });
    }
    if (act === 'newday') {
      LP.api('POST', 'admin-demoday', { auth: true, body: { heldOn: root.querySelector('#dd-date').value, title: root.querySelector('#dd-title').value, streamUrl: root.querySelector('#dd-stream').value, status: 'upcoming' } }).then(function () { LP.toast('Demo Day added.'); start(); }).catch(fail);
    }
    if (act === 'toggleday') {
      LP.api('POST', 'admin-demoday', { auth: true, body: { id: id, heldOn: b.getAttribute('data-date'), title: b.getAttribute('data-title'), streamUrl: b.getAttribute('data-stream'), status: b.getAttribute('data-status') } }).then(function () { start(); }).catch(fail);
    }
    if (act === 'rank') loadRank(id).catch(fail);
    if (act === 'rebalance') {
      if (!confirm('Rebalance the pods in this batch? Founders may move between pods.')) return;
      LP.api('POST', 'admin-rebalance', { auth: true, body: { batchId: id } }).then(function (d) { LP.toast('Now ' + d.pods + ' pods for ' + d.founders + ' founders.'); start(); }).catch(fail);
    }
    if (act === 'saverank') {
      var row = b.closest('tr');
      var e = b.getAttribute('data-e');
      LP.api('POST', 'admin-rank-save', { auth: true, body: { demoDayId: rankDay, enrollmentId: e, total: row.querySelector('.sc').value, interviewNotes: row.querySelector('.in').value } }).then(function () { LP.toast('Saved.'); }).catch(fail);
    }
    if (act === 'rankall') rankAll(b);
    if (act === 'savefinal') {
      // Order finalists by score, highest first.
      var ids = rank.candidates.filter(function (c) { return picked[c.enrollmentId]; })
        .sort(function (a, c) { return ((c.ranking ? Number(c.ranking.total) : -1) - (a.ranking ? Number(a.ranking.total) : -1)); })
        .map(function (c) { return c.enrollmentId; });
      LP.api('POST', 'admin-finalists', { auth: true, body: { demoDayId: rankDay, enrollmentIds: ids } }).then(function (d) { LP.toast(d.count + ' finalists saved.'); start(); }).catch(fail);
    }
  });

  function rankAll(btn) {
    var todo = rank.candidates.filter(function (c) { return !c.ranking || c.ranking.total == null; });
    btn.disabled = true;
    var i = 0;
    function status(t) { var s = root.querySelector('#rank-status'); if (s) s.textContent = t; }
    function next() {
      if (i >= todo.length) { status(''); return loadRank(rankDay); }
      status('Scoring ' + (i + 1) + ' of ' + todo.length + '…');
      return LP.api('POST', 'admin-rank-one', { auth: true, body: { demoDayId: rankDay, enrollmentId: todo[i].enrollmentId } })
        .then(function () { i += 1; return next(); });
    }
    if (!todo.length) { btn.disabled = false; return LP.toast('Everyone already has a score.'); }
    next().catch(function (e) { btn.disabled = false; LP.toast(e.message + ' Stopped at ' + (i + 1) + ' of ' + todo.length + '.'); });
  }

  start();
})();
