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

  // Sticky bottom bar visibility
  // Sticky bottom bar visibility & body class coordination
  const bar = document.getElementById('bar');
  if (bar) {
    const stepEl = document.getElementById('step');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (stepEl) {
        const sr = stepEl.getBoundingClientRect();
        if (y < 250 || (sr.top <= 0 && sr.bottom > 0)) {
          bar.classList.add('hide');
          document.body.classList.remove('tfc-bar-visible');
          return;
        }
      }
      if (y > 250) {
        bar.classList.remove('hide');
        document.body.classList.add('tfc-bar-visible');
      } else {
        bar.classList.add('hide');
        document.body.classList.remove('tfc-bar-visible');
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

  // Zapier Interfaces Chatbot Embed & Interactive Companion
  (function initZapierChatbot() {
    function inject() {
      // 1. Mount script if missing
      if (!document.querySelector('script[src*="zapier-interfaces"]')) {
        const s = document.createElement('script');
        s.async = true;
        s.type = 'module';
        s.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
        document.head.appendChild(s);
      }

      // 2. Mount web component if missing
      if (!document.querySelector('zapier-interfaces-chatbot-embed')) {
        const bot = document.createElement('zapier-interfaces-chatbot-embed');
        bot.setAttribute('is-popup', 'true');
        bot.setAttribute('chatbot-id', 'cmuvqje8m007k12f7521a40ah');
        bot.setAttribute('tracked-params', 'utm_source,utm_medium,utm_campaign,gclid,fbclid');
        document.body.appendChild(bot);
      }

      // 3. Mount Ambient Pulse Glow behind trigger button
      if (!document.getElementById('tfcChatPulse')) {
        const pulse = document.createElement('div');
        pulse.id = 'tfcChatPulse';
        pulse.className = 'tfc-chat-pulse';
        pulse.setAttribute('aria-hidden', 'true');
        document.body.appendChild(pulse);
      }

      // 4. Mount Interactive Teaser Pill
      if (!document.getElementById('tfcChatTeaser')) {
        const teaser = document.createElement('div');
        teaser.id = 'tfcChatTeaser';
        teaser.className = 'tfc-chat-teaser';
        teaser.setAttribute('role', 'button');
        teaser.setAttribute('tabindex', '0');
        teaser.setAttribute('aria-label', 'Ask TFC Founder AI Advisor');

        teaser.innerHTML = `
          <div class="tfc-teaser-avatar">
            <span>⚡</span>
            <span class="tfc-teaser-status-dot"></span>
          </div>
          <div class="tfc-teaser-body">
            <div class="tfc-teaser-header">TFC AI Advisor · 24/7</div>
            <div class="tfc-teaser-text" id="tfcTeaserText">Ask: How do I get into Cohort 01?</div>
          </div>
          <span class="tfc-teaser-arrow">💬</span>
          <button class="tfc-teaser-close" id="tfcTeaserClose" type="button" aria-label="Dismiss suggestion">✕</button>
        `;
        document.body.appendChild(teaser);

        // Teaser Questions Rotation
        const prompts = [
          "Ask: How do I get into Cohort 01?",
          "Ask: What is the ₹999 Founder Pass?",
          "Ask: How does the 2% equity deal work?",
          "Ask: Can solo founders apply?",
          "Have questions? Ask our 24/7 AI Advisor"
        ];
        let promptIndex = 0;
        const textEl = document.getElementById('tfcTeaserText');

        const rotateInterval = setInterval(() => {
          if (!textEl || !teaser.classList.contains('is-visible')) return;
          textEl.classList.add('fade-out');
          setTimeout(() => {
            promptIndex = (promptIndex + 1) % prompts.length;
            textEl.textContent = prompts[promptIndex];
            textEl.classList.remove('fade-out');
            textEl.classList.add('fade-in');
            setTimeout(() => textEl.classList.remove('fade-in'), 300);
          }, 250);
        }, 4200);

        // Slide in teaser after 1.8s unless dismissed in session
        if (!sessionStorage.getItem('tfc_chat_teaser_dismissed')) {
          setTimeout(() => {
            teaser.classList.add('is-visible');
          }, 1800);
        }

        // Close/Dismiss button
        const closeBtn = document.getElementById('tfcTeaserClose');
        if (closeBtn) {
          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            teaser.classList.remove('is-visible');
            teaser.classList.add('is-hidden');
            clearInterval(rotateInterval);
            sessionStorage.setItem('tfc_chat_teaser_dismissed', '1');
          });
        }

        // Click on teaser pill: pulse and nudge user toward chatbot button
        teaser.addEventListener('click', () => {
          const pulse = document.getElementById('tfcChatPulse');
          if (pulse) {
            pulse.style.transform = 'scale(1.4)';
            setTimeout(() => { pulse.style.transform = ''; }, 600);
          }
          // Flash a friendly pointer
          let nudge = document.getElementById('tfcChatNudge');
          if (!nudge) {
            nudge = document.createElement('div');
            nudge.id = 'tfcChatNudge';
            nudge.className = 'tfc-chat-nudge';
            nudge.textContent = 'Click the chat icon to ask ↘';
            document.body.appendChild(nudge);
          }
          nudge.classList.add('is-shown');
          setTimeout(() => {
            nudge.classList.remove('is-shown');
          }, 2500);
        });

        teaser.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            teaser.click();
          }
        });
      }

      // 5. Listen to Zapier iframe events (zChatbotOpened / zChatbotClosed)
      window.addEventListener('message', (e) => {
        const teaser = document.getElementById('tfcChatTeaser');
        const pulse = document.getElementById('tfcChatPulse');
        if (e.data === 'zChatbotOpened') {
          if (teaser) teaser.classList.add('is-hidden');
          if (pulse) pulse.classList.add('is-hidden');
        } else if (e.data === 'zChatbotClosed') {
          if (pulse) pulse.classList.remove('is-hidden');
          if (teaser && !sessionStorage.getItem('tfc_chat_teaser_dismissed')) {
            teaser.classList.remove('is-hidden');
          }
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  })();
})();


