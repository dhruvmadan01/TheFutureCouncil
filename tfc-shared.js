/**
 * The Future Council · Shared Interactive Logic
 * Handles Nav, Mobile Menu and Sticky Bars
 */
(function() {
  const config = window.TFC_CONFIG || {
    APPLY_URL: '/launchpad/fellowship',
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
