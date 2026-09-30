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
    CHAPTER_COUNT_LABEL: '18 campuses',

    // Launchpad Fellowship Program Facts
    LAUNCHPAD: {
      COHORT: 'Cohort 01',
      SEATS: 20,
      SEATS_LABEL: '20 founders/cohort',
      FEE: 999,
      FEE_FORMATTED: '₹999',
      FEE_TERMS: '₹999 application fee, one time, non-refundable',
      FEE_INTENT_TEXT: 'Application fee filters for serious candidates and funds individualized written feedback.',
      EQUITY: '2%',
      EQUITY_TERMS: '2% equity taken in selected cohort ventures',
      SUCCESS_FEE: '0%',
      SUCCESS_FEE_TERMS: 'No success fee on capital raised',
      DURATION: '4 weeks fully online',
      POD_SIZE: 'pods of 4–5',
      TIME_COMMITMENT: '6–8 hrs/week',
      DEADLINE_ISO: '2026-10-15T23:59:59+05:30',
      DEADLINE_DISPLAY: 'Oct 15, 2026, 11:59 PM IST',
      KICKOFF_DISPLAY: 'Nov 1, 2026',
      AUDIENCE: 'Student founders and early-stage builders from any college or university across India',
      UNSELECTED_BENEFITS: {
        FEEDBACK: 'Written feedback with specific actionable fixes',
        MENTOR_SESSIONS: 'Full access to all virtual leader & mentor sessions (founder pods, 1:1 office hours, investor intros & Demo Day remain exclusive to the 20 selected fellows)'
      },
      WEEKLY_STRUCTURE: [
        { week: 'Week 1', title: 'Kickoff & founder pods' },
        { week: 'Week 2', title: 'Live labs & mentor office hours' },
        { week: 'Week 3', title: 'Demo prep & mock pitches' },
        { week: 'Week 4', title: 'Demo Day' }
      ]
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
