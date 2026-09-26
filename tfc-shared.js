/**
 * The Future Council · Shared Interactive Logic
 * Handles Nav, Mobile Menu, Launchpad Countdown, and Sticky Bars
 */
(function() {
  const config = window.TFC_CONFIG || {
    APPLY_URL: '/launchpad/fellowship',
    LAUNCHPAD: {
      DEADLINE_ISO: '2026-09-30T19:00:00+05:30',
      DEADLINE_DISPLAY: 'Sep 30, 2026, 7 PM IST'
    }
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

  // Countdown timer to Launchpad Cohort 01 deadline
  const targetDateStr = (config.LAUNCHPAD && config.LAUNCHPAD.DEADLINE_ISO) || '2026-09-30T19:00:00+05:30';
  const targetDate = new Date(targetDateStr).getTime();

  function updateDeadlines() {
    const now = Date.now();
    const diff = targetDate - now;
    const barEl = document.getElementById('bar');
    const barCountEl = document.getElementById('barCount');
    const countdownEl = document.getElementById('countdown');

    if (diff <= 0) {
      if (countdownEl) {
        countdownEl.innerHTML = 'Applications closed<small>Join waitlist for Cohort 02</small>';
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
      const displayLabel = config.LAUNCHPAD && config.LAUNCHPAD.DEADLINE_DISPLAY ? config.LAUNCHPAD.DEADLINE_DISPLAY : 'Sep 30, 7 PM IST';
      countdownEl.innerHTML = `${formattedShort}<small>Closes ${displayLabel}</small>`;
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
