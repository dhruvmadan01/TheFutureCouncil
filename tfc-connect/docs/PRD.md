# TFC Connect: Product Requirements (v1.0)

> Find your co-founder. Get your startup seen. A free portal by The Future Council.
> Visual reference for every screen: `docs/TFC_Connect_Product_Plan.pdf` (the page numbers below refer to it).

## 1. Goals
- **North-star metric:** teams formed per month, meaning both people tap "We teamed up".
- Health targets: at least 70% of users complete onboarding, at least 30% of requests are accepted, at least 40% of chats go past 5 messages, at least 60% of listings are verified within 48h.
- **Not monetised.** No pricing, no paywalls, no Pro tier.

## 2. Users
Idea-stage founder · Builder (dev/design/growth) · Early startup · Investor/mentor (Phase V2) · TFC admin.

## 3. Routes

| Route | Access | Screen (PDF page) |
|---|---|---|
| `/` | public | Landing (p6) |
| `/login`, `/auth/callback` | public | Magic link + Google sign-in |
| `/onboarding` | signed-in | 5-step onboarding (p7) |
| `/match` | signed-in | Today's matches (p8) |
| `/people`, `/people/[id]` | signed-in | Browse + filters, full profile (p8) |
| `/requests` | signed-in | Incoming / Sent (p8) |
| `/messages`, `/messages/[connectionId]` | signed-in | Chat + Founder Fit Kit (p9) |
| `/startups` | public | Directory (p11) |
| `/startups/[slug]` | public | Startup page (p12) |
| `/startups/new`, `/startups/[slug]/edit` | signed-in | 4-step listing form (p12) |
| `/collections/[slug]` | public | Collection page |
| `/me`, `/me/settings` | signed-in | My profile, my startups, privacy |
| `/admin/*` | admins | Overview, verification, reports, collections, chapters (p14) |

Middleware: redirect signed-in users with `onboarding_complete = false` to `/onboarding` (except auth routes). Redirect signed-out users away from signed-in routes to `/login?next=…`.

## 4. Co-founder Match

### 4.1 Onboarding (5 steps with a progress bar; save after each step)
1. **Basics & verification:** photo, full name, college/company, city, LinkedIn (saved to `profile_contacts`), optional chapter code. A chapter code creates a `verification_requests` row (kind `profile`).
2. **Role & skill:** `role` is one of "I have an idea", "I want to join one" or "Either works". Pick `primary_skill` (one) plus optional `secondary_skills`.
3. **Looking for:** `looking_for_skills` (1–3), `industries` (1–5, preset list plus custom), `commitment` (Full-time / Part-time / After graduation), `available_from`, preferred city plus `remote_ok`, `equity_pref`.
4. **Proof of work:** 1–3 `proof_links` (url, title, note) and `why_startup` (max 200 characters).
5. **Working style:** 4 sliders from 0 to 100 (`speed`, `risk`, `hours`, `decision`). On finish, set `onboarding_complete = true`, show a "Profile complete" celebration, and route to `/match`.

If `matches_daily` is empty for a user who just finished onboarding, call a server action that computes their first 5 matches immediately. It uses `match_eligible` and `match_score` with the service role, only for that user.

### 4.2 Today's matches (`/match`)
- Show today's rows from `matches_daily` (IST date) as cards, **not swipes**: avatar, name, verified chip, college/city, score (0–100) with a bar, a **"Why you match"** box (from `reasons`), skill chips, 2 proof links, and **Connect / Save / ✕ Not a fit**.
- A header chip shows "N of 5 left", counting cards whose action is still `none`.
- "Not a fit" writes to `profile_passes` and sets action `not_fit`. The card animates out, and the person doesn't appear again for 90 days.
- Empty state: "New matches land at 8 AM. Meanwhile, complete your proof of work to get better ones." Link to browse.

### 4.3 Browse people (`/people`)
- Filters: skill, industry, commitment, city, college, verified only, open to join. Search by name, college or tag.
- Paginated grid of PersonCards. It hides blocked, hidden and incomplete profiles (RLS already enforces this).

### 4.4 Connect
- A bottom sheet (mobile) or dialog (desktop) holds a note field (50–500 characters with a live counter), tips ("say what you're building, why them, and a clear ask"), and "N of 10 weekly requests left".
- The database enforces the limits. Show the database's error message as a friendly toast.

### 4.5 Requests (`/requests`)
- Incoming: note preview, score, and Accept / Decline. Decline is private, so the sender sees "Not now".
- Sent: status, and "Withdraw" (sets `archived`).
- Requests expire after 14 days through the cron job.

