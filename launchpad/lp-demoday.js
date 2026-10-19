(function () {
  'use strict';
  var root = document.getElementById('lp-app');
  var esc = LP.esc;

  function finalists(day) {
    if (!day.finalists || !day.finalists.length) return '<p class="lp-muted">Finalists are announced after the interviews.</p>';
    return '<div class="lp-grid">' + day.finalists.map(function (f) {
      var pitch = day.status === 'done' && LP.safeUrl(f.pitchUrl) ? '<p style="margin:10px 0 0"><a href="' + esc(LP.safeUrl(f.pitchUrl)) + '" target="_blank" rel="noopener">Watch the pitch &#8599;</a></p>' : '';
      return '<div class="lp-card"><span class="lp-tag">#' + f.position + '</span><h3 class="lp-h3" style="margin-top:10px">' + esc(f.startupName || 'Startup') + '</h3><p class="lp-p" style="margin:0 0 8px">' + esc(f.oneLiner || '') + '</p><p class="lp-muted" style="margin:0;font-size:14px">' + esc(f.name) + (f.college ? ' · ' + esc(f.college) : '') + '</p>' + pitch + '</div>';
    }).join('') + '</div>';
  }

  LP.api('GET', 'demo-day').then(function (d) {
    var html = '';
    if (d.upcoming) {
      html += '<h2 class="lp-h2 pv-display" style="margin-top:0">Next Demo Day · ' + esc(LP.prettyDate(d.upcoming.heldOn)) + '</h2>';
      if (LP.safeUrl(d.upcoming.streamUrl)) html += '<p><a class="pv-btn" href="' + esc(LP.safeUrl(d.upcoming.streamUrl)) + '" target="_blank" rel="noopener">Watch live</a></p>';
      html += finalists(d.upcoming);
    } else {
      html += '<div class="lp-card"><b>The next Demo Day will be announced here.</b><p class="lp-muted" style="margin:6px 0 0">Founders who finish the eight weeks are ranked, interviewed, and up to ' + d.slots + ' pitch to investors.</p></div>';
    }
    html += '<h2 class="lp-h2 pv-display">How you get on stage</h2><ol class="lp-list"><li>Pass weeks 1 to 7 and submit your final submission in week 8.</li><li>Submissions are scored on demand, execution, pitch and momentum. College and grades are not part of the score.</li><li>The top 25 to 30 are interviewed by the Launchpad team.</li><li>Up to ' + d.slots + ' founders are picked as founders of the month and pitch live to investors.</li><li>If you are not picked, you stay in the pool for the next two Demo Days.</li></ol>';
    if (d.past && d.past.length) {
      html += '<h2 class="lp-h2 pv-display">Past Demo Days</h2>';
      d.past.forEach(function (p) { html += '<h3 class="lp-h3">' + esc(LP.prettyDate(p.heldOn)) + (p.title ? ' · ' + esc(p.title) : '') + '</h3>' + finalists(p); });
    }
    html += '<div class="pv-actions" style="margin-top:32px"><a class="pv-btn" href="/launchpad/dashboard">Join the next batch</a><a class="pv-note" href="/investors">Investors: how to attend</a></div>';
    root.innerHTML = html;
  }).catch(function (e) {
    root.innerHTML = '<p class="lp-notice">' + esc(e.status === 503 ? 'Demo Day opens when Launchpad does.' : e.message) + '</p>';
  });
})();
