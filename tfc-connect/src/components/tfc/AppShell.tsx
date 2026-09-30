"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Compass,
  MessageSquare,
  User,
  Plus,
  LogOut,
  ChevronDown,
  UserCheck,
  Menu,
  X,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export function AppShell({ children, user: initialUser }: AppShellProps) {
  const pathname = usePathname();
  const [user, setUser] = useState(initialUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    // Listen for auth state changes client-side
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: profile?.full_name || session.user.user_metadata?.full_name || "Builder",
          avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { label: "Match", href: "/match", icon: Sparkles },
    { label: "Startups", href: "/startups", icon: Compass },
    { label: "Messages", href: "/messages", icon: MessageSquare },
  ];

  const mobileTabs = [
    { label: "Match", href: "/match", icon: Sparkles },
    { label: "Startups", href: "/startups", icon: Compass },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Me", href: "/me", icon: User },
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ME";

  return (
    <div className="min-h-screen bg-warm text-ink flex flex-col justify-between">
      {/* Desktop + Mobile Top Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="TFC Connect Logo"
                width={28}
                height={28}
                className="rounded-[6px] shadow-xs group-hover:scale-105 transition-transform"
              />
              <span className="font-display text-xl font-extrabold tracking-tight text-ink">
                TFC Connect
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
                      isActive
                        ? "bg-warm-2 text-ink font-semibold"
                        : "text-ink-soft hover:text-ink hover:bg-warm/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* List your startup CTA — redirects to login if not authed */}
            <Link href={user ? "/startups/new" : "/login?next=/startups/new"}>
              <Button
                size="sm"
                variant="solid"
                className="hidden sm:inline-flex gap-1.5 shadow-xs"
              >
                <Plus className="size-4 stroke-[2.5]" />
                List your startup
              </Button>
            </Link>

            {/* User Avatar Menu or Sign In */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-warm-2 transition-colors border border-line/60 focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
                  aria-label="User account menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName || "User avatar"}
                      width={32}
                      height={32}
                      className="rounded-full size-8 object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-forest text-white font-display font-bold text-xs flex items-center justify-center" aria-hidden="true">
                      {initials}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-sans font-medium text-ink pr-1">
                    {user.fullName || "My account"}
                  </span>
                  <ChevronDown className="size-3.5 text-mute" aria-hidden="true" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-line shadow-[0_10px_30px_-18px_rgb(27_23_18_/_0.2)] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
                  >
                    <div className="px-3 py-2 border-b border-line/60 mb-1">
                      <p className="font-display font-bold text-sm text-ink truncate">
                        {user.fullName || "Builder"}
                      </p>
                      <p className="font-mono text-[11px] text-mute truncate">
                        {user.email || ""}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/me"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans text-ink hover:bg-warm-2 transition-colors"
                      >
                        <User className="size-4 text-mute" aria-hidden="true" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/requests"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans text-ink hover:bg-warm-2 transition-colors"
                      >
                        <UserCheck className="size-4 text-mute" aria-hidden="true" />
                        <span>Connection Requests</span>
                      </Link>
                    </div>

                    <div className="border-t border-line/60 mt-1 pt-1">
                      <form action="/auth/signout" method="POST">
                        <button
                          type="submit"
                          role="menuitem"
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans text-plum hover:bg-plum-soft transition-colors text-left"
                        >
                          <LogOut className="size-4 text-plum" aria-hidden="true" />
                          <span>Sign out</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-sans font-medium text-ink-soft hover:text-ink px-3 py-1.5 transition-colors"
                >
                  Log in
                </Link>
                <Link href="/login?mode=signup">
                  <Button size="sm" variant="dark">
                    Join free
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger — visible on sm and below */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-warm-2 transition-colors focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
            >
              {mobileMenuOpen
                ? <X className="size-5 text-ink" aria-hidden="true" />
                : <Menu className="size-5 text-ink" aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            ref={mobileMenuRef}
            className="md:hidden border-t border-line bg-card animate-in slide-in-from-top-2 duration-150"
          >
            <nav aria-label="Mobile navigation" className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-colors min-h-[44px] ${
                      isActive
                        ? "bg-warm-2 text-ink font-semibold"
                        : "text-ink-soft hover:text-ink hover:bg-warm-2"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}

              <Link
                href={user ? "/startups/new" : "/login?next=/startups/new"}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium text-orange-deep hover:bg-orange-soft/40 transition-colors min-h-[44px]"
              >
                <Plus className="size-4 shrink-0" aria-hidden="true" />
                List your startup
              </Link>

              <div className="border-t border-line/60 pt-3 mt-3 space-y-1">
                {user ? (
                  <>
                    <Link
                      href="/me"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans text-ink hover:bg-warm-2 transition-colors min-h-[44px]"
                    >
                      <User className="size-4 shrink-0" aria-hidden="true" />
                      My Profile
                    </Link>
                    <Link
                      href="/requests"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans text-ink hover:bg-warm-2 transition-colors min-h-[44px]"
                    >
                      <UserCheck className="size-4 shrink-0" aria-hidden="true" />
                      Requests
                    </Link>
                    <form action="/auth/signout" method="POST">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans text-plum hover:bg-plum-soft transition-colors min-h-[44px]"
                      >
                        <LogOut className="size-4 shrink-0" aria-hidden="true" />
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center gap-3 px-1">
                    <Link href="/login" className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/login?mode=signup" className="flex-1">
                      <Button variant="solid" size="sm" className="w-full">
                        Join free
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 pb-20 md:pb-8">{children}</main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-card/95 backdrop-blur-md border-t border-line z-40 flex items-center justify-around px-2"
      >
        {mobileTabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
                isActive
                  ? "text-orange font-semibold"
                  : "text-mute hover:text-ink-soft"
              }`}
            >
              <Icon className={`size-5 mb-0.5 ${isActive ? "text-orange stroke-[2.5]" : "text-mute"}`} aria-hidden="true" />
              <span className="text-[11px] font-sans tracking-tight">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
