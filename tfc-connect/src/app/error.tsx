"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TFC Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-warm text-ink flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-soft border border-plum/20">
          <span className="size-2 rounded-full bg-plum animate-pulse" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-plum-deep">
            Something went wrong
          </span>
        </div>

        <h1 className="font-display text-4xl font-black text-ink tracking-tight">
          We hit a snag.
        </h1>
        <p className="font-sans text-ink-soft text-sm leading-relaxed max-w-sm mx-auto">
          Something unexpected happened on our end. Your account and data are safe.
          {error.digest && (
            <span className="block mt-2 font-mono text-[10px] text-mute">
              Error ID: {error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-full bg-orange text-white font-sans font-semibold text-sm hover:bg-orange-deep transition-colors shadow-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full border border-line bg-card text-ink font-sans font-semibold text-sm hover:bg-warm-2 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
