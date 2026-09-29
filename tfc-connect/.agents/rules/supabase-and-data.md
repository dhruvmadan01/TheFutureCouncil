---
trigger: model_decision
description: Rules for anything touching Supabase, SQL, auth, RLS, server actions or data fetching
---

# Supabase and data rules

- Use `@supabase/ssr`. Create the server client in `src/lib/supabase/server.ts` and the browser client in `src/lib/supabase/client.ts`. Refresh the session in `middleware.ts`.
- **RLS is the security boundary.** Every table has RLS enabled in `0001_init.sql`. Never use the service-role key in code that runs for a user request. Use it only in cron or edge functions and in admin-only server actions after checking `is_admin()`.
- Never change `0001_init.sql` after it has been applied. Put every change in a new file, `supabase/migrations/000N_description.sql`.
- After schema changes, regenerate types with `npx supabase gen types typescript --local > src/lib/supabase/types.ts`.
- Contact details (email, phone, LinkedIn) live in `profile_contacts`, and RLS exposes them only to the owner and to accepted connections. Never join or copy them anywhere else.
- Do mutations in Server Actions with zod validation. Return `{ ok: true, data } | { ok: false, error }`. Don't throw raw errors to the client.
- Enforce rate limits (10 pending requests per week, a note of at least 50 characters, 3 updates per week per startup) in the database with triggers or check functions, not only in the UI.
- Storage buckets are `avatars` (public), `startup-media` (public) and `decks` (private: owner and admins only).
- Matching runs nightly through `select public.compute_daily_matches();` (pg_cron, 02:30 UTC, which is 8:00 AM IST). Keep the scoring weights in one place: the SQL function `public.match_score()`. Mirror them in `src/lib/matching/weights.ts` so the UI can explain them.
