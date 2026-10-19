(function () {
  'use strict';
  var root = document.getElementById('lp-app');
  var esc = LP.esc;
  Promise.all([LP.api('GET', 'leaderboard'), LP.api('GET', 'wins').catch(function () { return { wins: [] }; })]).then(function (r) {
    var d = r[0], wins = r[1].wins;
    var html = '';
    if (wins.length) {
      html += '<h2 class="lp-h2 pv-display" style="margin-top:0">Recent wins</h2><div class="lp-card"><ul class="lp-feed" style="max-height:none">' + wins.map(function (w) { return '<li><span class="win">&#10003; ' + esc(w.name) + '</span> passed Week ' + w.milestone + ': ' + esc(w.title) + (w.college ? ' <span class="lp-muted">· ' + esc(w.college) + '</span>' : '') + '<div class="meta">' + esc(LP.prettyDate(String(w.at).slice(0, 10))) + '</div></li>'; }).join('') + '</ul></div>';
    }
    if (!d.individuals.length && !d.pods.length) {
      root.innerHTML = '<div class="lp-card"><b>No one is on the board yet.</b><p class="lp-muted" style="margin:6px 0 0">Founders appear here after they pass their first week. <a href="/launchpad/dashboard">Start Week 1</a>.</p></div>';
      return;
    }
    html += '<h2 class="lp-h2 pv-display"' + (wins.length ? '' : ' style="margin-top:0"') + '>Founders</h2><div class="lp-card" style="overflow-x:auto"><table class="lp-board"><thead><tr><th>#</th><th>Founder</th><th>College</th><th>Joined</th><th>Weeks passed</th></tr></thead><tbody>';
    d.individuals.forEach(function (r, i) {
      html += '<tr><td>' + (i + 1) + '</td><td><b>' + esc(r.name) + '</b></td><td>' + esc(r.college || '') + '</td><td>' + esc(r.batch) + '</td><td><div class="lp-bar"><i style="width:' + Math.round(r.passed / 8 * 100) + '%"></i></div> ' + r.passed + '/8</td></tr>';
    });
    html += '</tbody></table></div>';
    html += '<h2 class="lp-h2 pv-display">Pods</h2><div class="lp-card" style="overflow-x:auto"><table class="lp-board"><thead><tr><th>#</th><th>Pod</th><th>Joined</th><th>Members</th><th>Average weeks passed</th></tr></thead><tbody>';
    d.pods.forEach(function (p, i) {
      html += '<tr><td>' + (i + 1) + '</td><td><b>' + esc(p.name) + '</b></td><td>' + esc(p.batch) + '</td><td>' + p.members + '</td><td>' + p.average + '</td></tr>';
    });
    html += '</tbody></table></div><p class="lp-credit">' + d.founders + ' founders have joined so far. You can hide yourself from this board in your dashboard settings.</p>';
    root.innerHTML = html;
  }).catch(function (e) {
    root.innerHTML = '<p class="lp-notice">' + esc(e.status === 503 ? 'The leaderboard opens when Launchpad does.' : e.message) + '</p>';
  });
})();
