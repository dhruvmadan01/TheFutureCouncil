import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { type Database } from "./types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Static / auth callbacks / styleguide routes
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isStyleguide = pathname.startsWith("/styleguide");
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/startups") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/api") ||
    isStyleguide;

  // 1. Signed-out users: redirect away from protected routes to /login?next=...
  if (!user) {
    if (!isAuthRoute && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 2. Signed-in users: check onboarding status
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, is_admin")
    .eq("id", user.id)
    .single();

  const isOnboardingRoute = pathname.startsWith("/onboarding");

  // If user visits /login while signed in, redirect them
  if (isAuthRoute && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = profile?.onboarding_complete ? "/match" : "/onboarding";
    return NextResponse.redirect(url);
  }

  // If onboarding is incomplete, redirect from app routes to /onboarding
  if (profile && !profile.onboarding_complete && !isOnboardingRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  // Admin protection
  if (pathname.startsWith("/admin") && !profile?.is_admin) {
    const url = request.nextUrl.clone();
    url.pathname = "/match";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
