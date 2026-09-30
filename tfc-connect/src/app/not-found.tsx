import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found · TFC Connect",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm text-ink flex flex-col justify-between">
      <header className="border-b border-line bg-card/80 backdrop-blur-sm px-6 py-4 flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="TFC Connect" width={26} height={26} className="rounded-md" />
          <span className="font-display font-extrabold text-lg text-ink">TFC Connect</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md text-center space-y-6">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-orange-deep">
            404 · Not found
          </div>
          <h1 className="font-display text-5xl font-black text-ink tracking-tight">
            This page doesn&apos;t exist.
          </h1>
          <p className="font-sans text-ink-soft text-base leading-relaxed">
            The link might have moved, been deleted, or was never there. Try the homepage or the startup directory.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-orange text-white font-sans font-semibold text-sm hover:bg-orange-deep transition-colors shadow-sm"
            >
              Go home
            </Link>
            <Link
              href="/startups"
              className="px-6 py-2.5 rounded-full border border-line bg-card text-ink font-sans font-semibold text-sm hover:bg-warm-2 transition-colors"
            >
              Browse startups
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-line px-6 py-5 text-center">
        <p className="font-mono text-[11px] text-mute">
          © 2026 The Future Council · <Link href="https://thefuturecouncil.in" className="hover:text-ink">thefuturecouncil.in</Link>
        </p>
      </footer>
    </div>
  );
}
