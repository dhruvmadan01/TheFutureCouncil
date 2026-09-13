# Google Login — UI/UX Spec (v2)
**For:** thefuturecouncil.in ("Future Council")
**Supersedes:** the earlier neo-brutalist version — the site has since been rebuilt as a polished startup-ecosystem platform, and that spec no longer matches.

---

## 0. What changed, and why this rewrite matters

The old spec assumed the neo-brutalist look (black borders, hard offset shadows, browser-chrome bar) carried over from your branded documents. It doesn't anymore — the live site now reads as a clean, credibility-first startup/VC platform: chapter directories, a formal Fellowship program, partner/ambassador pages. The login UI needs to match *that* register, not the old one.

**Important constraint:** I don't have live visual access to the site (no screenshot/browser tool active), so I can't hand you exact hex values, font stacks, or spacing tokens — only the structure, IA, and design direction below. Antigravity should pull the actual design tokens (colors, font, border-radius, shadow values, spacing scale) straight from the site's own CSS/design system rather than guessing from this doc. Where I reference "orange," that's from the site's `theme-color` meta tag (`#ff9e59`) — confirm the exact shade from the live CSS, not this number.

**Design direction to follow instead of neo-brutalist:**
- Soft shadows, not hard offset shadows
- Rounded corners (cards, buttons, inputs) — this is a modern SaaS/startup-platform feel, not a brutalist zine
- Generous whitespace, restrained borders (thin/none rather than thick black)
- Clean sans-serif type, confident but not shouty — headlines can be bold, but body copy should feel professional/credible (this site is selling itself to investors and colleges, not just students)
- Orange as an accent used sparingly (primary CTAs, active states) against a mostly white/neutral base — match the actual site, don't invent a new palette

---

## 1. Real Entry Points on the Current Site

Pulled from the live nav and page structure — build around these, not invented ones:

| Location | Current state | What changes |
|---|---|---|
| Primary nav CTA | "Join Council" button | Becomes (or gains) the Google sign-in entry point for people creating an account |
| Ambassador section | Separate "Ambassador Login" link | Decide: fold into one unified "Log in," or keep role-specific entry points that all resolve to the same Google auth underneath |
| Fellowship '26 application | "Apply Now" CTA | Should require auth before/during application so progress is saved to an account, not a one-shot form |
| Branch/chapter pages | No visible auth surface currently | Consider whether chapter members need accounts at all, or if auth is only for Fellowship applicants + ambassadors for now |

**Recommendation:** don't add a generic "Log in" button to the main nav if the site currently doesn't have one — that's a UI pattern from the old spec, not something the new IA calls for. Instead, wire Google auth into the two flows that actually need accounts right now: **Fellowship applications** and **Ambassador access**. A universal "Log in" can come later once there's a real member dashboard to log into.

---

## 2. Core Flow

```
[Anonymous]
   → Clicks "Join Council" / "Apply Now" (Fellowship) / "Ambassador Login"
   → Continue with Google
   → Google account picker + consent
   → Returns to site
        ├─ New user → short profile step (role-relevant fields only, see §4) → into the flow they started
        └─ Returning user → straight back into the flow they started (resume application, ambassador dashboard, etc.)
```

Use Google's popup OAuth flow on desktop; redirect flow on mobile web where popups are unreliable — this part is unchanged from before, it's a technical constraint, not a style choice.

---

## 3. Screens

### 3.1 Sign-in Prompt
Triggered inline from whichever action started it (applying, ambassador login) — not a separate page unless the person lands on `/login` directly.

- Card: white background, subtle border or none, soft drop shadow, rounded corners (match the site's existing card style — chapter cards, benefit cards on the homepage already establish this pattern, reuse it)
- Headline should match context, not be generic:
  - From Fellowship apply: "Sign in to start your application"
  - From Ambassador: "Ambassador sign-in"
  - From a general "Join Council" CTA: "Join the Council"
- Google's official "Continue with Google" button, unmodified (brand rule unchanged from before — Google requires the standard button styling and G logo; you can place it inside your card, not reskin it)
- Small legal line beneath: "By continuing you agree to Future Council's Terms and Privacy Policy," linking to the existing `/terms.html` and `/privacy.html` pages

### 3.2 Loading / Error States
Unchanged in behavior from the original spec, restyled to match:
- Connecting: button shows spinner + "Connecting…", disabled
- Popup blocked: inline recovery message with manual retry link — soft-colored inline banner (light orange/neutral background, not the hard-bordered warning box from before)
- Generic failure: inline retry message in the same card, no auto-close

### 3.3 New User — Short Profile Step
Keep this tight and role-specific rather than one generic form:
- **Fellowship applicant:** name, email (from Google), college/university, course & year — feeds directly into the application, don't make them re-enter it later
- **Ambassador:** name, email, college/university, chapter (if already listed) or "chapter not yet started" option
- Single continue action, styled as the site's existing primary button (rounded, orange fill, matching "Apply Now" / "Join the Council" buttons already on the site)

### 3.4 Returning User / Logged-in State
- Whatever surface they authenticated from (Fellowship dashboard, ambassador dashboard) should recognize them immediately — no repeat profile step
- If/when a general member area exists: avatar or initials in the nav, replacing whatever CTA was there, with a simple dropdown (Profile, Dashboard, Log out) — soft card style, not the hard-bordered dropdown from the old spec

---

## 4. Copy Reference

| Context | Copy |
|---|---|
| Fellowship apply entry | "Sign in to start your application" |
| Ambassador entry | "Ambassador sign-in" |
| General join entry | "Join the Council" |
| Button | "Continue with Google" (Google-mandated, don't alter) |
| Legal line | "By continuing you agree to Future Council's Terms and Privacy Policy." |
| Popup blocked | "Popup blocked — click here to continue" |
| Generic error | "Something went wrong — try again." |

---

## 5. Handoff Notes for Antigravity

- **Pull real design tokens from the live site** — colors, font family, border-radius, shadow, spacing — rather than this document's descriptions. This spec gives structure and direction, not pixel values.
- Auth provider: Google OAuth 2.0, scopes `email` + `profile` only — implementation choice (Firebase/Supabase/NextAuth/raw GIS) is open.
- Session persistence: long-lived across visits.
- Track "profile complete" separately per flow (Fellowship applicant vs. Ambassador) since they collect different fields — don't force one generic profile schema.
- Reuse the site's existing card, button, and form-field components wherever possible instead of building new ones — the homepage's benefit cards and chapter cards are the closest existing patterns to the sign-in card.
- Accessibility: modal/card traps focus and closes on Escape if presented as a modal; Google button stays keyboard-navigable with its accessible label.
