import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type Database } from "./types";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[TFC] Missing required environment variable: ${key}. Add it in Vercel → Project Settings → Environment Variables.`);
  return val;
}

export async function createClient() {
  const cookieStore = await cookies();
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}