### 4.6 Messages (`/messages`)
- Conversation list (accepted connections, sorted by `last_message_at`), then the thread. Use Supabase Realtime on `messages`.
- Header: other person's name, verified chip, "Connected N days ago · score", and a **"🤝 We teamed up"** button (forest). A connection is teamed up once both sides tap it. Then show a celebration and offer "Create your startup listing together", which adds both as members with `met_on_tfc = true`.
- **Founder Fit Kit** panel (right side on desktop, a tab on mobile): the 10 questions from `weights.ts`, stored as `fitkit_done`, with a progress bar. "Share to chat" posts a message with `kind = 'fitkit'`, styled as a dashed orange card. It also links a trial-project template, a co-founder agreement template and a one-page NDA (static pages or PDFs in `/public/templates`).
- The ⋯ menu has Report and Block.
- After 5 quiet days, the list item shows "Quiet for 5 days · nudge?"

### 4.7 Contact privacy
Email and LinkedIn appear on a profile **only** after the connection is accepted (`profile_contacts` RLS).

## 5. Startup Directory

### 5.1 Directory (`/startups`, public, SEO)
- Collections strip on top (published `collections`, with a gradient for each theme).
- Left filters: stage, industry, looking-for tags, city, college, verified only. Top: result count and sort (Trending / Newest / Most followed).
- **Trending** = (follows + upvotes + role applications in the last 7 days) × tier multiplier (listed 1, verified 1.3, TFC Backed 1.6), decayed by days since `last_update_at`. Add it as a SQL view or function in a new migration.
- StartupCard: logo, name, verified chip, one-liner, stage badge, status chips, industry · city, follower count.

### 5.2 Startup page (`/startups/[slug]`, public, SEO + OG image)
- Cover, logo, name, tier chips, one-liner. Actions: Follow (count), Try product ↗, Join the team (goes to open roles).
- Chips: stage, industry, city, founded year. Up to 3 metric tiles. Problem → Solution. Updates feed. Team (from `startup_team_public`, with a "Met on TFC Connect 🤝" badge). Open roles with Apply (note of 50–500 characters, creates `role_applications`).
- Owner-only: Edit, post update (max 3 a week), manage roles and applications, upload deck (private bucket), request verification.
- Unclaimed listings (`claimed = false`) show "Is this your startup? Claim it", which creates a `verification_requests` row for admins.
- Generate an OG image dynamically with `next/og`, using TFC styling.
- Listings with no update in 90 days show an "Inactive" chip and rank lower. The owner gets a reminder email at 60 days (Phase V1).

### 5.3 List your startup (4 steps)
Basics (name, slug auto-generated and editable, logo, website, industry, city, founded year) → Story (one-liner of max 80 characters, problem, solution, stage, metrics, media) → Team (invite by email or search people) → Needs (status tags plus open roles). Publishing creates the listing as `listed`, and the founder can then request verification.

### 5.4 Verification tiers
Listed (default) → **Verified** (admin checks a working product link and the founder's verified email) → **TFC Backed** (Launchpad fellows, admin only).

## 6. Admin (`/admin`, `is_admin` only)
- Overview KPIs: profiles, startups, acceptance rate, **teams formed** (highlighted).
- Verification queue: approve (sets the flags or tier), reject, or ask for info, with a 48h SLA indicator.
- Reports queue: view the target, resolve, and hide a profile or startup.
- Collections editor: create, reorder, publish, and add or remove startups.
- Chapters: CRUD plus a leaderboard of verified sign-ups this month.
- Launchpad signal: teams formed in the last 30 days with a verified startup and 3+ updates.

## 7. Notifications (Phase V1, via Resend)
Daily matches ready (opt-in), new request, request accepted, new message (batched, at most 1 an hour), "We teamed up" confirmation, 5-day quiet nudge, 30-day "Still looking?" check (updates `still_looking_at`), 60-day listing reminder.

## 8. Non-functional
- Lighthouse score of at least 90 for performance and accessibility on mobile for `/` and `/startups`.
- Public pages are statically generated with ISR (revalidate 5 minutes). Signed-in pages are dynamic.
- Every form uses zod on both client and server, and every mutation goes through a Server Action.
- Analytics events (PostHog): `onboarding_step_completed`, `match_viewed`, `connect_sent`, `request_accepted`, `message_sent`, `teamed_up`, `startup_listed`, `startup_followed`, `role_applied`.
