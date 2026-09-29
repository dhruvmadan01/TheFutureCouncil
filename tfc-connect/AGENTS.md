# TFC Connect: agent instructions

You are building **TFC Connect**, a free portal by The Future Council (TFC, thefuturecouncil.in), a student startup ecosystem with 90+ university chapters in India.

TFC Connect has two sides that share one account and one profile:
1. **Co-founder Match.** Founders and builders get 5 curated matches a day, send connection requests with a note, and chat with a guided "Founder Fit Kit".
2. **Startup Directory.** Startups get public, shareable listings with collections, follows, updates and open roles.

The product is **not monetised**. Never add pricing, paywalls, subscriptions or payment code. Request limits exist only to protect quality.

## Source of truth
- `docs/PRD.md` is the functional spec. Follow it exactly and ask before deviating.
- `docs/BUILD_PLAN.md` holds the phased build. Do only the phase you are asked to do.
- `docs/TFC_Connect_Product_Plan.pdf` holds the visual mockups for every screen. Match them.
- `supabase/migrations/0001_init.sql` is the database schema. Don't redesign it. Add new migrations for changes.
- `.agents/rules/` holds the design system and coding rules. They load automatically.

## Stack (don't change without asking)
- Next.js 15 (App Router, TypeScript, Server Components by default, Server Actions for mutations)
- Tailwind CSS v4 + shadcn/ui, restyled with TFC tokens
- Supabase: Postgres, Auth (email magic link + Google), Storage, Realtime, Row-Level Security
- Resend for emails, PostHog for analytics (add these in later phases only)
- Deploy on Vercel
- Package manager: npm

## Project structure
```
src/app/(public)/          landing, /startups, /startups/[slug], /collections/[slug]
src/app/(auth)/            /login, /auth/callback
src/app/(app)/             signed-in: /match, /people, /people/[id], /requests, /messages, /me, /onboarding
src/app/(app)/admin/       TFC admins only
src/components/ui/         shadcn primitives (restyled)
src/components/tfc/        product components (PersonCard, MatchCard, StartupCard, Chip, StageBadge…)
src/lib/supabase/          server.ts, client.ts, middleware.ts
src/lib/matching/          scoring logic + tests
supabase/migrations/       SQL migrations
```

## Non-negotiables
- **Mobile-first.** Design at 390px first. Signed-in pages use a bottom tab bar on mobile (Match, Startups, Messages, Me) and a top nav on desktop.
- **Privacy.** Never expose a user's email, phone or LinkedIn unless their connection is `accepted`. Enforce this with RLS, not only in the UI.
- **Public vs private.** The directory and startup pages are public and SEO-indexed. People profiles and matching need sign-in.
- **Never a blank screen.** Every list has an empty state that says what to do next.
- **Copy voice.** Short, punchy, student-to-student, like thefuturecouncil.in ("Don't build alone.", "Someone on your campus is looking for you.").
- Use TypeScript strict mode, never `any`, and validate every form and server action with zod.
- Run `npm run lint` and `npm run build` before saying a phase is done. Fix everything they report.
- Don't commit secrets. Use `.env.local` and keep `.env.example` updated.

## When you finish a phase
Give me a short walkthrough artifact covering what was built, how to test it (click path), screenshots of each new screen at mobile and desktop widths, and anything you skipped or were unsure about.
