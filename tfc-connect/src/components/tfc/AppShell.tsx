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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    // Listen for auth state changes client-side
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch profile
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
  }, [supabase]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      {/* Desktop Top Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="TFC Logo"
                width={28}
                height={28}
                className="rounded-[6px] shadow-xs group-hover:scale-105 transition-transform"
              />
              <span className="font-display text-xl font-extrabold tracking-tight text-ink">
                TFC Connect
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
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
          <div className="flex items-center gap-3">
            {/* List your startup CTA */}
            <Link href="/startups/new">
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
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName || "User"}
                      width={32}
                      height={32}
                      className="rounded-full size-8 object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-forest text-white font-display font-bold text-xs flex items-center justify-center">
                      {initials}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-sans font-medium text-ink pr-1">
                    {user.fullName || "My account"}
                  </span>
                  <ChevronDown className="size-3.5 text-mute" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-line shadow-[0_10px_30px_-18px_rgb(27_23_18_/_0.2)] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
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
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans text-ink hover:bg-warm-2 transition-colors"
                      >
                        <User className="size-4 text-mute" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/requests"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans text-ink hover:bg-warm-2 transition-colors"
                      >
                        <UserCheck className="size-4 text-mute" />
                        <span>Connection Requests</span>
                      </Link>

                      <Link
                        href="/styleguide"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans text-ink hover:bg-warm-2 transition-colors"
                      >
                        <Sparkles className="size-4 text-orange" />
                        <span>Design Styleguide</span>
                      </Link>
                    </div>

                    <div className="border-t border-line/60 mt-1 pt-1">
                      <form action="/auth/signout" method="POST">
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans text-plum hover:bg-plum-soft transition-colors text-left"
                        >
                          <LogOut className="size-4 text-plum" />
                          <span>Sign out</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-sans font-medium text-ink-soft hover:text-ink px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link href="/login">
                  <Button size="sm" variant="dark">
                    Join free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content (adds padding-bottom on mobile so content clears the fixed bottom tab bar) */}
      <main className="flex-1 pb-20 md:pb-8">{children}</main>

      {/* Mobile Bottom Tab Bar (64px / h-16) */}
      <nav
        aria-label="Mobile Bottom Navigation"
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
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
                isActive
                  ? "text-orange font-semibold"
                  : "text-mute hover:text-ink-soft"
              }`}
            >
              <Icon className={`size-5 mb-0.5 ${isActive ? "text-orange stroke-[2.5]" : "text-mute"}`} />
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
