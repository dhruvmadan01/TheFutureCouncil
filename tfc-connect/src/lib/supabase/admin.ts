import { createClient } from "@supabase/supabase-js";
import { type Database } from "./types";

/**
 * Service role Supabase client.
 * ONLY use for:
 * 1. Admin-only operations after checking is_admin()
 * 2. Background matching engine invocation on onboarding complete (PRD §4.1)
 *
 * DO NOT use in general user requests to bypass RLS.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable"
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
