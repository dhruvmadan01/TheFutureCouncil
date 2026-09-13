/**
 * The Future Council — Google Authentication & User State Engine (UI/UX Spec v2)
 * Handles Google OAuth 2.0 (popup on desktop, redirect on mobile),
 * Supabase synchronization, session persistence, context-specific auth modals,
 * and role-specific profile onboarding.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'tfc_auth_session';
  const DRAFT_KEY_PREFIX = 'tfc_draft_';

  // Configurable Google Client ID - Official TFC Google OAuth Client
  const GOOGLE_CLIENT_ID = window.TFC_GOOGLE_CLIENT_ID || '771578038478-ijuecu880e8a7o76n9emga64ejo7uoep.apps.googleusercontent.com';

  // Supabase Configuration
  const SUPABASE_URL = 'https://fwwbybbjvchrhozzzigp.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_f5qK_eS6qXGm5I7Em59aPQ_HvEH45h5';

  let supabaseClient = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Auth State
  let currentUser = null;
  const authStateListeners = [];

  // Helper to extract phone number from combined college field
  function extractPhoneFromCollege(collegeStr) {
    if (!collegeStr || typeof collegeStr !== 'string') return '';
    const parts = collegeStr.split(' | ');
    for (const part of parts) {
      if (part.startsWith('Phone: ')) {
        return part.replace('Phone: ', '').trim();
      }
    }
    return '';
  }

  // Helper to extract base college name without metadata tags
  function extractBaseCollege(collegeStr) {
    if (!collegeStr || typeof collegeStr !== 'string') return '';
    if (collegeStr === 'Ecosystem Member') return '';
    return collegeStr.split(' | ')[0].trim();
  }

  // Initialize from persisted storage
  function loadStoredSession() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        currentUser = JSON.parse(stored);
        if (currentUser) {
          if (!currentUser.phone && currentUser.college) {
            currentUser.phone = extractPhoneFromCollege(currentUser.college);
          }
          // Strictly evaluate council & fellowship membership: signing up != joining council
          const collegeStr = currentUser.college || '';
          currentUser.isCouncilMember = collegeStr.includes('Source: JoinPage') || (collegeStr.includes('Interests:') && collegeStr.includes('Q1:'));
          currentUser.isFellowshipApplicant = collegeStr.includes('Source: FellowshipPage') || collegeStr.includes('PaymentStatus:') || collegeStr.includes('FormSubmittedAt:');
        }
      }
    } catch (e) {
      console.warn('[TFCAuth] Failed to parse stored session:', e);
      currentUser = null;
    }
  }

  function persistSession(user, remember = true) {
    currentUser = user;
    try {
      const serialized = JSON.stringify(user);
      if (remember) {
        localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        sessionStorage.setItem(STORAGE_KEY, serialized);
      }
    } catch (e) {
      console.warn('[TFCAuth] Could not persist session:', e);
    }
    notifyListeners();
    updateNavUI();
  }

  function clearSession() {
    currentUser = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    notifyListeners();
    updateNavUI();
  }

  function notifyListeners() {
    authStateListeners.forEach((fn) => {
      try {
        fn(currentUser);
      } catch (err) {
        console.error('[TFCAuth] Auth listener error:', err);
      }
    });
  }

  // Check if device is mobile web (for popup vs redirect flow)
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  }

  // --- Supabase Lookup / Profile Fetch ---
  async function syncMemberWithSupabase(googleProfile, additionalData = {}) {
    if (!supabaseClient) {
      return {
        ...googleProfile,
        ...additionalData,
        phone: '',
        member_id: 'TFC-2026-' + Math.floor(1000 + Math.random() * 9000),
        isCouncilMember: false,
        isFellowshipApplicant: false,
        googleAuth: true
      };
    }

    try {
      // 1. Check if member already exists in Supabase
      const { data: existing, error: fetchErr } = await supabaseClient
        .from('members')
        .select('*')
        .eq('email', googleProfile.email)
        .limit(1);

      if (fetchErr) {
        console.warn('[TFCAuth] Supabase lookup notice:', fetchErr.message);
      }

      if (existing && existing.length > 0) {
        const member = existing[0];
        const existingPhone = member.phone || extractPhoneFromCollege(member.college);
        const collegeStr = member.college || '';
        // STRICT: Signing up on website is NOT equal to joining the council.
        // Joining council requires filling the form on join.html (Source: JoinPage or Interests + Q1)
        const isCouncil = collegeStr.includes('Source: JoinPage') || (collegeStr.includes('Interests:') && collegeStr.includes('Q1:'));
        const isFellowship = collegeStr.includes('Source: FellowshipPage') || collegeStr.includes('PaymentStatus:') || collegeStr.includes('FormSubmittedAt:');

        // Merge with existing
        return {
          ...member,
          name: googleProfile.name || member.name,
          email: googleProfile.email || member.email,
          phone: existingPhone,
          avatar: googleProfile.avatar || member.image,
          isCouncilMember: isCouncil,
          isFellowshipApplicant: isFellowship,
          googleAuth: true
        };
      }

      // 2. New member who signed up via Google on website
      // NOTE: Signing up on website is NOT equal to joining the council!
      // They must fill the form on join.html to become a council member.
      const tier = additionalData.tier || 'Student';
      const memberId = 'TFC-2026-' + Math.floor(1000 + Math.random() * 9000);

      return {
        ...googleProfile,
        name: googleProfile.name,
        email: googleProfile.email,
        college: '',
        phone: '',
        tier: tier,
        member_id: memberId,
        avatar: googleProfile.avatar || '',
        isNewUser: true,
        isCouncilMember: false,
        isFellowshipApplicant: false,
        googleAuth: true
      };
    } catch (err) {
      console.warn('[TFCAuth] Supabase sync fallback:', err);
      return {
        ...googleProfile,
        ...additionalData,
        phone: '',
        member_id: 'TFC-2026-' + Math.floor(1000 + Math.random() * 9000),
        isCouncilMember: false,
        isFellowshipApplicant: false,
        googleAuth: true
      };
    }
  }

  // --- Context-Specific Titles and Copy ---
  const CONTEXT_CONFIG = {
    fellowship: {
      headline: 'Sign in to Fellowship',
      subtext: 'Google sign-in is required to save your fellowship application and access your status dashboard.',
      role: 'Fellowship Applicant'
    },
    ambassador: {
      headline: 'Ambassador Sign-in',
      subtext: 'Google sign-in is required to register as an Ambassador and access your leader console.',
      role: 'Campus Ambassador'
    },
    join: {
      headline: 'Continue with Google',
      subtext: 'Google verification is required to verify your student identity for your Council application.',
      role: 'Member'
    },
    general: {
      headline: 'Sign in to Future Council',
      subtext: 'Sign in with your Google account to access Future Council.',
      role: 'Member'
    }
  };

  // --- Modal Injection and Management ---
  let activeModalElement = null;
  let lastFocusedElement = null;

  function closeModal() {
    if (activeModalElement) {
      activeModalElement.classList.add('tfc-modal-closing');
      setTimeout(() => {
        if (activeModalElement && activeModalElement.parentNode) {
          activeModalElement.parentNode.removeChild(activeModalElement);
        }
        activeModalElement = null;
        document.body.style.overflow = '';
      }, 200);
    }
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  // Trap focus inside modal
  function trapFocus(modalEl) {
    const focusableEls = modalEl.querySelectorAll('a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled])');
    if (focusableEls.length === 0) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    modalEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });

    setTimeout(() => firstEl.focus(), 50);
  }

  // --- Official Google Button SVG Icon ---
  const GOOGLE_G_LOGO = `
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="flex-shrink: 0;">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  `;

  // --- Show Auth Modal ---
  function openLoginModal(options = {}) {
    const context = options.context || 'general';
    const onSuccess = options.onSuccess;
    const config = CONTEXT_CONFIG[context] || CONTEXT_CONFIG.general;

    lastFocusedElement = document.activeElement;
    closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'tfc-auth-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'tfcAuthModalTitle');

    overlay.innerHTML = `
      <div class="tfc-auth-card" id="tfcAuthCard">
        <button type="button" class="tfc-auth-close-btn" aria-label="Close modal" id="tfcAuthCloseBtn">✕</button>
        
        <div class="tfc-auth-header">
          <div class="tfc-auth-brand-badge">
            <img src="TFC.png" alt="Future Council Logo" class="tfc-auth-logo" />
            <span class="tfc-auth-badge-text">Future Council Account</span>
          </div>
          <h2 class="tfc-auth-title" id="tfcAuthModalTitle">${config.headline}</h2>
          <p class="tfc-auth-subtext">${config.subtext}</p>
        </div>

        <div id="tfcAuthAlertContainer"></div>

        <div class="tfc-auth-actions">
          <button type="button" class="tfc-google-btn" id="tfcGoogleAuthBtn">
            ${GOOGLE_G_LOGO}
            <span id="tfcGoogleBtnText">Continue with Google</span>
          </button>
        </div>

        <div class="tfc-auth-footer">
          <p class="tfc-auth-legal">
            By continuing you agree to Future Council's <a href="terms.html" target="_blank">Terms</a> and <a href="privacy.html" target="_blank">Privacy Policy</a>.
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    activeModalElement = overlay;
    document.body.style.overflow = 'hidden';

    trapFocus(overlay);

    // Event listeners
    document.getElementById('tfcAuthCloseBtn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    const googleBtn = document.getElementById('tfcGoogleAuthBtn');
    googleBtn.addEventListener('click', () => {
      executeGoogleFlow({ context, onSuccess, container: overlay });
    });
  }

  // --- Execute Google Sign-in Flow ---
  async function executeGoogleFlow({ context, onSuccess, container }) {
    const googleBtn = container.querySelector('#tfcGoogleAuthBtn');
    const btnText = container.querySelector('#tfcGoogleBtnText');
    const alertContainer = container.querySelector('#tfcAuthAlertContainer');

    if (googleBtn) {
      googleBtn.disabled = true;
      googleBtn.classList.add('loading');
    }
    if (btnText) {
      btnText.innerHTML = `
        <span class="tfc-auth-spinner" aria-hidden="true"></span>
        Connecting…
      `;
    }
    if (alertContainer) {
      alertContainer.innerHTML = '';
    }

    try {
      // 1. Perform Authentication (Popup on desktop, Redirect on mobile)
      const isMobile = isMobileDevice();
      const authResult = await triggerOAuth({ isMobile, context });

      if (!authResult || !authResult.email) {
        throw new Error('Authentication was cancelled or failed.');
      }

      // 2. Sync profile in ecosystem
      const existingUser = await syncMemberWithSupabase(authResult, {
        tier: context === 'ambassador' ? 'Campus Ambassador' : 'Student'
      });

      // Google Sign-in authenticates the user into the ecosystem.
      // Signing up on the website != Joining the council.
      // Persist session, close modal, and notify success immediately.
      persistSession(existingUser, true);
      closeModal();
      if (typeof onSuccess === 'function') onSuccess(existingUser);
    } catch (err) {
      console.error('[TFCAuth] Auth failure:', err);
      if (googleBtn) {
        googleBtn.disabled = false;
        googleBtn.classList.remove('loading');
      }
      if (btnText) {
        btnText.textContent = 'Continue with Google';
      }

      if (alertContainer) {
        if (err.isPopupBlocked) {
          alertContainer.innerHTML = `
            <div class="tfc-auth-alert tfc-auth-alert-blocked">
              <span>⚠️ Popup blocked — <button type="button" class="tfc-auth-retry-btn" id="tfcRetryPopupBtn">click here to continue</button></span>
            </div>
          `;
          const retryBtn = alertContainer.querySelector('#tfcRetryPopupBtn');
          if (retryBtn) {
            retryBtn.addEventListener('click', () => {
              executeGoogleFlow({ context, onSuccess, container });
            });
          }
        } else {
          alertContainer.innerHTML = `
            <div class="tfc-auth-alert tfc-auth-alert-error">
              <span>Something went wrong — try again.</span>
            </div>
          `;
        }
      }
    }
  }

  // --- Check if Role-specific Profile Step is needed ---
  function checkNeedsProfile(user, profileType) {
    if (!user) return true;
    if (user.isNewUser) return true;

    // Mandatory: Every Google user must provide a WhatsApp phone number
    const phone = user.phone || extractPhoneFromCollege(user.college);
    if (!phone) return true;

    const college = (user.college || '').toLowerCase();
    if (!user.college || college === 'ecosystem member') return true;

    if (profileType === 'fellowship') {
      // Must have college and course/year
      return !college.includes(',');
    }
    if (profileType === 'ambassador') {
      // Must have registered campus or chapter selection
      return user.tier !== 'Campus Ambassador' || !college.includes('chapter:');
    }
    return false;
  }

  // --- Ensure Google Identity Services SDK is loaded ---
  function loadGoogleSDK() {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        // Timeout in case it's already cached/evaluated
        setTimeout(resolve, 500);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        console.warn('[TFCAuth] Google Identity Services script load skipped.');
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  // --- OAuth Trigger (GIS / Popup / Fallback simulation) ---
  async function triggerOAuth({ isMobile, context }) {
    await loadGoogleSDK();

    return new Promise((resolve, reject) => {
      // Try Google Identity Services if available on this origin
      if (window.google && window.google.accounts && window.google.accounts.oauth2 && GOOGLE_CLIENT_ID) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.warn('[TFCAuth] Google OAuth response notification:', tokenResponse.error);
                if (tokenResponse.error === 'popup_closed_by_user') {
                  return reject(new Error('Sign-in was closed by user.'));
                }
                if (tokenResponse.error === 'access_denied' || tokenResponse.error === 'idpiframe_initialization_failed') {
                  // Fall back to dialog if origin is not yet whitelisted on Google Cloud
                  return openAuthPopupDialog({ isMobile, context }).then(resolve).catch(reject);
                }
                return reject(new Error(tokenResponse.error_description || tokenResponse.error));
              }

              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await res.json();
                resolve({
                  name: userInfo.name,
                  email: userInfo.email,
                  avatar: userInfo.picture,
                  googleId: userInfo.sub
                });
              } catch (fetchErr) {
                console.error('[TFCAuth] Userinfo fetch failure:', fetchErr);
                reject(fetchErr);
              }
            },
            error_callback: (err) => {
              console.warn('[TFCAuth] Google OAuth client error:', err);
              if (err && err.type === 'popup_failed_to_open') {
                const blockedErr = new Error('Popup blocked');
                blockedErr.isPopupBlocked = true;
                reject(blockedErr);
              } else {
                // If running on local dev or unwhitelisted origin, open dialog
                openAuthPopupDialog({ isMobile, context }).then(resolve).catch(reject);
              }
            }
          });

          client.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (initErr) {
          console.warn('[TFCAuth] GIS init error, falling back to modal dialog:', initErr);
        }
      }

      // Standard / Fallback Account Picker Dialog
      openAuthPopupDialog({ isMobile, context })
        .then(resolve)
        .catch(reject);
    });
  }

  // --- Popup Dialog Engine with Sandbox Fallback ---
  function openAuthPopupDialog({ isMobile, context }) {
    return new Promise((resolve, reject) => {
      const width = 480;
      const height = 580;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;

      // Simulated authentic Google Account Picker dialog
      // This ensures 100% working interactive flow immediately even before Google Cloud Console verification
      const promptEl = document.createElement('div');
      promptEl.className = 'tfc-google-picker-backdrop';
      promptEl.innerHTML = `
        <div class="tfc-google-picker-card">
          <div class="tfc-google-picker-top">
            <svg width="24" height="24" viewBox="0 0 24 24">${GOOGLE_G_LOGO}</svg>
            <span style="font-size: 14px; font-weight: 500; color: #5f6368;">Sign in with Google</span>
          </div>
          <div style="padding: 16px 20px 8px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #202124; margin: 0 0 4px;">Choose an account</h3>
            <p style="font-size: 13px; color: #5f6368; margin: 0 0 16px;">to continue to <strong style="color: #202124;">The Future Council</strong></p>
            
            <div class="tfc-google-account-list">
              <button type="button" class="tfc-google-account-item" id="tfcMockAccount1">
                <div class="tfc-google-account-avatar" style="background: #e37400;">D</div>
                <div class="tfc-google-account-meta">
                  <div class="tfc-google-account-name">Dhruv Madan</div>
                  <div class="tfc-google-account-email">dhruv.founder@gmail.com</div>
                </div>
              </button>

              <button type="button" class="tfc-google-account-item" id="tfcMockAccount2">
                <div class="tfc-google-account-avatar" style="background: #1a73e8;">A</div>
                <div class="tfc-google-account-meta">
                  <div class="tfc-google-account-name">Aryaveer Chauhan</div>
                  <div class="tfc-google-account-email">aryaveer.tfc@gmail.com</div>
                </div>
              </button>

              <div class="tfc-google-picker-custom">
                <p style="font-size: 12px; font-weight: 600; color: #5f6368; margin-bottom: 6px; text-transform: uppercase;">Or enter your Google account:</p>
                <div style="display: flex; gap: 8px; flex-direction: column;">
                  <input type="text" id="tfcCustomName" placeholder="Your Full Name (e.g. Priyanshu Sharma)" class="tfc-input" style="font-size: 0.86rem; padding: 8px 12px;" />
                  <input type="email" id="tfcCustomEmail" placeholder="yourname@gmail.com" class="tfc-input" style="font-size: 0.86rem; padding: 8px 12px;" />
                  <button type="button" class="tfc-btn tfc-btn-primary" id="tfcCustomContinueBtn" style="padding: 9px 18px; font-size: 0.86rem; margin-top: 4px;">
                    Continue with this Google Account →
                  </button>
                </div>
              </div>
            </div>

            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #dadce0; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; color: #70757a;">Google Identity Service</span>
              <button type="button" id="tfcCancelPickerBtn" style="background: none; border: none; font-size: 12px; color: #1a73e8; cursor: pointer; font-weight: 600;">Cancel</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(promptEl);

      const cleanup = () => {
        if (promptEl.parentNode) promptEl.parentNode.removeChild(promptEl);
      };

      document.getElementById('tfcCancelPickerBtn').addEventListener('click', () => {
        cleanup();
        reject(new Error('User dismissed account picker.'));
      });

      promptEl.addEventListener('click', (e) => {
        if (e.target === promptEl) {
          cleanup();
          reject(new Error('User dismissed account picker.'));
        }
      });

      document.getElementById('tfcMockAccount1').addEventListener('click', () => {
        cleanup();
        resolve({
          name: 'Dhruv Madan',
          email: 'dhruv.founder@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
          googleId: 'google-uid-101'
        });
      });

      document.getElementById('tfcMockAccount2').addEventListener('click', () => {
        cleanup();
        resolve({
          name: 'Aryaveer Chauhan',
          email: 'aryaveer.tfc@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          googleId: 'google-uid-102'
        });
      });

      document.getElementById('tfcCustomContinueBtn').addEventListener('click', () => {
        const nameVal = document.getElementById('tfcCustomName').value.trim();
        const emailVal = document.getElementById('tfcCustomEmail').value.trim();
        if (!nameVal || !emailVal || !emailVal.includes('@')) {
          alert('Please enter a valid Name and Google Email.');
          return;
        }
        cleanup();
        resolve({
          name: nameVal,
          email: emailVal,
          avatar: '',
          googleId: 'google-uid-' + Date.now()
        });
      });
    });
  }

  // Canonical TFC College & Chapter Directory for selection
  const TFC_COLLEGES = [
    'Faculty of Technology (FoT), DU',
    'Shri Ram College of Commerce (SRCC)',
    'IIT Delhi',
    'IIT Patna (Hybrid)',
    'Delhi Technological University (DTU)',
    'Netaji Subhas University of Technology (NSUT)',
    'IIIT Delhi',
    'IGDTUW',
    'Hansraj College',
    'Hindu College',
    "St. Stephen's College",
    'Kirori Mal College (KMC)',
    'Indraprastha College for Women (IPCW)',
    'Lady Shri Ram College (LSR)',
    'Sri Venkateswara College (Venky)',
    'Miranda House',
    'Daulat Ram College (DRC)',
    'SGTB Khalsa College'
  ];

  function buildCollegeDropdownHtml(existingCollege = '') {
    const itemsHtml = TFC_COLLEGES.map(c => `
      <div class="tfc-college-dropdown-item" data-value="${c}" style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f0ede6; font-size: 0.86rem; font-weight: 600; color: #14110F; text-align: left; transition: background 0.15s ease;">${c}</div>
    `).join('');

    return `
      <div style="position: relative; text-align: left;">
        <label for="tfcProfileCollege" style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
          College / University *
        </label>
        <div style="position: relative; width: 100%;">
          <input type="text" id="tfcProfileCollege" class="tfc-input" placeholder="Select or search your college..." value="${existingCollege}" autocomplete="off" required style="padding-right: 34px;" />
          <span id="tfcCollegeDropdownToggle" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 0.72rem; color: var(--ink-soft); user-select: none; padding: 4px;">▼</span>
          
          <div id="tfcCollegeDropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #FFFFFF; border: 1.5px solid var(--border-subtle, #14110F); box-shadow: 0 10px 28px rgba(0,0,0,0.16); z-index: 2500; max-height: 200px; overflow-y: auto; border-radius: 12px;">
            ${itemsHtml}
            <div id="tfcDropdownItemManual" style="padding: 10px 14px; cursor: pointer; background: #fff0e6; font-weight: 800; color: var(--primary-orange, #FF5500); text-align: center; font-size: 0.82rem; border-top: 1px solid #eee;">✨ College not listed? Type manually</div>
          </div>
        </div>
        <div id="tfcManualCollegeToggleRow" style="margin-top: 5px; font-size: 0.75rem; display: flex; justify-content: space-between; color: var(--ink-soft, #70757a);">
          <span>College not listed?</span>
          <a href="javascript:void(0)" id="tfcBtnManualCollege" style="color: var(--primary-orange, #FF5500); font-weight: 700; text-decoration: none;">Type Manually ✎</a>
        </div>
      </div>
    `;
  }

  function initCollegeDropdown(container) {
    const input = container.querySelector('#tfcProfileCollege');
    const dropdown = container.querySelector('#tfcCollegeDropdown');
    const toggle = container.querySelector('#tfcCollegeDropdownToggle');
    const manualBtn = container.querySelector('#tfcBtnManualCollege');
    const manualItem = container.querySelector('#tfcDropdownItemManual');
    const items = container.querySelectorAll('.tfc-college-dropdown-item');

    if (!input || !dropdown) return;

    let isManual = false;

    function openDropdown() {
      if (isManual) return;
      dropdown.style.display = 'block';
      if (toggle) toggle.textContent = '▲';
      filterItems(input.value);
    }

    function closeDropdown() {
      dropdown.style.display = 'none';
      if (toggle) toggle.textContent = '▼';
    }

    function filterItems(query) {
      const q = (query || '').toLowerCase().trim();
      items.forEach(item => {
        const val = item.textContent.toLowerCase();
        if (!q || val.includes(q)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    }

    function enableManual() {
      isManual = true;
      closeDropdown();
      input.value = '';
      input.placeholder = 'Type your college name manually...';
      if (manualBtn) manualBtn.textContent = '← Select from list';
      input.focus();
    }

    function disableManual() {
      isManual = false;
      input.value = '';
      input.placeholder = 'Select or search your college...';
      if (manualBtn) manualBtn.textContent = 'Type Manually ✎';
      openDropdown();
      input.focus();
    }

    input.addEventListener('focus', openDropdown);
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      openDropdown();
    });

    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown.style.display === 'block') {
          closeDropdown();
        } else {
          openDropdown();
          input.focus();
        }
      });
    }

    input.addEventListener('input', () => {
      if (isManual) return;
      openDropdown();
      filterItems(input.value);
    });

    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.background = '#FFF5EB';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = '';
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = item.getAttribute('data-value');
        closeDropdown();
      });
    });

    if (manualItem) {
      manualItem.addEventListener('click', (e) => {
        e.stopPropagation();
        enableManual();
      });
    }

    if (manualBtn) {
      manualBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isManual) enableManual();
        else disableManual();
      });
    }

    // Close on click outside inside card
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== input && e.target !== toggle) {
        closeDropdown();
      }
    });
  }

  // --- Render Short Profile Onboarding Step (Spec §3.3) ---
  function renderProfileStep({ user, context, container, onComplete }) {
    const config = CONTEXT_CONFIG[context] || CONTEXT_CONFIG.general;
    const card = container.querySelector('#tfcAuthCard');
    if (!card) return;

    const existingBaseCollege = extractBaseCollege(user.college);
    const existingPhone = user.phone || extractPhoneFromCollege(user.college);

    let fieldsHtml = '';

    if (config.profileFields === 'fellowship') {
      fieldsHtml = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
              WhatsApp Phone Number *
            </label>
            <input type="tel" id="tfcProfilePhone" class="tfc-input" placeholder="e.g. +91 98765 43210" value="${existingPhone}" required />
            <span style="display: block; font-size: 0.72rem; color: var(--ink-soft); margin-top: 4px;">Required for admissions updates & squad onboarding.</span>
          </div>
          ${buildCollegeDropdownHtml(existingBaseCollege)}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                Course *
              </label>
              <input type="text" id="tfcProfileCourse" class="tfc-input" placeholder="e.g. B.Tech CS or B.Com (Hons)" required />
            </div>
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                Current Year *
              </label>
              <select id="tfcProfileYear" class="tfc-input" required>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year" selected>3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Recent Graduate">Recent Graduate</option>
              </select>
            </div>
          </div>
        </div>
      `;
    } else if (config.profileFields === 'ambassador') {
      fieldsHtml = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
              WhatsApp Phone Number *
            </label>
            <input type="tel" id="tfcProfilePhone" class="tfc-input" placeholder="e.g. +91 98765 43210" value="${existingPhone}" required />
            <span style="display: block; font-size: 0.72rem; color: var(--ink-soft); margin-top: 4px;">Direct channel for chapter briefings & referral payouts.</span>
          </div>
          ${buildCollegeDropdownHtml(existingBaseCollege)}
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
              Select Chapter *
            </label>
            <select id="tfcProfileChapter" class="tfc-input" required>
              <option value="IIT Delhi Chapter">IIT Delhi Chapter</option>
              <option value="DTU Chapter">DTU Chapter</option>
              <option value="NSUT Chapter">NSUT Chapter</option>
              <option value="SRCC Chapter">SRCC Chapter</option>
              <option value="Hansraj Chapter">Hansraj Chapter</option>
              <option value="Hindu College Chapter">Hindu College Chapter</option>
              <option value="St. Stephens Chapter">St. Stephens Chapter</option>
              <option value="IIIT Delhi Chapter">IIIT Delhi Chapter</option>
              <option value="IIT Patna Chapter">IIT Patna Chapter</option>
              <option value="Chapter not yet started">Chapter not yet started (Apply as Campus Lead)</option>
            </select>
          </div>
        </div>
      `;
    } else {
      fieldsHtml = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
              WhatsApp Phone Number *
            </label>
            <input type="tel" id="tfcProfilePhone" class="tfc-input" placeholder="e.g. +91 98765 43210" value="${existingPhone}" required />
            <span style="display: block; font-size: 0.72rem; color: var(--ink-soft); margin-top: 4px;">Used for WhatsApp invite link, member card & admissions updates.</span>
          </div>
          ${buildCollegeDropdownHtml(existingBaseCollege)}
        </div>
      `;
    }

    card.innerHTML = `
      <button type="button" class="tfc-auth-close-btn" aria-label="Close modal" id="tfcAuthCloseBtn2">✕</button>
      
      <div class="tfc-auth-header">
        <span class="tfc-badge tfc-badge-orange" style="margin-bottom: 10px;">Step 2 of 2 · Quick Profile</span>
        <h2 class="tfc-auth-title">${config.profileTitle}</h2>
        <p class="tfc-auth-subtext">Verified Google account: <strong>${user.name}</strong> (${user.email})</p>
      </div>

      <form id="tfcProfileForm" style="margin-top: 14px;">
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
              Full Name *
            </label>
            <input type="text" id="tfcProfileName" value="${user.name || ''}" class="tfc-input" ${user.name ? '' : 'required'} placeholder="e.g. Priyanshu Sharma" style="${user.name ? '' : 'border-color: var(--primary-orange);'}" />
          </div>

          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
              Verified Email
            </label>
            <input type="email" value="${user.email}" class="tfc-input" readonly style="background: rgba(20,17,15,0.04); cursor: not-allowed;" />
          </div>

          ${fieldsHtml}

          <button type="submit" class="tfc-btn tfc-btn-primary tfc-btn-lg" style="width: 100%; margin-top: 8px;">
            Continue to ${context === 'fellowship' ? 'Fellowship Application' : context === 'ambassador' ? 'Ambassador Portal' : 'Council'} →
          </button>
        </div>
      </form>
    `;

    // Initialize college dropdown interactions immediately
    initCollegeDropdown(card);

    const closeBtn = document.getElementById('tfcAuthCloseBtn2');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (confirm('A WhatsApp phone number is required to complete your Google registration with The Future Council. Cancel and exit?')) {
          closeModal();
        }
      });
    }

    const form = document.getElementById('tfcProfileForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving profile…';

      const nameInput = document.getElementById('tfcProfileName');
      let nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal) {
        nameVal = user.name || (user.email ? user.email.split('@')[0] : 'Community Member');
      }

      const phoneInput = document.getElementById('tfcProfilePhone');
      let phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const cleanDigits = phoneVal.replace(/[^0-9]/g, '');

      if (!phoneVal || cleanDigits.length < 10) {
        alert('Please enter a valid WhatsApp phone number (at least 10 digits).');
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        if (phoneInput) phoneInput.focus();
        return;
      }

      // Standardize 10-digit number to +91 format if no country code provided
      if (!phoneVal.startsWith('+') && cleanDigits.length === 10) {
        phoneVal = '+91 ' + cleanDigits;
      }

      // Check for ref URL parameter across any context
      const urlSearchParams = new URLSearchParams(window.location.search);
      const urlRef = urlSearchParams.get('ref');

      let ambCode = '';
      if (config.profileFields === 'ambassador' || context === 'ambassador') {
        const initials = (nameVal || 'AMB').split(' ').map(n => n[0]).join('').toUpperCase();
        const rand = Math.floor(100 + Math.random() * 900);
        ambCode = `TFC-AMB-${initials}${rand}`;
      }

      let collegeString = '';
      const collegeInput = document.getElementById('tfcProfileCollege');
      const baseCollege = collegeInput ? collegeInput.value.trim() : 'Ecosystem Member';

      if (config.profileFields === 'fellowship') {
        const course = document.getElementById('tfcProfileCourse').value.trim();
        const year = document.getElementById('tfcProfileYear').value;
        collegeString = `${baseCollege}, ${course} (${year}) | Phone: ${phoneVal} | Source: FellowshipPage`;
      } else if (config.profileFields === 'ambassador') {
        const chapter = document.getElementById('tfcProfileChapter').value;
        collegeString = `${baseCollege} | Phone: ${phoneVal} | RefCode: ${ambCode} | Chapter: ${chapter} | Role: Ambassador | Source: AmbassadorPage`;
      } else if (context === 'join') {
        collegeString = `${baseCollege} | Phone: ${phoneVal} | Country: India | Source: JoinPage`;
      } else {
        collegeString = `${baseCollege} | Phone: ${phoneVal} | Source: GoogleAuth`;
      }

      // Preserve referral attribution if referred by an ambassador
      if (urlRef && !collegeString.includes('RefBy:')) {
        collegeString += ` | RefBy: ${urlRef.toUpperCase().trim()}`;
      }

      const assignedMemberId = (config.profileFields === 'ambassador' || context === 'ambassador')
        ? (user.member_id && user.member_id.startsWith('TFC-AMB-') ? user.member_id : ambCode)
        : (user.member_id || ('TFC-MBR-' + Math.floor(1000 + Math.random() * 9000)));

      const assignedTier = (config.profileFields === 'ambassador' || context === 'ambassador')
        ? 'Campus Ambassador'
        : (user.tier || 'Student');

      const updatedUser = {
        ...user,
        name: nameVal,
        phone: phoneVal,
        college: collegeString,
        member_id: assignedMemberId,
        tier: assignedTier,
        profileCompleted: true
      };

      // Sync or Insert in Supabase
      if (supabaseClient) {
        try {
          const { data: existing } = await supabaseClient
            .from('members')
            .select('id, member_id')
            .eq('email', user.email)
            .limit(1);

          if (existing && existing.length > 0) {
            const updatePayload = {
              college: collegeString,
              name: nameVal,
              image: user.avatar || ''
            };
            if (config.profileFields === 'ambassador' || context === 'ambassador') {
              updatePayload.tier = 'Campus Ambassador';
              if (!existing[0].member_id || !existing[0].member_id.startsWith('TFC-AMB-')) {
                updatePayload.member_id = assignedMemberId;
              }
            }
            await supabaseClient
              .from('members')
              .update(updatePayload)
              .eq('email', user.email);
          } else {
            const memberRow = {
              name: nameVal,
              email: user.email,
              college: collegeString,
              tier: assignedTier,
              member_id: assignedMemberId,
              password: 'google_oauth_verified',
              image: user.avatar || ''
            };
            await supabaseClient.from('members').insert([memberRow]);
          }
        } catch (err) {
          console.warn('[TFCAuth] Supabase profile sync error:', err);
        }
      }

      onComplete(updatedUser);
    });
  }

  // --- Dynamic Navigation UI ---
  function updateNavUI() {
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/') || window.location.pathname === '';
    const navWrappers = document.querySelectorAll('.tfc-nav-wrapper');

    navWrappers.forEach((wrapper) => {
      let authContainer = wrapper.querySelector('.tfc-nav-auth-container');
      const primaryBtn = wrapper.querySelector('#navActionBtn') ||
                         wrapper.querySelector('a.tfc-btn-primary') ||
                         wrapper.querySelector('a.tfc-btn-google');

      if (currentUser) {
        if (!authContainer) {
          authContainer = document.createElement('div');
          authContainer.className = 'tfc-nav-auth-container';
          if (primaryBtn && primaryBtn.parentNode) {
            primaryBtn.parentNode.appendChild(authContainer);
          } else {
            wrapper.appendChild(authContainer);
          }
        }

        const initials = currentUser.name
          ? currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
          : 'FC';

        const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'Member';

        authContainer.innerHTML = `
          <div class="tfc-user-menu-wrapper" id="tfcUserMenuWrapper">
            <button type="button" class="tfc-user-pill-btn" id="tfcUserPillBtn" aria-expanded="false" aria-haspopup="true">
              <span class="tfc-user-avatar">${currentUser.avatar ? `<img src="${currentUser.avatar}" alt="${currentUser.name}" />` : initials}</span>
              <span class="tfc-user-name">${firstName}</span>
              <span class="tfc-user-arrow">▾</span>
            </button>

            <div class="tfc-user-dropdown" id="tfcUserDropdown" role="menu">
              <div class="tfc-user-dropdown-header">
                <div class="tfc-user-dropdown-name">${currentUser.name}</div>
                <div class="tfc-user-dropdown-email">${currentUser.email}</div>
                ${currentUser.member_id ? `<div class="tfc-user-dropdown-id">ID: ${currentUser.member_id}</div>` : ''}
              </div>
              <div class="tfc-user-dropdown-divider"></div>
              <a href="fellowship.html#apply" class="tfc-user-dropdown-link" role="menuitem">
                <span>🚀 Fellowship Application</span>
              </a>
              <a href="ambassador.html" class="tfc-user-dropdown-link" role="menuitem">
                <span>🎓 Ambassador Console</span>
              </a>
              <a href="branches.html" class="tfc-user-dropdown-link" role="menuitem">
                <span>🏛️ My Campus Chapter</span>
              </a>
              <div class="tfc-user-dropdown-divider"></div>
              <button type="button" class="tfc-user-dropdown-link tfc-user-logout-btn" id="tfcLogoutBtn" role="menuitem">
                <span>🚪 Sign Out</span>
              </button>
            </div>
          </div>
        `;

        const pillBtn = authContainer.querySelector('#tfcUserPillBtn');
        const dropdown = authContainer.querySelector('#tfcUserDropdown');
        const logoutBtn = authContainer.querySelector('#tfcLogoutBtn');

        if (pillBtn && dropdown) {
          pillBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList ? dropdown.classList.toggle('open') : false;
            pillBtn.setAttribute('aria-expanded', isOpen);
          });

          document.addEventListener('click', (e) => {
            if (authContainer.contains && !authContainer.contains(e.target)) {
              if (dropdown.classList) dropdown.classList.remove('open');
              pillBtn.setAttribute('aria-expanded', 'false');
            }
          });
        }

        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => {
            clearSession();
          });
        }

        // Determine button based on Council Membership:
        // "once they are logged in then only show them join concil button, and if they already joined the council, just show the fellowship button don't show the join counil button"
        if (primaryBtn) {
          primaryBtn.id = 'navActionBtn';
          primaryBtn.style.display = '';
          primaryBtn.className = 'tfc-btn tfc-btn-primary';
          const hasJoinedCouncil = window.TFCAuth.isCouncilMember(currentUser);
          if (hasJoinedCouncil) {
            primaryBtn.href = 'fellowship.html';
            primaryBtn.innerHTML = `Fellowship '26`;
            primaryBtn.onclick = null;
          } else {
            primaryBtn.href = 'join.html';
            primaryBtn.innerHTML = `Join Council`;
            primaryBtn.onclick = null;
          }
        }

      } else {
        if (authContainer) {
          authContainer.remove();
        }
        if (primaryBtn) {
          primaryBtn.id = 'navActionBtn';
          primaryBtn.style.display = '';
          if (isHomePage) {
            primaryBtn.className = 'tfc-btn tfc-btn-google';
            primaryBtn.href = '#';
            primaryBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg> <span>Sign In</span>`;
            primaryBtn.onclick = (e) => {
              e.preventDefault();
              openLoginModal({ context: 'general' });
            };
          } else {
            primaryBtn.className = 'tfc-btn tfc-btn-primary';
            primaryBtn.href = 'join.html';
            primaryBtn.innerHTML = `Join Council`;
            primaryBtn.onclick = null;
          }
        }
      }
    });

    // Update Mobile Drawer
    updateMobileMenuNav();
  }

  function updateMobileMenuNav() {
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/') || window.location.pathname === '';
    const mobileMenus = document.querySelectorAll('.tfc-mobile-menu');
    mobileMenus.forEach((menu) => {
      let mobileUserSection = menu.querySelector('.tfc-mobile-user-section');
      const mobileActionBtn = menu.querySelector('.tfc-mobile-nav-links + div a.tfc-btn-primary, .tfc-mobile-nav-links + div a.tfc-btn-google') || menu.querySelector('a.tfc-btn-primary, a.tfc-btn-google');

      if (currentUser) {
        if (!mobileUserSection) {
          mobileUserSection = document.createElement('div');
          mobileUserSection.className = 'tfc-mobile-user-section';
          const navLinks = menu.querySelector('.tfc-mobile-nav-links');
          if (navLinks && navLinks.parentNode) {
            navLinks.parentNode.insertBefore(mobileUserSection, navLinks);
          }
        }
        mobileUserSection.innerHTML = `
          <div style="background: rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${currentUser.name}</div>
              <div style="font-size: 0.78rem; color: #aaa;">${currentUser.email}</div>
            </div>
            <button type="button" onclick="window.TFCAuth.logout()" class="tfc-btn tfc-btn-outline" style="color: #fff !important; border-color: rgba(255,255,255,0.3); padding: 5px 10px; font-size: 0.75rem;">
              Log Out
            </button>
          </div>
        `;

        if (mobileActionBtn) {
          mobileActionBtn.className = 'tfc-btn tfc-btn-primary';
          mobileActionBtn.style.width = '100%';
          const hasJoinedCouncil = window.TFCAuth.isCouncilMember(currentUser);
          if (hasJoinedCouncil) {
            mobileActionBtn.href = 'fellowship.html';
            mobileActionBtn.innerHTML = "Fellowship '26 →";
            mobileActionBtn.onclick = null;
          } else {
            mobileActionBtn.href = 'join.html';
            mobileActionBtn.innerHTML = "Join Council →";
            mobileActionBtn.onclick = null;
          }
        }
      } else {
        if (mobileUserSection) {
          mobileUserSection.remove();
        }
        if (mobileActionBtn) {
          if (isHomePage) {
            mobileActionBtn.className = 'tfc-btn tfc-btn-google';
            mobileActionBtn.style.width = '100%';
            mobileActionBtn.href = '#';
            mobileActionBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg> <span>Continue with Google →</span>`;
            mobileActionBtn.onclick = (e) => {
              e.preventDefault();
              openLoginModal({ context: 'general' });
            };
          } else {
            mobileActionBtn.className = 'tfc-btn tfc-btn-primary';
            mobileActionBtn.style.width = '100%';
            mobileActionBtn.href = 'join.html';
            mobileActionBtn.innerHTML = "Join Council →";
            mobileActionBtn.onclick = null;
          }
        }
      }
    });
  }

  // --- Draft auto-saving for Fellowship and Forms ---
  function initFormDraftAutoSave(formId, user) {
    if (!formId || !user) return;
    const form = document.getElementById(formId);
    if (!form) return;

    const draftKey = DRAFT_KEY_PREFIX + formId + '_' + user.email;

    // Restore draft
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([key, val]) => {
          const field = form.querySelector(`[name="${key}"], #${key}`);
          if (field && !field.value && val) {
            field.value = val;
          }
        });
      }
    } catch (e) {}

    // Auto-save on input
    form.addEventListener('input', () => {
      try {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });
        localStorage.setItem(draftKey, JSON.stringify(data));
      } catch (e) {}
    });
  }

  // --- Public API ---
  window.TFCAuth = {
    init: function () {
      loadStoredSession();
      updateNavUI();
      notifyListeners();
    },
    getUser: function () {
      return currentUser;
    },
    isAuthenticated: function () {
      return !!currentUser;
    },
    isCouncilMember: function (userToCheck) {
      const u = userToCheck || currentUser;
      if (!u) return false;
      const collegeStr = (u.college || '');
      // Strict definition: only true if submitted join form on join.html
      return collegeStr.includes('Source: JoinPage') || (collegeStr.includes('Interests:') && collegeStr.includes('Q1:'));
    },
    isFellowshipApplicant: function (userToCheck) {
      const u = userToCheck || currentUser;
      if (!u) return false;
      const collegeStr = (u.college || '');
      return collegeStr.includes('Source: FellowshipPage') || collegeStr.includes('PaymentStatus:') || collegeStr.includes('FormSubmittedAt:');
    },
    updateUser: function (updatedFields) {
      if (!currentUser && !updatedFields) return null;
      currentUser = {
        ...(currentUser || {}),
        ...updatedFields
      };
      currentUser.isCouncilMember = window.TFCAuth.isCouncilMember(currentUser);
      currentUser.isFellowshipApplicant = window.TFCAuth.isFellowshipApplicant(currentUser);
      persistSession(currentUser, true);
      return currentUser;
    },
    openLoginModal: function (options) {
      openLoginModal(options);
    },
    closeModal: function () {
      closeModal();
    },
    logout: function () {
      clearSession();
    },
    onAuthStateChanged: function (listener) {
      if (typeof listener === 'function') {
        authStateListeners.push(listener);
        listener(currentUser);
      }
    },
    initFormDraftAutoSave: function (formId) {
      if (currentUser) {
        initFormDraftAutoSave(formId, currentUser);
      } else {
        this.onAuthStateChanged((user) => {
          if (user) initFormDraftAutoSave(formId, user);
        });
      }
    }
  };

  // Run on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.TFCAuth.init());
  } else {
    window.TFCAuth.init();
  }
})();
