# Analytics Tracking — Mixpanel

This project uses **Mixpanel** for all product analytics. Mixpanel is the single source of truth for event tracking, user identification, and behavioral data across The Future Council platform.

---

## 1. Technical Foundation & Tech Stack

| Detail | Value |
|---|---|
| **Platform** | Vanilla HTML5 / JavaScript (Client-side Web App & Serverless Handlers) |
| **Mixpanel SDK** | `mixpanel-browser` (v2.83.0) + bundled `mixpanel.min.js` |
| **Tracking Method** | Client-side SDK (`window.mixpanel` / `window.TFCAnalytics`) |
| **CDP (if any)** | None (direct Mixpanel SDK integration) |
| **Consent Required** | No (India / Global student ecosystem; non-regulated direct telemetry) |
| **Project Token** | `f05da0bb13a820969c659b2508adb302` |
| **Initialization File** | [tfc-analytics.js](file:///c:/Users/Dhruv%20Madan/Desktop/The%20future%20council/tfc-analytics.js) |

---

## 2. Mixpanel Initialization

Mixpanel is loaded and initialized on application boot inside [tfc-analytics.js](file:///c:/Users/Dhruv%20Madan/Desktop/The%20future%20council/tfc-analytics.js):

```javascript
const MIXPANEL_TOKEN = 'f05da0bb13a820969c659b2508adb302';

window.mixpanel.init(MIXPANEL_TOKEN, {
  debug: false,
  track_pageview: false, // Manual enriched landing_page_viewed tracking
  persistence: 'localStorage',
  ignore_dnt: true
});
```

---

## 3. Mixpanel Identity Management

| Action | When to call | Code Location |
|---|---|---|
| `mixpanel.identify(email)` | On application submission, payment, or Google OAuth login | [tfc-analytics.js](file:///c:/Users/Dhruv%20Madan/Desktop/The%20future%20council/tfc-analytics.js), [tfc-auth.js](file:///c:/Users/Dhruv%20Madan/Desktop/The%20future%20council/tfc-auth.js) |
| `mixpanel.people.set({...})` | Synchronizes user profile properties (name, email, university, tier) | `TFCAnalytics.trackApplicationCompleted`, `TFCAuth.onAuthStateChanged` |
| `mixpanel.reset()` | On user logout | `TFCAuth.logout()` |

---

## 4. Instrumented Events & Tracking Plan

| # | Event Name | Trigger Location | Primary Properties |
|---|---|---|---|
| 1 | `landing_page_viewed` | Page boot on [index.html](file:///c:/Users/Dhruv%20Madan/Desktop/The%20future%20council/index.html), [fellowship.html](file:///c:/Users/Dhruv%20Madan/Desktop/The%20future%20council/fellowship.html), [branches.html](file:///c:/Users/Dhruv%20Madan/Desktop/The%20future%20council/branches.html), and chapter pages | `acquisition_channel`, `university`, `landing_variant` |
| 2 | `application_started` | User focuses/inputs into fellowship form or clicks "Apply" CTA | `acquisition_channel`, `university`, `application_version`, `application_start_time` |
| 3 | `eligibility_check_completed` | User checks commitment terms or finishes Step 3 validation | `acquisition_channel`, `university`, `eligibility_result`, `eligibility_ineligibility_reason` |
| 4 | `application_completed` | User successfully submits fellowship application form | `acquisition_channel`, `university`, `submission_status`, `completion_time` |
| 5 | `selection_outcome_recorded` | System / Admin records selection decision after review | `acquisition_channel`, `university`, `selection_outcome`, `review_batch` |
| 6 | `fellowship_enrollment_started` | Selected applicant begins payment / enrollment steps (₹999 pass) | `acquisition_channel`, `university`, `enrollment_step`, `review_batch` |
| 7 | `fellowship_enrolled` | Applicant successfully completes payment / enrollment confirmed | `acquisition_channel`, `university`, `fellowship_fee_amount`, `payment_status`, `review_batch` |
| 8 | `application_abandoned` | User leaves application before submission (`beforeunload`) | `acquisition_channel`, `university`, `abandon_step`, `abandon_duration_seconds` |
| 9 | `eligibility_filter_shown` | Step 3 commitment displayed or `#eligibility` viewed | `acquisition_channel`, `university`, `eligibility_version`, `eligibility_check_entry_point` |
| 10 | `application_review_decision_viewed` | Applicant views selection / admission dashboard status | `acquisition_channel`, `university`, `selection_outcome`, `decision_page_variant` |
| 11 | `fellowship_scroll_depth_reached` | User scrolls through fellowship pages to depth thresholds (25, 50, 75, 90, 100) | `acquisition_channel`, `university`, `depth_percentage`, `page_path` |
| 12 | `chapter_join_scroll_depth_reached` | User scrolls through chapter/branch directory, branch detail, or join pages | `acquisition_channel`, `university`, `depth_percentage`, `page_path` |
| 13 | `exit_intent_detected` | Visitor moves mouse out top of window toward tabs / address bar | `acquisition_channel`, `university`, `page_path`, `time_on_page_seconds` |
| 14 | `form_field_drop_off` | User focuses/interacts with form field and exits without submitting | `acquisition_channel`, `university`, `last_field_id`, `last_field_name`, `form_id`, `time_on_field_seconds` |

---

## 5. Developer Usage API

Use `window.TFCAnalytics` helpers from anywhere in the client:
```javascript
// Example: Track enrollment started
window.TFCAnalytics.trackFellowshipEnrollmentStarted({
  university: 'IIT Delhi',
  enrollment_step: 'payment_details',
  review_batch: '2026Q3 Batch'
});
```
