/**
 * The Future Council · Shared Interactive Logic
 * Handles Nav, Mobile Menu, Launchpad Countdown, and Sticky Bars
 */
(function() {
  const config = window.TFC_CONFIG || {
    APPLY_URL: '/launchpad/fellowship',
    LAUNCHPAD: {
      DEADLINE_ISO: '2026-10-15T23:59:59+05:30',
      DEADLINE_DISPLAY: 'Oct 15, 2026, 11:59 PM IST'
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
  const targetDateStr = (config.LAUNCHPAD && config.LAUNCHPAD.DEADLINE_ISO) || '2026-10-15T23:59:59+05:30';
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
      const displayLabel = config.LAUNCHPAD && config.LAUNCHPAD.DEADLINE_DISPLAY ? config.LAUNCHPAD.DEADLINE_DISPLAY : 'Oct 15, 11:59 PM IST';
      countdownEl.innerHTML = `${formattedShort}<small>Closes ${displayLabel} · Final deadline</small>`;
    }
  }

  updateDeadlines();
  setInterval(updateDeadlines, 30000);

  // Sticky bottom bar & Chatbot scroll coordination
  const bar = document.getElementById('bar');
  let isChatOpen = false;

  function updateChatPosition() {
    if (isChatOpen) {
      document.documentElement.style.setProperty('--tfc-chat-bottom', '8px');
      return;
    }
    const isBarVisible = bar && !bar.classList.contains('hide');
    const isMobile = window.innerWidth <= 640;
    let bottomVal;
    if (isBarVisible) {
      bottomVal = isMobile ? 'calc(58px + env(safe-area-inset-bottom, 0px) + 8px)' : '72px';
    } else {
      bottomVal = isMobile ? 'calc(16px + env(safe-area-inset-bottom, 0px))' : '20px';
    }
    document.documentElement.style.setProperty('--tfc-chat-bottom', bottomVal);
    document.body.classList.toggle('tfc-bar-visible', isBarVisible);
  }

  window.addEventListener('resize', updateChatPosition, { passive: true });

  if (bar) {
    const stepEl = document.getElementById('step');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (stepEl) {
        const sr = stepEl.getBoundingClientRect();
        if (y < 250 || (sr.top <= 0 && sr.bottom > 0)) {
          bar.classList.add('hide');
          updateChatPosition();
          return;
        }
      }
      if (y > 250) {
        bar.classList.remove('hide');
      } else {
        bar.classList.add('hide');
      }
      updateChatPosition();
    }, { passive: true });
  }

  updateChatPosition();

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

  // Zapier Interfaces Chatbot Embed - Clean positioning & fluid transitions
  (function initZapierChatbot() {
    function enhanceBot(bot) {
      if (!bot) return;

      bot.setAttribute('style-override', 'bottom: var(--tfc-chat-bottom, 20px) !important; right: var(--tfc-chat-right, 20px) !important;');

      function injectShadowStyle() {
        if (!bot.shadowRoot) return false;
        if (bot.shadowRoot.getElementById('tfc-chatbot-style')) return true;

        const style = document.createElement('style');
        style.id = 'tfc-chatbot-style';
        style.textContent = `
          iframe.is-zpopup {
            transition: bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            transform-origin: bottom right !important;
          }
          iframe.is-zpopup.is-zpopup__closed {
            bottom: var(--tfc-chat-bottom, 20px) !important;
            right: var(--tfc-chat-right, 20px) !important;
            transform: scale(var(--tfc-chat-scale, 1)) !important;
          }
          iframe.is-zpopup.is-zpopup__closed:hover {
            transform: scale(calc(var(--tfc-chat-scale, 1) * 1.05)) !important;
          }
          iframe.is-zpopup.is-zpopup__closed:active {
            transform: scale(calc(var(--tfc-chat-scale, 1) * 0.96)) !important;
          }
          iframe.is-zpopup.is-zpopup__opened {
            bottom: 8px !important;
            right: 8px !important;
            transform: none !important;
          }
        `;
        bot.shadowRoot.appendChild(style);
        return true;
      }

      if (!injectShadowStyle()) {
        const obs = new MutationObserver(() => {
          if (injectShadowStyle()) obs.disconnect();
        });
        obs.observe(bot, { childList: true, subtree: true });
        const timer = setInterval(() => {
          if (injectShadowStyle()) clearInterval(timer);
        }, 80);
        setTimeout(() => clearInterval(timer), 6000);
      }
    }

    // Listen to Zapier iframe open/close control messages
    window.addEventListener('message', (e) => {
      if (e.data === 'zChatbotOpened') {
        isChatOpen = true;
        updateChatPosition();
      } else if (e.data === 'zChatbotClosed') {
        isChatOpen = false;
        updateChatPosition();
      }
    });

    function inject() {
      let bot = document.querySelector('zapier-interfaces-chatbot-embed');

      if (!document.querySelector('script[src*="zapier-interfaces"]')) {
        const s = document.createElement('script');
        s.async = true;
        s.type = 'module';
        s.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
        document.head.appendChild(s);
      }

      if (!bot) {
        bot = document.createElement('zapier-interfaces-chatbot-embed');
        bot.setAttribute('is-popup', 'true');
        bot.setAttribute('chatbot-id', 'cmuvqje8m007k12f7521a40ah');
        bot.setAttribute('tracked-params', 'utm_source,utm_medium,utm_campaign,gclid,fbclid');
        document.body.appendChild(bot);
      }

      enhanceBot(bot);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  })();
})();



