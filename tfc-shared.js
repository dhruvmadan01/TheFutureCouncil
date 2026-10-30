/**
 * The Future Council · Shared Interactive Logic
 * Handles Nav, Mobile Menu, Program Countdown, and Sticky Bars
 */
(function() {
  const config = window.TFC_CONFIG || {
    APPLY_URL: '/join',
    LAUNCHPAD: null
  };

  // Mobile Nav Drawer Toggle
  const toggleBtn = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '☰';
      });
    });
  }

  // Countdown timer: driven by config.LAUNCHPAD.DEADLINE_ISO when a program is running.
  // No active program means nothing to count down to, so the bar and clock stay hidden.
  const targetDateStr = config.LAUNCHPAD && config.LAUNCHPAD.DEADLINE_ISO;
  const targetDate = targetDateStr ? new Date(targetDateStr).getTime() : null;

  function updateDeadlines() {
    const now = Date.now();
    const barEl = document.getElementById('bar');
    const barCountEl = document.getElementById('barCount');
    const countdownEl = document.getElementById('countdown');

    if (targetDate === null) {
      if (barEl) { barEl.classList.add('hide'); }
      if (countdownEl) { countdownEl.textContent = ''; }
      return;
    }

    const diff = targetDate - now;

    if (diff <= 0) {
      if (countdownEl) {
        countdownEl.innerHTML = 'Applications closed<small>Join the waitlist for the next cohort</small>';
      }
      if (barCountEl) {
        barCountEl.textContent = 'Closed';
      }
      if (barEl) {
        barEl.classList.add('hide');
      }
      return;
    }

    // Floor calculation
    const totalSeconds = Math.floor(diff / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);

    // Show "Xd Yh" when over 24h, switch to "Xh Ym" when under 24h
    const formattedShort = d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;

    if (barCountEl) {
      barCountEl.textContent = formattedShort;
    }

    if (countdownEl) {
      const displayLabel = config.LAUNCHPAD && config.LAUNCHPAD.DEADLINE_DISPLAY;
      countdownEl.innerHTML = displayLabel ? `${formattedShort}<small>Closes ${displayLabel}</small>` : formattedShort;
    }
  }

  updateDeadlines();
  setInterval(updateDeadlines, 30000);

  // Sticky bottom bar visibility
  const bar = document.getElementById('bar');
  if (bar) {
    const stepEl = document.getElementById('step');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (stepEl) {
        const sr = stepEl.getBoundingClientRect();
        if (y < 250 || (sr.top <= 0 && sr.bottom > 0)) {
          bar.classList.add('hide');
          return;
        }
      }
      if (y > 250) {
        bar.classList.remove('hide');
      } else {
        bar.classList.add('hide');
      }
    }, { passive: true });
  }

  // Active link highlighter
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const cleanHref = href.replace(/\/$/, '').replace(/\.html$/, '');
    if (cleanHref === currentPath || (currentPath === '' && cleanHref === '/') || (cleanHref !== '' && cleanHref !== '/' && currentPath.startsWith(cleanHref))) {
      a.classList.add('active');
    }
  });

  // Global CTA unify to APPLY_URL where specified
  if (config.APPLY_URL) {
    document.querySelectorAll('[data-apply-cta]').forEach(cta => {
      cta.setAttribute('href', config.APPLY_URL);
    });
  }
})();

