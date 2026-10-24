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

    // Launchpad Accelerator Program Facts
    LAUNCHPAD: {
      COHORT: 'Cohort 02',
      SEASON: 'Spring',
      PREVIOUS_COHORT: 'Cohort 01',
      PREVIOUS_COHORT_SEASON: 'Winter',
      PREVIOUS_COHORT_STATUS: 'Registrations closed · kicks off Nov 1, 2026',
      SEATS: 20,
      SEATS_LABEL: '20 founders/cohort',
      FEE: 999,
      FEE_FORMATTED: '₹999',
      FEE_TERMS: '₹999 application fee, one time, non-refundable',
      FEE_INTENT_TEXT: 'Application fee filters for serious candidates and funds individualized written feedback.',
      EQUITY: 'None',
      PROGRAM_FEE: 150000,
      PROGRAM_FEE_FORMATTED: '₹1.5 lakh',
      PROGRAM_FEE_WAIVER: '100% waived',
      EQUITY_TERMS: 'No equity taken. The ₹1.5 lakh program fee is 100% waived.',
      SUCCESS_FEE: '0%',
      SUCCESS_FEE_TERMS: 'No success fee on capital raised',
      DURATION: 'In person · Delhi NCR',
      FORMAT: 'In person',
      LOCATION: 'Delhi NCR',
      PREVIOUS_COHORT_FORMAT: 'Fully online',
      POD_SIZE: 'pods of 4–5',
      TIME_COMMITMENT: '6–8 hrs/week',
      DEADLINE_ISO: '2027-01-15T23:59:59+05:30',
      DEADLINE_DISPLAY: 'Jan 15, 2027, 11:59 PM IST',
      KICKOFF_DISPLAY: 'Feb 1, 2027',
      AUDIENCE: 'Student founders and early-stage builders from any college or university who can attend in person in Delhi NCR',
      UNSELECTED_BENEFITS: {
        FEEDBACK: 'Written feedback with specific actionable fixes'
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
