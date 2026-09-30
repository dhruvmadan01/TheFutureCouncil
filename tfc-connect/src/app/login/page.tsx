"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // createClient() called lazily inside handlers — not at module/render level
  // so it never runs during static prerendering
  const getSupabase = () => createClient();

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setErrorMsg(null);
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to Google";
      setErrorMsg(message);
      setGoogleLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const emailRedirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await getSupabase().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo,
        },
      });

      if (error) throw error;

      setSubmittedEmail(email.trim().toLowerCase());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send magic link";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm text-ink flex flex-col justify-between py-10 px-4 sm:px-6">
      {/* Top minimal header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="TFC Logo"
            width={28}
            height={28}
            className="rounded-[6px] shadow-xs"
          />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            TFC Connect
          </span>
        </Link>
        <Link
          href="https://thefuturecouncil.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono uppercase tracking-wider text-ink-soft hover:text-ink transition-colors"
        >
          thefuturecouncil.in ↗
        </Link>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_-18px_rgb(27_23_18_/_0.12)] space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2">
              <span className="glow-dot" />
              <span className="eyebrow">CO-FOUNDER MATCH & DIRECTORY</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-tight leading-tight">
              Don&apos;t build alone. <br />
              <span className="text-orange">Find your people.</span>
            </h1>
            <p className="font-sans text-sm text-ink-soft leading-relaxed">
              One account and one profile across 90+ campus chapters. Free for every student founder.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-plum-soft border border-plum/25 rounded-xl p-3 text-xs text-plum flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submittedEmail ? (
            /* Magic Link Sent Confirmation */
            <div className="bg-forest-soft border border-forest/20 rounded-2xl p-6 text-center space-y-4 animate-in fade-in-50 duration-200">
              <div className="size-12 rounded-full bg-forest text-white mx-auto flex items-center justify-center">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-forest">
                  Check your inbox
                </h3>
                <p className="font-sans text-xs text-forest/90 leading-relaxed">
                  We sent a magic link to <strong className="font-semibold">{submittedEmail}</strong>.
                  Click the link to sign in instantly.
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setSubmittedEmail(null);
                  setEmail("");
                }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Google OAuth Button */}
              <Button
                variant="ghost"
                className="w-full h-11 text-sm font-medium border border-line hover:bg-warm-2 shadow-xs gap-3"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <Loader2 className="size-4 animate-spin text-ink-soft" />
                ) : (
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </Button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-line w-full" />
                <span className="bg-card px-3 text-[11px] font-mono uppercase tracking-wider text-mute shrink-0">
                  or with email
                </span>
                <div className="border-t border-line w-full" />
              </div>

              {/* Magic Link Form */}
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="font-mono text-xs uppercase tracking-wider text-ink-soft block font-medium"
                  >
                    College / work email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="rohan@du.ac.in"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="solid"
                  className="w-full gap-2 shadow-xs"
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Magic Link</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Sign-in — DEV ONLY, never shown in production */}
              {process.env.NODE_ENV !== "production" &&
                process.env.NEXT_PUBLIC_ENABLE_DEMO === "true" && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        setErrorMsg(null);
                        const { error } = await getSupabase().auth.signInWithPassword({
                          email: "demo_founder@tfc.internal",
                          password: "DemoFounderPass123!#",
                        });
                        setLoading(false);
                        if (error) {
                          setErrorMsg(error.message);
                        } else {
                          window.location.href = "/me";
                        }
                      }}
                      className="font-mono text-[11px] text-orange-deep hover:underline uppercase tracking-wider font-semibold"
                    >
                      ⚡ Quick Demo: Sign in as Ananya Kapoor (Founder)
                    </button>
                  </div>
                )}
            </div>
          )}

          {/* Privacy Footnote */}
          <div className="pt-2 border-t border-line/60 text-center">
            <p className="font-sans text-xs text-mute">
              No passwords to remember. Your contact details remain private until you accept a connection.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center font-mono text-[11px] text-mute">
        © 2026 The Future Council · thefuturecouncil.in · Campus-rooted & chapter-verified
      </footer>
    </div>
  );
}
