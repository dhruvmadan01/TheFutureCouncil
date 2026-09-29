# TFC Connect: Build plan for Antigravity

Paste **one prompt at a time** into the Antigravity Agent panel (or the Agent Manager). Wait for the walkthrough, test it yourself, then move on. Each phase ends with `npm run build` passing.

> Tip: use **Planning** mode for phases 0–2 so the agent writes an Implementation Plan artifact first. Review it and comment, then let it run. Fast mode is fine for small fixes.

---

## Phase 0 · Project setup
```
Read AGENTS.md, docs/PRD.md and the rules in .agents/rules. Then set up the project:
1. Scaffold Next.js 15 (App Router, TypeScript, Tailwind v4, ESLint, src/ dir, npm) in this folder. If create-next-app refuses because the folder isn't empty, scaffold into ./_app and move everything up, keeping all existing files (AGENTS.md, .agents/, docs/, design/, supabase/, public/logo.png).
2. Install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers lucide-react clsx tailwind-merge, then init shadcn/ui.
3. Put design/tokens.css into src/app/globals.css after the tailwind import. Load Bricolage Grotesque (400/600/800), Instrument Sans (400/500/600) and IBM Plex Mono (500/600) with next/font/google as the CSS variables --font-bricolage, --font-instrument and --font-plex-mono.
4. Restyle the shadcn Button (pill variants solid/dark/forest/ghost), Input, Badge (→ Chip with variants verified/backed/hiring/raising/needs/neutral), Card, Dialog and Sheet to match .agents/rules/design-system.md.
5. Create src/lib/supabase/{server,client,middleware}.ts and middleware.ts, following @supabase/ssr docs. Create .env.example with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.
6. Copy design/weights.ts to src/lib/matching/weights.ts.
7. Build a /styleguide page that shows every token, font, button, chip and card so I can check the look against page 5 of docs/TFC_Connect_Product_Plan.pdf.
Finish with npm run build passing and a walkthrough with screenshots of /styleguide at 390px and 1280px.
```

## Phase 1 · Database + auth
```
Set up Supabase:
1. Install the Supabase CLI as a dev dependency. Run `npx supabase init` if needed, and keep supabase/migrations and supabase/seed.sql as they are.
2. Tell me exactly what to do in the Supabase dashboard: create the project (region Mumbai ap-south-1), enable Google auth and email magic link, enable pg_cron, and copy the keys into .env.local. Wait for me to confirm.
3. Link the project and push the migrations (0001, 0002), then run the seed. Generate types into src/lib/supabase/types.ts.
4. Build /login (magic link plus "Continue with Google", in TFC style, with the logo), /auth/callback, and sign-out. Add middleware redirects as PRD §3 describes.
5. Build the app shell: top nav on desktop (logo + "TFC Connect", Match, Startups, Messages, avatar menu, "+ List your startup" pill) and a bottom tab bar on mobile (Match, Startups, Messages, Me).
Test: sign up with 2 accounts, confirm each gets a profiles row, and confirm one user can't read the other's profile_contacts.
```

## Phase 2 · Onboarding + profiles
```
Build /onboarding exactly as in PRD §4.1 and PDF page 7: 5 steps, a progress bar, the dashed-path step indicator, and each step saved with a Server Action + zod. Build /people/[id] (the full profile from PDF page 8) and /me with edit. Contact details (email/LinkedIn) must only render when profile_contacts returns a row, which RLS controls. After step 5, compute the user's first matches immediately (server action with the service role, only for this user) and redirect to /match.
```

## Phase 3 · Matching, requests, browse
```
Build /match (PRD §4.2), /people browse + filters (§4.3), the Connect sheet (§4.4) and /requests (§4.5), matching PDF page 8. Use the DB error messages from the triggers as toasts. Make "Not a fit" animate the card out. Add a seed script (scripts/seed-people.ts, using the service role) that creates 30 realistic fake Indian student profiles across DU, NSUT, DTU, SRCC and IIT Madras BS, so I can test matching. Then run compute_daily_matches.
```

## Phase 4 · Messages + Founder Fit Kit [COMPLETED]
```
Build /messages and /messages/[connectionId] with Supabase Realtime (PRD §4.6, PDF page 9): the conversation list with "quiet for 5 days" state, the thread, the Founder Fit Kit panel (a tab on mobile), "Share to chat" fitkit messages, "We teamed up" with the both-sides confirmation and celebration, and Report/Block in the ⋯ menu. Put simple template pages in /public/templates (trial sprint, co-founder agreement checklist, one-page NDA). Mark them clearly as templates, not legal advice.
```

## Phase 5 · Startup Directory (Completed)
```
Build the public directory (PRD §5.1, PDF page 11), the startup page with an OG image (§5.2, PDF page 12), and the 4-step "List your startup" flow (§5.3) with logo and cover upload to the startup-media bucket and deck upload to the private decks bucket. Add a new migration for the trending score view. Add follows, upvotes, updates (max 3/week), open roles and applications, and "Claim this startup" for unclaimed listings. Public pages use ISR (revalidate 300) and have proper metadata.
```

## Phase 6 · Landing page (Completed)
```
Build / as in PDF page 6, in the thefuturecouncil.in style: the eyebrow with the glowing dot, the headline "Don't build alone. / Find your co-founder." (second line orange), two pill CTAs, live counters from the DB, a dark "Founders from" strip with college chips, a "How it works" dashed path in 3 steps, featured startups from the TFC Backed collection, FAQ and a footer CTA. Mobile-first, with a Lighthouse score of at least 90.
```

## Phase 7 · Admin (Completed)
```
Build /admin (PRD §6, PDF page 14), protected by is_admin in both middleware and the server actions: KPIs, the verification queue (approve sets profile flags or the startup tier), the reports queue, the collections editor with drag-to-reorder, chapters CRUD with a leaderboard, and the Launchpad signal list. Tell me the SQL to make my account admin.
```

## Phase 8 · Emails, analytics, polish, deploy (Completed)
```
Add Resend emails (PRD §7) using React Email templates in TFC style, and PostHog events (PRD §8). Do an accessibility and empty-state pass on every page. Then walk me through deploying to Vercel with the env vars, and through setting the Supabase auth redirect URLs for the production domain (for example connect.thefuturecouncil.in).
```

---

### When something goes wrong
- **"It doesn't look like the PDF":** attach a screenshot of the PDF page and say "match this exactly, and follow .agents/rules/design-system.md".
- **RLS errors ("permission denied" or empty lists):** say "check the RLS policy in 0001_init.sql for this table and fix the query, not the policy."
- **The agent wants to change the schema:** it must add `supabase/migrations/0003_*.sql`, never edit 0001.
