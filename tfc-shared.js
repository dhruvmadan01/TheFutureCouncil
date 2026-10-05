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
  let scrollTimeout = null;

  function updateChatPosition() {
    if (isChatOpen) {
      document.documentElement.style.setProperty('--tfc-chat-bottom', '8px');
      return;
    }
    const isBarVisible = bar && !bar.classList.contains('hide');
    const bottomVal = isBarVisible ? '76px' : '20px';
    document.documentElement.style.setProperty('--tfc-chat-bottom', bottomVal);
    document.body.classList.toggle('tfc-bar-visible', isBarVisible);
  }

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

  // Micro-interaction on scroll
  window.addEventListener('scroll', () => {
    document.body.classList.add('tfc-scrolling');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      document.body.classList.remove('tfc-scrolling');
    }, 150);
  }, { passive: true });

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

  // Zapier Interfaces Chatbot Embed & Floating Companion
  (function initZapierChatbot() {
    function enhanceBot(bot) {
      if (!bot) return;

      // Apply style override natively supported by Zapier web component
      bot.setAttribute('style-override', 'bottom: var(--tfc-chat-bottom, 20px) !important; right: var(--tfc-chat-right, 20px) !important;');

      function injectShadowStyle() {
        if (!bot.shadowRoot) return false;
        if (bot.shadowRoot.getElementById('tfc-chatbot-style')) return true;

        const style = document.createElement('style');
        style.id = 'tfc-chatbot-style';
        style.textContent = `
          iframe.is-zpopup {
            transition: bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1), right 0.3s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          iframe.is-zpopup.is-zpopup__closed {
            bottom: var(--tfc-chat-bottom, 20px) !important;
            right: var(--tfc-chat-right, 20px) !important;
            animation: tfcChatFloat 4s ease-in-out infinite !important;
          }
          iframe.is-zpopup.is-zpopup__opened {
            bottom: 8px !important;
            right: 8px !important;
            animation: none !important;
          }
          @keyframes tfcChatFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
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

    function setupCompanionElements() {
      // 1. Ambient Pulse Ring behind chat icon
      if (!document.getElementById('tfcChatPulse')) {
        const pulse = document.createElement('div');
        pulse.id = 'tfcChatPulse';
        pulse.className = 'tfc-chat-pulse';
        document.body.appendChild(pulse);
      }

      // 2. Teaser Pill with cycling founder questions
      if (!document.getElementById('tfcChatTeaser') && !sessionStorage.getItem('tfc_chat_teaser_dismissed')) {
        const teaser = document.createElement('div');
        teaser.id = 'tfcChatTeaser';
        teaser.className = 'tfc-chat-teaser';
        teaser.setAttribute('role', 'button');
        teaser.setAttribute('tabindex', '0');
        teaser.setAttribute('aria-label', 'Open TFC Assistant Chat');

        const prompts = [
          'Ask about Launchpad Cohort 01',
          'Questions about Campus Chapters?',
          'Need help with your application?',
          'Ask about Demo Day & funding',
          'Have questions? Ask our AI assistant'
        ];
        let promptIndex = 0;

        teaser.innerHTML = `
          <div class="tfc-teaser-avatar">
            ⚡
            <span class="tfc-teaser-status-dot" aria-label="Online"></span>
          </div>
          <div class="tfc-teaser-body">
            <span class="tfc-teaser-header">TFC Assistant · Online</span>
            <span class="tfc-teaser-text" id="tfcTeaserText">${prompts[0]}</span>
          </div>
          <span class="tfc-teaser-arrow">↘</span>
          <button type="button" class="tfc-teaser-close" id="tfcTeaserClose" aria-label="Dismiss chat prompt">✕</button>
        `;

        document.body.appendChild(teaser);

        // Show teaser after brief friendly delay
        setTimeout(() => {
          if (!isChatOpen && !sessionStorage.getItem('tfc_chat_teaser_dismissed')) {
            teaser.classList.add('is-visible');
          }
        }, 2200);

        // Prompt rotation loop
        setInterval(() => {
          const textEl = document.getElementById('tfcTeaserText');
          if (!textEl || !teaser.classList.contains('is-visible') || isChatOpen) return;
          textEl.classList.add('fade-out');
          setTimeout(() => {
            promptIndex = (promptIndex + 1) % prompts.length;
            textEl.textContent = prompts[promptIndex];
            textEl.classList.remove('fade-out');
            textEl.classList.add('fade-in');
            setTimeout(() => textEl.classList.remove('fade-in'), 300);
          }, 250);
        }, 4500);

        // Dismiss button handler
        const closeBtn = document.getElementById('tfcTeaserClose');
        if (closeBtn) {
          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            teaser.classList.remove('is-visible');
            teaser.classList.add('is-hidden');
            sessionStorage.setItem('tfc_chat_teaser_dismissed', 'true');
          });
        }

        // Teaser click triggers the chat
        teaser.addEventListener('click', () => {
          const botEl = document.querySelector('zapier-interfaces-chatbot-embed');
          if (botEl && botEl.shadowRoot) {
            const iframe = botEl.shadowRoot.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage('openChatbot', '*');
            }
          }
        });

        teaser.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            teaser.click();
          }
        });
      }

      // Listen to Zapier iframe events (zChatbotOpened / zChatbotClosed)
      window.addEventListener('message', (e) => {
        const teaser = document.getElementById('tfcChatTeaser');
        const pulse = document.getElementById('tfcChatPulse');
        if (e.data === 'zChatbotOpened') {
          isChatOpen = true;
          updateChatPosition();
          if (teaser) teaser.classList.add('is-hidden');
          if (pulse) pulse.classList.add('is-hidden');
        } else if (e.data === 'zChatbotClosed') {
          isChatOpen = false;
          updateChatPosition();
          if (pulse) pulse.classList.remove('is-hidden');
          if (teaser && !sessionStorage.getItem('tfc_chat_teaser_dismissed')) {
            teaser.classList.remove('is-hidden');
          }
        }
      });
    }

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
      setupCompanionElements();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  })();
})();


