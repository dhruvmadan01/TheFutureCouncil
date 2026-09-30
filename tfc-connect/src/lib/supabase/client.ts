import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "./types";

export function createClient() {
  // NEXT_PUBLIC_* vars are baked into the client bundle at build time.
  // If they are missing, log clearly but do NOT throw — throwing here crashes
  // every Client Component (AppShell, etc.) during SSR and in the browser.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // In production this means env vars weren't set in Vercel before building.
    // The browser client needs a valid URL/key; return a no-op placeholder that
    // logs errors on auth calls but doesn't crash the render tree.
    console.error(
      "[TFC] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add them in Vercel → Project → Settings → Environment Variables, then redeploy."
    );
  }

  return createBrowserClient<Database>(
    url ?? "https://placeholder.supabase.co",
    key ?? "placeholder-key"
  );
}
