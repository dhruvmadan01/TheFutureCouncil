"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/match", label: "Co‑founder Match" },
  { href: "/startups", label: "Startups" },
  { href: "/#how-it-works", label: "How it works" },
];

export function LandingMobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="landing-mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="size-11 -mr-2 flex items-center justify-center rounded-xl text-ink hover:bg-warm-2 transition-colors focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <nav
          id="landing-mobile-menu"
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full border-b border-line bg-card shadow-sm"
        >
          <ul className="px-4 py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center font-sans text-base font-medium text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {!signedIn && (
              <li>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center font-sans text-base font-medium text-ink-soft"
                >
                  Log in
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
