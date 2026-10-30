/**
 * The Future Council · Global Configuration & Single Source of Truth
 * Shared across all client-side pages and components.
 */
(function(root) {
  var TFC_CONFIG = {
    // Primary routing & CTAs
    APPLY_URL: '/join',
    GOOGLE_FORM_URL: '/join',

    // Ecosystem statistics
    CHAPTER_COUNT: 18,
    CHAPTER_COUNT_LABEL: '90+ colleges',

    // Launchpad: Discontinued
    LAUNCHPAD: null,

    // Startup School: Discontinued
    STARTUP_SCHOOL: null,

    // Legal Entity & Brand Footer (company name/CIN/address hidden until business commences; restore then)
    ENTITY: {
      NAME: 'The Future Council',
      CIN: '',
      ADDRESS: '',
      FULL_LEGAL_ENTITY: 'The Future Council',
      FOOTER_COPYRIGHT: '© 2026 The Future Council',
      SUPPORT_EMAIL: 'support@thefuturecouncil.in',
      INSTAGRAM: 'https://www.instagram.com/thefuturecouncil.in/',
      LINKEDIN: 'https://www.linkedin.com/company/thefuturecouncil/'
    }
  };

  root.TFC_CONFIG = TFC_CONFIG;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TFC_CONFIG;
  }
})(typeof window !== 'undefined' ? window : global);
