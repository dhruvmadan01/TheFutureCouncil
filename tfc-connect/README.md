# TFC Connect: Antigravity starter kit

Everything Antigravity's agent needs to build TFC Connect (Co-founder Match + Startup Directory) in The Future Council's style.

## What's inside
| Path | What it is |
|---|---|
| `AGENTS.md` | Project brief. Antigravity loads it automatically as a workspace rule. |
| `.agents/rules/design-system.md` | TFC colours, fonts and components. Auto-applies to `.tsx` and `.css` files. |
| `.agents/rules/supabase-and-data.md` | Database and security rules. The agent loads them when relevant. |
| `docs/PRD.md` | The full functional spec (routes, screens, rules). |
| `docs/BUILD_PLAN.md` | **8 copy-paste prompts, one per phase.** |
| `docs/TFC_Connect_Product_Plan.pdf` | Visual mockups of every screen. |
| `supabase/migrations/0001_init.sql` | Full schema, Row-Level Security and the matching engine (tested). |
| `supabase/migrations/0002_storage_and_cron.sql` | Storage buckets and the nightly matching job. |
| `supabase/seed.sql` | Chapters, collections and demo startups. |
| `design/tokens.css`, `design/weights.ts` | Tailwind v4 theme tokens and matching weights. |
| `public/logo.png` | The TFC logo. |

## How to start
1. Unzip this folder somewhere, for example `~/Projects/tfc-connect`.
2. In Antigravity: **File → Open Folder** → pick `tfc-connect`.
3. Create a free Supabase project (the agent will guide you in Phase 1).
4. Open the Agent panel, copy **Phase 0** from `docs/BUILD_PLAN.md`, paste it and run it.
5. Test each phase before pasting the next one.

You need Node.js 20+ installed. Git is recommended: run `git init` first so you can undo anything the agent does.
