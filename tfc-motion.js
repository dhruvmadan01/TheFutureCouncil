/* TFC motion layer. No dependencies. Runs after parse (defer). */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('mo') || !('IntersectionObserver' in window)) { root.classList.remove('mo'); return; }

  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* 1. scroll progress bar + header depth + hero sun parallax (one rAF-throttled handler) */
  var bar = document.createElement('div'); bar.className = 'mo-bar'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var header = document.querySelector('.pv-site-header');
  var sun = null, hero = document.querySelector('.pv-home-hero, .pv-page-hero');
  if (hero) {
    sun = document.createElement('div'); sun.className = 'mo-sun'; sun.setAttribute('aria-hidden', 'true');
    hero.insertBefore(sun, hero.firstChild);
    raf(function () { raf(function () { sun.classList.add('mo-up'); sun.style.transform = 'translate3d(0,0,0)'; }); });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    raf(function () {
      var y = window.pageYOffset || root.scrollTop;
      var h = root.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
      if (header) header.classList.toggle('mo-scrolled', y > 8);
      if (sun && y < 1400) sun.style.transform = 'translate3d(0,' + (-y * 0.18) + 'px,0)';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 2. hero headline: split into words that rise in */
  var wi = 0;
  function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('span'); s.className = 'mo-w'; s.style.setProperty('--w', wi++); s.textContent = p; frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) { split(n); }
    });
  }
  var h1 = document.querySelector('.pv-home-hero h1, .pv-page-hero h1');
  if (h1) {
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    h1.className += ' mo-hl'; split(h1);
    raf(function () { raf(function () { h1.classList.add('mo-in'); }); });
  }

  /* 3. count-up numbers */
  function countUp(el) {
    var t = el.textContent, m = t.match(/\d[\d,]*/);
    if (!m) return;
    var target = parseInt(m[0].replace(/,/g, ''), 10), hasComma = m[0].indexOf(',') > -1;
    var from = 0;
    if (target === 0) { if (t.indexOf('%') > -1) from = 100; else return; }
    var pre = t.slice(0, m.index), post = t.slice(m.index + m[0].length), dur = 1400, t0 = null;
    function fmt(v) { v = Math.round(v); return hasComma ? v.toLocaleString('en-IN') : String(v); }
    el.textContent = pre + fmt(from) + post;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(from + (target - from) * e) + post;
      if (p < 1) raf(step); else el.textContent = t;
    }
    raf(step);
  }
  var counters = document.querySelectorAll('.pv-fact b, .pv-big');
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { cio.unobserve(e.target); countUp(e.target); } });
  }, { threshold: 0.6 });
  Array.prototype.forEach.call(counters, function (c) { cio.observe(c); });

  /* 4. reveal on scroll with sibling stagger */
  var sel = '.pv-section-head,.pv-cell,.pv-row,.pv-step,.pv-fact,.pv-vs>div,.pv-letter,.partner-card,.receipt,.legal-sec,.form-shell,' +
            '.pv-cta-band .pv-wrap>*,.pv-ink-band .pv-label,.pv-ink-band .pv-big-h2,' +
            '.pv-page-hero .pv-label,.pv-page-hero .pv-lede,.pv-page-hero .pv-actions,.pv-page-hero .pv-sign,' +
            '.pv-home-hero .pv-label,.pv-home-hero .pv-tag-row,.pv-home-hero .pv-lede,.pv-home-hero .pv-actions,.pv-home-hero .pv-hero-mark,' +
            '.partner-hero .wrap>*';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (el) {
    return !el.closest('.pv-site-header,.pv-site-footer,.mobile-menu');
  });
  var counts = new Map();
  els.forEach(function (el) {
    if (el.parentElement && el.parentElement.closest('.mo-r')) return;
    var p = el.parentElement, i = counts.get(p) || 0; counts.set(p, i + 1);
    el.style.setProperty('--i', Math.min(i, 6));
    el.classList.add('mo-r');
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('mo-in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  Array.prototype.forEach.call(document.querySelectorAll('.mo-r'), function (el) { io.observe(el); });

  /* failsafe: never leave content hidden */
  setTimeout(function () {
    Array.prototype.forEach.call(document.querySelectorAll('.mo-r:not(.mo-in)'), function (el) {
      var r = el.getBoundingClientRect(); if (r.top < window.innerHeight * 1.2) el.classList.add('mo-in');
    });
  }, 2500);
})();
