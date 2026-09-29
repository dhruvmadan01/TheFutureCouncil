import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "./types";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[TFC] Missing required environment variable: ${key}. Set it in Vercel → Environment Variables.`);
  return val;
}

export function createClient() {
  return createBrowserClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
