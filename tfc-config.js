/**
 * The Future Council · Global Configuration & Single Source of Truth
 * Shared across all client-side pages and components.
 */
(function(root) {
  var TFC_CONFIG = {
    // Primary routing & CTAs
    APPLY_URL: '/launchpad/fellowship',
    GOOGLE_FORM_URL: 'https://forms.gle/zPn7H2HgBepJTmzb7',

    // Ecosystem statistics
    CHAPTER_COUNT: 18,
    CHAPTER_COUNT_LABEL: '18 campuses',

    // Launchpad Fellowship Program Facts
    LAUNCHPAD: {
      COHORT: 'Cohort 01',
      SEATS: 20,
      SEATS_LABEL: '20 founders/cohort',
      FEE: 999,
      FEE_FORMATTED: '₹999',
      FEE_TERMS: '₹999 application fee, one time, non-refundable',
      FEE_WAIVER_TEXT: 'Fee waivers available if ₹999 is a financial barrier.',
      FEE_WAIVER_URL: 'mailto:support@thefuturecouncil.in?subject=Fee%20Waiver%20Request%20-%20Launchpad%20Cohort%2001',
      EQUITY: '0%',
      EQUITY_TERMS: '0% equity taken',
      SUCCESS_FEE: '5%',
      SUCCESS_FEE_TERMS: '5% cash success fee ONLY on capital from TFC-introduced investors within 12 months of Demo Day',
      DURATION: '4 weeks fully online',
      POD_SIZE: 'pods of 4–5',
      TIME_COMMITMENT: '6–8 hrs/week',
      DEADLINE_ISO: '2026-09-30T19:00:00+05:30',
      DEADLINE_DISPLAY: 'Sep 30, 2026, 7 PM IST',
      KICKOFF_DISPLAY: 'Oct 19, 2026',
      AUDIENCE: 'Student founders and early-stage builders from any college or university across India',
      UNSELECTED_BENEFITS: {
        FEEDBACK: 'Written feedback with 2–3 specific fixes',
        STARTUP_SCHOOL: '1 month Startup School free (worth ₹399)',
        REAPPLY_DISCOUNT: '50% off next application (₹499)'
      },
      WEEKLY_STRUCTURE: [
        { week: 'Week 1', title: 'Kickoff & founder pods' },
        { week: 'Week 2', title: 'Live labs & mentor office hours' },
        { week: 'Week 3', title: 'Demo prep & mock pitches' },
        { week: 'Week 4', title: 'Demo Day' }
      ]
    },

    // Startup School Facts
    STARTUP_SCHOOL: {
      PRICE: 399,
      PRICE_FORMATTED: '₹399/month',
      PRICE_TERMS: '₹399/month, cancel anytime',
      MODULE_COUNT: 9,
      CHAPTER_TRIAL: '7 days free',
      SESSION_NAME: 'Sunday Live Lab',
      SESSION_TIMING: 'Sundays 6:00–7:30 PM IST'
    },

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
