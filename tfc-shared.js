/**
 * The Future Council · Shared Interactive Logic
 * Handles Nav, Mobile Menu, Launchpad Countdown, and Sticky Bars
 */
(function() {
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

  // Countdown timer to Launchpad Cohort 01 deadline: Sep 30, 2026 19:00:00 IST (UTC+5:30)
  const targetDate = new Date('2026-09-30T19:00:00+05:30').getTime();

  function updateDeadlines() {
    const now = Date.now();
    const diff = targetDate - now;
    const barEl = document.getElementById('bar');
    const barCountEl = document.getElementById('barCount');
    const countdownEl = document.getElementById('countdown');

    if (diff <= 0) {
      if (countdownEl) countdownEl.innerHTML = 'Applications closed<small>Join waitlist for Cohort 02</small>';
      if (barCountEl) barCountEl.textContent = 'Closed';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);

    const formattedShort = d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;

    if (barCountEl) {
      barCountEl.textContent = formattedShort;
    }

    if (countdownEl) {
      countdownEl.innerHTML = `${d}d ${h}h ${m}m<small>Closes Sep 30, 7 PM IST</small>`;
    }
  }

  updateDeadlines();
  setInterval(updateDeadlines, 30000);

  // Sticky bottom bar visibility
  const bar = document.getElementById('bar');
  if (bar) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      // Show bar after scrolling down past the first 250px
      if (y > 250) {
        bar.classList.remove('hide');
      } else {
        bar.classList.add('hide');
      }
      lastY = y;
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
})();
