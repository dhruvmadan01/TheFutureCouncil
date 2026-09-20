/**
 * The Future Council — Mixpanel Analytics Engine
 * Project Token: f05da0bb13a820969c659b2508adb302
 * 
 * Instruments 10 Core Fellowship Analytics Events:
 * 1. landing_page_viewed
 * 2. application_started
 * 3. eligibility_check_completed
 * 4. application_completed
 * 5. selection_outcome_recorded
 * 6. fellowship_enrollment_started
 * 7. fellowship_enrolled
 * 8. application_abandoned
 * 9. eligibility_filter_shown
 * 10. application_review_decision_viewed
 */

(function (window, document) {
  'use strict';

  // 1. OFFICIAL ASYNC MIXPANEL STUB LOADER
  (function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"mixpanel.min.js";var s=e.getElementsByTagName("script")[0];if(s&&s.parentNode){s.parentNode.insertBefore(k,s)}else{e.head.appendChild(k)}}})(document,window.mixpanel||[]);

  // 2. MIXPANEL INITIALIZATION ON APP BOOT
  const MIXPANEL_TOKEN = 'f05da0bb13a820969c659b2508adb302';
  const DEFAULT_REVIEW_BATCH = '2026Q3 Batch';
  const APPLICATION_VERSION = '2026.1';
  const ELIGIBILITY_VERSION = '2026.1';

  try {
    window.mixpanel.init(MIXPANEL_TOKEN, {
      debug: false,
      track_pageview: false, // We explicitly fire landing_page_viewed with enriched attributes
      persistence: 'localStorage',
      ignore_dnt: true
    });
  } catch (err) {
    console.warn('[TFC Analytics] Mixpanel init warning:', err);
  }

  // 3. CHANNEL & ATTRIBUTION ENGINE
  function detectAcquisitionChannel() {
    try {
      // Check for previously cached session channel
      const cached = sessionStorage.getItem('tfc_acquisition_channel');
      if (cached) return cached;

      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = (urlParams.get('utm_source') || '').toLowerCase();
      const utmMedium = (urlParams.get('utm_medium') || '').toLowerCase();
      const utmCampaign = (urlParams.get('utm_campaign') || '').toLowerCase();
      const ref = (urlParams.get('ref') || urlParams.get('referrer') || '').toLowerCase();
      const chapter = (urlParams.get('chapter') || '').toLowerCase();
      const referrer = document.referrer ? document.referrer.toLowerCase() : '';

      let channel = 'other';

      // Campus ambassador detection
      if (
        ref.startsWith('amb') ||
        utmSource.includes('ambassador') ||
        utmMedium.includes('ambassador') ||
        utmCampaign.includes('ambassador') ||
        urlParams.has('ambassador')
      ) {
        channel = 'campus_ambassador';
      }
      // Social networks
      else if (
        utmSource.includes('instagram') ||
        utmSource.includes('linkedin') ||
        utmSource.includes('twitter') ||
        utmSource.includes('x.com') ||
        utmSource.includes('facebook') ||
        utmSource.includes('youtube') ||
        utmSource.includes('whatsapp') ||
        referrer.includes('instagram.com') ||
        referrer.includes('linkedin.com') ||
        referrer.includes('t.co') ||
        referrer.includes('twitter.com') ||
        referrer.includes('facebook.com') ||
        referrer.includes('youtube.com') ||
        referrer.includes('whatsapp')
      ) {
        channel = 'social';
      }
      // Word of mouth / peer referrals
      else if (
        ref.includes('friend') ||
        ref.includes('peer') ||
        ref.includes('word') ||
        utmSource.includes('referral') ||
        utmMedium.includes('referral') ||
        utmSource.includes('word_of_mouth')
      ) {
        channel = 'word_of_mouth';
      }
      // Search engines
      else if (
        referrer.includes('google.') ||
        referrer.includes('bing.') ||
        referrer.includes('duckduckgo.') ||
        referrer.includes('yahoo.')
      ) {
        channel = 'search';
      }
      // Direct
      else if (!referrer && !utmSource && !ref && !chapter) {
        channel = 'direct';
      }

      sessionStorage.setItem('tfc_acquisition_channel', channel);
      return channel;
    } catch (e) {
      return 'other';
    }
  }

  // 4. UNIVERSITY RESOLUTION HELPER
  function detectUniversity(override) {
    if (override && typeof override === 'string' && override.trim()) {
      return override.trim();
    }

    try {
      // Check active input on page if available
      const chapterSelect = document.getElementById('fChapter');
      if (chapterSelect && chapterSelect.value) {
        return chapterSelect.value;
      }

      // Check stored chapter referral
      const storedRef = localStorage.getItem('tfc_chapter_ref');
      if (storedRef) return storedRef;

      // Check URL path for branch page
      const pathname = window.location.pathname;
      const branchMatch = pathname.match(/branch-([a-z0-9]+)\.html/i);
      if (branchMatch) {
        const branchMap = {
          'fot': 'Faculty of Technology (FoT), DU',
          'srcc': 'Shri Ram College of Commerce (SRCC)',
          'hansraj': 'Hansraj College, DU',
          'hindu': 'Hindu College, DU',
          'stephens': "St. Stephen's College, DU",
          'kmc': 'Kirori Mal College (KMC), DU',
          'ipcw': 'Indraprastha College for Women (IPCW)',
          'lsr': 'Lady Shri Ram College (LSR)',
          'venky': 'Sri Venkateswara College (Venky)',
          'miranda': 'Miranda House, DU',
          'drc': 'Daulat Ram College (DRC)',
          'khalsa': 'SGTB Khalsa College, DU',
          'dtu': 'Delhi Technological University (DTU)',
          'nsut': 'Netaji Subhas University of Technology (NSUT)',
          'igdtuw': 'IGDTUW Delhi',
          'iiitd': 'IIIT Delhi',
          'iitd': 'IIT Delhi',
          'iitp': 'IIT Patna'
        };
        const branchKey = branchMatch[1].toLowerCase();
        if (branchMap[branchKey]) return branchMap[branchKey];
      }

      // Check logged in user profile via TFCAuth
      if (window.TFCAuth && typeof window.TFCAuth.getUser === 'function') {
        const user = window.TFCAuth.getUser();
        if (user && user.college) {
          const col = user.college.split(' | ')[0].trim();
          if (col && col !== 'Ecosystem Member') return col;
        }
      }

      // Fallback
      return 'unidentified';
    } catch (e) {
      return 'unidentified';
    }
  }

  // 5. APPLICATION SESSION LIFECYCLE STATE
  const appSession = {
    started: false,
    startTime: null,
    submitted: false,
    currentStep: 'start'
  };

  // Check if session previously started
  try {
    const savedStart = sessionStorage.getItem('tfc_app_start_time');
    if (savedStart) {
      appSession.started = true;
      appSession.startTime = parseInt(savedStart, 10);
    }
  } catch (e) {}

  // 6. SAFE MIXPANEL TRACK WRAPPER
  function safeTrack(eventName, properties) {
    try {
      if (window.mixpanel && typeof window.mixpanel.track === 'function') {
        window.mixpanel.track(eventName, properties);
      }
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`[Mixpanel Event: ${eventName}]`, properties);
      }
    } catch (err) {
      console.warn(`[TFC Analytics] Failed to track ${eventName}:`, err);
    }
  }

  // =========================================================================
  // CORE 10 EVENTS IMPLEMENTATION
  // =========================================================================

  const TFCAnalytics = {
    // Current constants
    REVIEW_BATCH: DEFAULT_REVIEW_BATCH,
    APPLICATION_VERSION: APPLICATION_VERSION,
    ELIGIBILITY_VERSION: ELIGIBILITY_VERSION,

    getAcquisitionChannel: detectAcquisitionChannel,
    getUniversity: detectUniversity,

    /**
     * Event 1: landing_page_viewed
     * A prospective applicant lands on the TFC landing page.
     */
    trackLandingPageViewed: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const variant = options.landing_variant || (function () {
        const path = window.location.pathname;
        if (path.endsWith('fellowship.html') || path.includes('fellowship')) return 'fellowship_cohort_26';
        if (path.endsWith('branches.html')) return 'branches_directory';
        if (path.includes('branch-')) return 'branch_spotlight';
        if (path.endsWith('join.html')) return 'join_council';
        if (path.endsWith('ambassador.html')) return 'ambassador_program';
        return 'main_landing_v1';
      })();

      safeTrack('landing_page_viewed', {
        acquisition_channel: channel,
        university: university,
        landing_variant: variant
      });
    },

    /**
     * Event 2: application_started
     * User starts the fellowship application form.
     */
    trackApplicationStarted: function (options = {}) {
      if (appSession.started && !options.force) {
        return; // Guard against multiple fires in same application session
      }

      appSession.started = true;
      appSession.startTime = Date.now();
      appSession.currentStep = 'start';
      try {
        sessionStorage.setItem('tfc_app_start_time', appSession.startTime.toString());
      } catch (e) {}

      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const version = options.application_version || APPLICATION_VERSION;
      const startTime = options.application_start_time || new Date(appSession.startTime).toISOString();

      safeTrack('application_started', {
        acquisition_channel: channel,
        university: university,
        application_version: version,
        application_start_time: startTime
      });
    },

    /**
     * Event 9: eligibility_filter_shown
     * Eligibility questions/check are shown to the user.
     */
    trackEligibilityFilterShown: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const version = options.eligibility_version || ELIGIBILITY_VERSION;
      const entryPoint = options.eligibility_check_entry_point || (appSession.started ? 'from_application_start' : 'direct_link');

      appSession.currentStep = 'eligibility';

      safeTrack('eligibility_filter_shown', {
        acquisition_channel: channel,
        university: university,
        eligibility_version: version,
        eligibility_check_entry_point: entryPoint
      });
    },

    /**
     * Event 3: eligibility_check_completed
     * User completes the eligibility questions/check during the application flow.
     */
    trackEligibilityCheckCompleted: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const result = options.eligibility_result || 'eligible'; // eligible | ineligible | needs_review
      const reason = options.eligibility_ineligibility_reason || (result === 'ineligible' ? 'commitment_unmet' : '');

      appSession.currentStep = 'questions';

      safeTrack('eligibility_check_completed', {
        acquisition_channel: channel,
        university: university,
        eligibility_result: result,
        eligibility_ineligibility_reason: reason
      });
    },

    /**
     * Event 4: application_completed
     * User submits the application form successfully (submission complete).
     */
    trackApplicationCompleted: function (options = {}) {
      appSession.submitted = true;
      appSession.currentStep = 'submitted';

      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const status = options.submission_status || 'submitted';

      let completionTimeSeconds = 0;
      if (appSession.startTime) {
        completionTimeSeconds = Math.max(1, Math.round((Date.now() - appSession.startTime) / 1000));
      } else if (options.completion_time !== undefined) {
        completionTimeSeconds = options.completion_time;
      } else {
        completionTimeSeconds = 90; // Sensible default if started in previous tab
      }

      safeTrack('application_completed', {
        acquisition_channel: channel,
        university: university,
        submission_status: status,
        completion_time: completionTimeSeconds
      });

      // Clear abandonment tracker
      try {
        sessionStorage.removeItem('tfc_app_start_time');
      } catch (e) {}

      // If applicant details provided, identify in Mixpanel
      if (options.email && window.mixpanel && typeof window.mixpanel.identify === 'function') {
        try {
          window.mixpanel.identify(options.email);
          if (window.mixpanel.people && typeof window.mixpanel.people.set === 'function') {
            window.mixpanel.people.set({
              $name: options.name || '',
              $email: options.email,
              university: university,
              acquisition_channel: channel,
              application_status: 'submitted',
              cohort_batch: DEFAULT_REVIEW_BATCH
            });
          }
        } catch (e) {}
      }
    },

    /**
     * Event 5: selection_outcome_recorded
     * System records the selection outcome for the applicant after review.
     */
    trackSelectionOutcomeRecorded: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const outcome = options.selection_outcome || 'selected'; // selected | not_selected | waitlisted
      const batch = options.review_batch || DEFAULT_REVIEW_BATCH;

      safeTrack('selection_outcome_recorded', {
        acquisition_channel: channel,
        university: university,
        selection_outcome: outcome,
        review_batch: batch
      });
    },

    /**
     * Event 6: fellowship_enrollment_started
     * Selected applicant begins enrollment/payment steps for the fellowship (₹999).
     */
    trackFellowshipEnrollmentStarted: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const step = options.enrollment_step || 'payment_details'; // payment_details | confirm_details
      const batch = options.review_batch || DEFAULT_REVIEW_BATCH;

      safeTrack('fellowship_enrollment_started', {
        acquisition_channel: channel,
        university: university,
        enrollment_step: step,
        review_batch: batch
      });
    },

    /**
     * Event 7: fellowship_enrolled
     * Selected applicant successfully enrolls in the fellowship (payment confirmed).
     */
    trackFellowshipEnrolled: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const fee = typeof options.fellowship_fee_amount === 'number' ? options.fellowship_fee_amount : 999;
      const status = options.payment_status || 'paid'; // paid | failed | refunded
      const batch = options.review_batch || DEFAULT_REVIEW_BATCH;

      safeTrack('fellowship_enrolled', {
        acquisition_channel: channel,
        university: university,
        fellowship_fee_amount: fee,
        payment_status: status,
        review_batch: batch
      });

      // Update Mixpanel profile if available
      if (options.email && window.mixpanel && window.mixpanel.people) {
        try {
          window.mixpanel.people.set({
            fellowship_enrolled: true,
            fellowship_fee_amount: fee,
            enrollment_batch: batch
          });
        } catch (e) {}
      }
    },

    /**
     * Event 8: application_abandoned
     * User leaves the application flow before completion.
     */
    trackApplicationAbandoned: function (options = {}) {
      if (!appSession.started || appSession.submitted) {
        return; // Did not start, or already completed
      }

      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const step = options.abandon_step || appSession.currentStep || 'start'; // start | eligibility | questions | review | submit
      const durationSeconds = appSession.startTime ? Math.max(1, Math.round((Date.now() - appSession.startTime) / 1000)) : 0;

      safeTrack('application_abandoned', {
        acquisition_channel: channel,
        university: university,
        abandon_step: step,
        abandon_duration_seconds: durationSeconds
      });

      // Reset start time so it doesn't fire repeatedly
      appSession.started = false;
    },

    /**
     * Event 10: application_review_decision_viewed
     * Selected/declined decision is viewed by the applicant (post-review outcome page).
     */
    trackApplicationReviewDecisionViewed: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const outcome = options.selection_outcome || 'selected'; // selected | not_selected | waitlisted
      const variant = options.decision_page_variant || 'standard_dashboard_v1';

      safeTrack('application_review_decision_viewed', {
        acquisition_channel: channel,
        university: university,
        selection_outcome: outcome,
        decision_page_variant: variant
      });
    },

    /**
     * Event 11: fellowship_scroll_depth_reached
     * Fired when a user scrolls through fellowship pages to key thresholds (25%, 50%, 75%, 90%, 100%).
     */
    trackFellowshipScrollDepthReached: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const depth = options.depth_percentage || 0;

      safeTrack('fellowship_scroll_depth_reached', {
        acquisition_channel: channel,
        university: university,
        depth_percentage: depth,
        page_path: window.location.pathname
      });
    },

    /**
     * Event 12: chapter_join_scroll_depth_reached
     * Fired when a user scrolls through chapter/branch directory, branch detail, or join pages.
     */
    trackChapterJoinScrollDepthReached: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);
      const depth = options.depth_percentage || 0;

      safeTrack('chapter_join_scroll_depth_reached', {
        acquisition_channel: channel,
        university: university,
        depth_percentage: depth,
        page_path: window.location.pathname
      });
    },

    /**
     * Event 13: exit_intent_detected
     * Triggered when a visitor moves their cursor out of the top of the browser window (tab close / switch attempt).
     */
    trackExitIntentDetected: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);

      safeTrack('exit_intent_detected', {
        acquisition_channel: channel,
        university: university,
        page_path: window.location.pathname,
        time_on_page_seconds: Math.max(1, Math.round((Date.now() - pageLoadTime) / 1000))
      });
    },

    /**
     * Event 14: form_field_drop_off
     * Fires when a user interacts with a form field and leaves without submitting.
     */
    trackFormFieldDropOff: function (options = {}) {
      const channel = options.acquisition_channel || detectAcquisitionChannel();
      const university = detectUniversity(options.university);

      safeTrack('form_field_drop_off', {
        acquisition_channel: channel,
        university: university,
        last_field_id: options.last_field_id || 'unknown',
        last_field_name: options.last_field_name || '',
        form_id: options.form_id || '',
        time_on_field_seconds: options.time_on_field_seconds || 0,
        page_path: window.location.pathname
      });
    },

    // Step state helper
    setCurrentStep: function (step) {
      appSession.currentStep = step;
    }
  };

  const pageLoadTime = Date.now();
  let lastFocusedField = null;
  let fieldFocusTimestamp = null;
  let formSubmittedLocally = false;

  // 7. FORM FIELD INTERACTION & DROP-OFF LISTENER (blur + beforeunload)
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
      lastFocusedField = {
        id: target.id || '',
        name: target.name || target.getAttribute('placeholder') || target.id || 'unnamed_field',
        formId: target.form ? target.form.id : (target.closest('form') ? target.closest('form').id : 'application_form')
      };
      fieldFocusTimestamp = Date.now();
    }
  }, true);

  document.addEventListener('submit', () => {
    formSubmittedLocally = true;
  }, true);

  // 8. AUTOMATIC ABANDONMENT & FIELD DROP-OFF LISTENER (beforeunload)
  window.addEventListener('beforeunload', () => {
    if (appSession.started && !appSession.submitted) {
      TFCAnalytics.trackApplicationAbandoned();
    }
    if (lastFocusedField && !formSubmittedLocally && !appSession.submitted) {
      const timeOnField = fieldFocusTimestamp ? Math.max(1, Math.round((Date.now() - fieldFocusTimestamp) / 1000)) : 0;
      TFCAnalytics.trackFormFieldDropOff({
        last_field_id: lastFocusedField.id,
        last_field_name: lastFocusedField.name,
        form_id: lastFocusedField.formId,
        time_on_field_seconds: timeOnField
      });
    }
  });

  // 9. EXIT INTENT DETECTION (mouseleave on document when leaving through top)
  let exitIntentFired = false;
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0 && !exitIntentFired) {
      exitIntentFired = true;
      TFCAnalytics.trackExitIntentDetected();
    }
  });

  // 10. SCROLL DEPTH TRACKING (fellowship & chapter join pages)
  (function initScrollTracking() {
    const path = window.location.pathname.toLowerCase();
    const isFellowship = path.includes('fellowship');
    const isChapterJoin = path.includes('branch') || path.includes('join') || path.includes('ambassador');

    if (isFellowship || isChapterJoin) {
      const trackedThresholds = new Set();
      const thresholds = [25, 50, 75, 90, 100];

      const checkScrollDepth = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const scrollPercent = Math.round((window.scrollY / docHeight) * 100);

        thresholds.forEach((th) => {
          if (scrollPercent >= th && !trackedThresholds.has(th)) {
            trackedThresholds.add(th);
            if (isFellowship) {
              TFCAnalytics.trackFellowshipScrollDepthReached({ depth_percentage: th });
            }
            if (isChapterJoin) {
              TFCAnalytics.trackChapterJoinScrollDepthReached({ depth_percentage: th });
            }
          }
        });
      };

      let scrollTimeout;
      window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
          scrollTimeout = setTimeout(() => {
            scrollTimeout = null;
            checkScrollDepth();
          }, 250);
        }
      }, { passive: true });
    }
  })();

  // 11. SYNCHRONIZE WITH GOOGLE AUTH (TFCAuth) IF PRESENT
  if (window.TFCAuth && typeof window.TFCAuth.onAuthStateChanged === 'function') {
    window.TFCAuth.onAuthStateChanged((user) => {
      if (user && user.email && window.mixpanel) {
        try {
          window.mixpanel.identify(user.email);
          if (window.mixpanel.people) {
            window.mixpanel.people.set({
              $name: user.name || '',
              $email: user.email,
              $avatar: user.avatar || '',
              university: detectUniversity(user.college),
              tier: user.tier || 'Student'
            });
          }
        } catch (e) {}
      }
    });
  }

  // Expose globally
  window.TFCAnalytics = TFCAnalytics;

  // 12. AUTOMATIC LANDING PAGE VIEW TRACKING ON BOOT
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      TFCAnalytics.trackLandingPageViewed();
    });
  } else {
    TFCAnalytics.trackLandingPageViewed();
  }

})(window, document);
