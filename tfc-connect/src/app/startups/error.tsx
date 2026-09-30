"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StartupsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TFC /startups error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center space-y-5">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-orange-deep">
          Directory unavailable
        </div>
        <h2 className="font-display text-3xl font-black text-ink tracking-tight">
          Couldn&apos;t load startups
        </h2>
        <p className="font-sans text-ink-soft text-sm leading-relaxed">
          We hit a temporary error fetching the startup directory. Your data is safe.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="px-5 py-2 rounded-full bg-orange text-white font-sans font-semibold text-sm hover:bg-orange-deep transition-colors"
          >
            Retry
          </button>
          <Link href="/" className="px-5 py-2 rounded-full border border-line bg-card text-ink font-sans font-semibold text-sm hover:bg-warm-2 transition-colors">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
