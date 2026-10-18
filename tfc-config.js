/**
 * The Future Council · Global Configuration & Single Source of Truth
 * Shared across all client-side pages and components.
 */
(function(root) {
  var TFC_CONFIG = {
    // Primary routing & CTAs
    APPLY_URL: '/launchpad/fellowship',
    GOOGLE_FORM_URL: '/launchpad/fellowship',

    // Ecosystem statistics
    CHAPTER_COUNT: 18,
    CHAPTER_COUNT_LABEL: '90+ colleges',

    // Launchpad: free, interview-based, rolling applications
    LAUNCHPAD: {
      FEE: 0,
      FEE_TERMS: 'No application fee',
      EQUITY: '0%',
      EQUITY_TERMS: 'No equity taken',
      SUCCESS_FEE: '0%',
      SUCCESS_FEE_TERMS: 'No success fee on capital raised',
      SELECTION: 'Apply, interview, then selection',
      APPLICATIONS: 'Open any time. No cohorts, no deadlines.',
      UNSELECTED_BENEFITS: {
        FEEDBACK: 'Written feedback with specific actionable fixes'
      }
    },

    // Startup School: Discontinued
    STARTUP_SCHOOL: null,

    // Legal Entity & Brand Footer
    ENTITY: {
      NAME: 'TFC Innovations Pvt. Ltd.',
      CIN: 'CIN U62011DC2026PTC475213',
      ADDRESS: '205 GF, Indra Vihar, Near Mukherjee Nagar, G.T.B. Nagar, North West Delhi, Delhi – 110009',
      FULL_LEGAL_ENTITY: 'TFC Innovations Pvt. Ltd. (CIN U62011DC2026PTC475213), 205 GF, Indra Vihar, Near Mukherjee Nagar, G.T.B. Nagar, North West Delhi, Delhi – 110009',
      FOOTER_COPYRIGHT: '© 2026 TFC Innovations Pvt. Ltd. · The Future Council',
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
