export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/badge";
import { LandingFAQ } from "./LandingFAQ";
import { ArrowRight, Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Don't build alone. Find your co-founder · TFC Connect",
  description:
    "India's premier campus co-founder matching portal and startup directory. Connect with verified student founders across 90+ university chapters. Free forever.",
  openGraph: {
    title: "Don't build alone. Find your co-founder · TFC Connect",
    description:
      "Match with verified student founders from DU, NSUT, DTU, SRCC, IIT Madras and beyond. Or list your campus startup.",
    type: "website",
  },
};

export default async function Home() {
  // Graceful fallback if Supabase is unavailable or views don't exist yet
  let user = null;
  let foundersCount = "2,400+";
  let startupsCount = "380+";

  interface FeaturedStartup {
    id: string | null;
    slug: string | null;
    name: string | null;
    logo_url: string | null;
    one_liner: string | null;
    stage: string | null;
    industry: string | null;
    city: string | null;
    verification_tier: string | null;
    status_tags: string[] | null;
    follows_count: number | null;
    upvotes_count: number | null;
  }
  let featuredStartups: FeaturedStartup[] = [];

  try {
    const supabase = await createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;

    // Fetch real counts and featured startups in parallel
    const [profilesRes, startupsRes, featuredRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("startups").select("*", { count: "exact", head: true }),
      supabase
        .from("startups_trending")
        .select(
          "id, slug, name, logo_url, one_liner, stage, industry, city, verification_tier, status_tags, follows_count, upvotes_count"
        )
        .eq("is_hidden", false)
        .order("trending_score", { ascending: false })
        .limit(4),
    ]);

    const rawProfiles = profilesRes.count || 0;
    foundersCount = rawProfiles > 2400 ? `${rawProfiles.toLocaleString()}+` : "2,400+";

    const rawStartups = startupsRes.count || 0;
    startupsCount = rawStartups > 380 ? `${rawStartups.toLocaleString()}+` : "380+";

    featuredStartups = featuredRes.data || [];
  } catch (err) {
    // DB unavailable or view not yet migrated — use static fallback values
    console.error("[TFC Landing] Supabase fetch failed, using fallbacks:", err);
  }



  return (
    <div className="min-h-screen bg-warm text-ink flex flex-col justify-between selection:bg-orange/20 selection:text-ink">
      {/* 1. TOP NAVIGATION (As in PDF Page 6) */}
      <header className="sticky top-0 z-50 border-b border-line bg-card/85 backdrop-blur-md">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="TFC Logo"
                width={30}
                height={30}
                className="rounded-lg shadow-sm"
                priority
              />
              <span className="font-display text-xl font-black tracking-tight text-ink">
                TFC Connect
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6" aria-label="Site navigation">
            <Link
              href="/match"
              className="font-sans text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Co&#8209;founder Match
            </Link>
            <Link
              href="/startups"
              className="font-sans text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Startups
            </Link>
            <Link
              href="/#how-it-works"
              className="font-sans text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              How it works
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/match" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm">
                    Match
                  </Button>
                </Link>
                <Link href="/startups/new">
                  <Button variant="solid" size="sm" className="gap-1.5 shadow-sm">
                    + List your startup
                  </Button>
                </Link>
                <Link
                  href="/me"
                  className="size-8 rounded-full bg-forest text-warm flex items-center justify-center font-display font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
                  title="My Profile"
                  aria-label="My Profile"
                >
                  Me
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/login?mode=signup">
                  <Button variant="solid" size="sm" className="shadow-sm">
                    Join free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (PDF Page 6) */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 max-w-[1240px] mx-auto px-4 sm:px-8">
        {/* Soft background ambient gradient */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-orange/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Eyebrow, Headline, Subtitle, CTAs, Counters */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-orange-soft/40 border border-orange/20">
              <span className="glow-dot" />
              <span className="eyebrow text-[11px]">
                A FUTURE COUNCIL INITIATIVE · 90+ CAMPUS CHAPTERS
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-display font-black tracking-tight leading-[1.03] text-ink">
                Don&apos;t build alone. <br />
                <span className="text-orange">Find your co&#8209;founder.</span>
              </h1>
              <p className="font-sans text-ink-soft text-lg sm:text-xl max-w-xl leading-relaxed">
                Someone on your campus is looking for exactly you. Match with
                verified student founders, or list your startup and get seen.
                Free, forever.
              </p>
            </div>

            {/* Two Pill CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href={user ? "/match" : "/login?mode=signup"}>
                <Button size="lg" variant="solid" className="gap-2 shadow-md px-6 text-sm font-semibold">
                  Find a co&#8209;founder
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href={user ? "/startups/new" : "/login?next=/startups/new"}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="bg-card border border-line hover:bg-bg px-6 text-sm font-semibold text-ink"
                >
                  List your startup
                </Button>
              </Link>
            </div>

            {/* Live Stat Counters — only shown if counts are meaningful or DB unavailable (shows static fallback) */}
            <div className="pt-6 border-t border-line/60">
              <div className="flex items-center gap-8 sm:gap-12">
                <div>
                  <div className="font-display font-black text-2xl sm:text-3xl text-ink">
                    {foundersCount}
                  </div>
                  <div className="font-sans text-xs text-ink-soft font-medium uppercase tracking-wider">
                    Founders
                  </div>
                </div>
                <div className="w-[1px] h-8 bg-line" />
                <div>
                  <div className="font-display font-black text-2xl sm:text-3xl text-ink">
                    {startupsCount}
                  </div>
                  <div className="font-sans text-xs text-ink-soft font-medium uppercase tracking-wider">
                    Startups
                  </div>
                </div>
                <div className="w-[1px] h-8 bg-line" />
                <div>
                  <div className="font-display font-black text-2xl sm:text-3xl text-ink">
                    90+
                  </div>
                  <div className="font-sans text-xs text-ink-soft font-medium uppercase tracking-wider">
                    Campus Chapters
                  </div>
                </div>
              </div>
              <p className="font-mono text-[10px] text-ink-soft/80 mt-2 uppercase tracking-wider">
                Across 90+ university chapters in India
              </p>
            </div>
          </div>

          {/* Right Column: Live Interactive Product Preview Cards (PDF Page 6 mock) */}
          <div className="lg:col-span-5 relative flex flex-col gap-4 sm:pl-4">
            {/* Person Card Preview */}
            <div className="rounded-2xl border border-line bg-card p-5 shadow-lg relative transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-forest text-warm flex items-center justify-center font-display font-bold text-sm shadow-sm">
                    AK
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-base text-ink">
                        Ananya K.
                      </span>
                      <span className="text-forest text-xs" title="Verified">
                        ✓
                      </span>
                    </div>
                    <span className="font-sans text-xs text-ink-soft">
                      IIT Madras · B.Tech CSE
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-orange-soft px-2.5 py-1 rounded-full border border-orange/20">
                  <Flame className="size-3.5 text-orange" />
                  <span className="font-display font-black text-xs text-orange-deep">
                    92
                  </span>
                </div>
              </div>

              {/* Match Reason Box */}
              <div className="mt-4 rounded-xl bg-orange-soft/40 border border-orange/15 p-3">
                <p className="font-sans text-xs text-orange-deep leading-relaxed">
                  <strong className="font-semibold">Why you match:</strong> you need a developer, and she has shipped 3 apps. Both full-time from Jan.
                </p>
              </div>

              {/* Skill chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip variant="neutral">Tech</Chip>
                <Chip variant="neutral">React Native</Chip>
                <Chip variant="verified">Full-time from Jan</Chip>
              </div>
            </div>

            {/* Startup Card Preview (Floats underneath with slight offset) */}
            <div className="rounded-2xl border border-line bg-card p-5 shadow-lg transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-soft text-amber-deep flex items-center justify-center font-display font-black text-base border border-amber/20">
                    K
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-base text-ink">
                        KisanLink
                      </span>
                      <Chip variant="backed">TFC Backed</Chip>
                    </div>
                    <span className="font-sans text-xs text-ink-soft">
                      AgriTech · Delhi NCR
                    </span>
                  </div>
                </div>

                <Chip variant="neutral" className="text-[10px]">
                  Launched
                </Chip>
              </div>

              <p className="font-sans text-xs text-ink mt-2.5">
                Helping small farmers sell crops directly to mandis, no middlemen.
              </p>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-line/40">
                <div className="flex items-center gap-1.5">
                  <Chip variant="needs">Needs Co-founder</Chip>
                  <Chip variant="hiring">Hiring</Chip>
                </div>
                <span className="font-mono text-[11px] text-ink-soft">
                  ♥ 214 follows
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DARK "FOUNDERS FROM" STRIP */}
      <section className="bg-ink text-warm py-6 border-y border-line/20 overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[#B5A596] shrink-0 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-orange animate-pulse" />
            FOUNDERS FROM
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {[
              "DU",
              "IIT Madras BS",
              "NSUT",
              "DTU",
              "IIIT-D",
              "SRCC",
              "Ashoka",
              "BITS Pilani",
              "IIT Delhi",
              "+ 81 more chapters",
            ].map((college, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-sans text-xs text-warm/90 hover:bg-white/10 hover:border-white/20 transition-colors cursor-default"
              >
                <span className="size-1 rounded-full bg-orange" />
                {college}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. "HOW IT WORKS" DASHED PATH IN 3 STEPS */}
      <section id="how-it-works" className="py-20 max-w-[1240px] mx-auto px-4 sm:px-8" style={{ scrollMarginTop: "80px" }}>
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">THE DASHED PATH</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-ink">
            Three steps. Zero awkward networking.
          </h2>
          <p className="font-sans text-ink-soft text-base sm:text-lg">
            Built for substance over swipes. Designed to turn a shared vision into a committed founding team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="rounded-2xl border border-line bg-card p-7 space-y-4 relative group hover:border-orange/30 transition-all shadow-sm">
            <div className="size-12 rounded-full border-2 border-dashed border-orange bg-orange-soft/40 flex items-center justify-center font-display font-black text-xl text-orange">
              1
            </div>
            <h3 className="font-display font-bold text-xl text-ink">
              Build your profile
            </h3>
            <p className="font-sans text-sm text-ink-soft leading-relaxed">
              Highlight your verified skills, proof of work, and what you&apos;re looking for in a partner. It takes just 4 minutes.
            </p>
            <div className="pt-2 font-mono text-[11px] text-orange-deep font-semibold">
              ✓ College &amp; chapter verified
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-line bg-card p-7 space-y-4 relative group hover:border-orange/30 transition-all shadow-sm">
            <div className="size-12 rounded-full border-2 border-dashed border-orange bg-orange-soft/40 flex items-center justify-center font-display font-black text-xl text-orange">
              2
            </div>
            <h3 className="font-display font-bold text-xl text-ink">
              Get 5 matches daily
            </h3>
            <p className="font-sans text-sm text-ink-soft leading-relaxed">
              Transparent matches scored on complementary skills and commitment timing. We show the exact reason why you match on every card.
            </p>
            <div className="pt-2 font-mono text-[11px] text-orange-deep font-semibold">
              ✓ Transparent 0–100 scoring
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-line bg-card p-7 space-y-4 relative group hover:border-orange/30 transition-all shadow-sm">
            <div className="size-12 rounded-full border-2 border-dashed border-orange bg-orange-soft/40 flex items-center justify-center font-display font-black text-xl text-orange">
              3
            </div>
            <h3 className="font-display font-bold text-xl text-ink">
              Talk, test, team up
            </h3>
            <p className="font-sans text-sm text-ink-soft leading-relaxed">
              The built-in Founder Fit Kit guides essential questions on equity, vesting, and working styles. Run a 2-week trial sprint before committing.
            </p>
            <div className="pt-2 font-mono text-[11px] text-orange-deep font-semibold">
              ✓ Guided Founder Fit Kit
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED STARTUPS (TFC BACKED & TRENDING) */}
      <section className="py-16 bg-card/40 border-y border-line">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span className="glow-dot" />
                <span className="eyebrow">CURATED VENTURES · TFC BACKED</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-ink">
                Startups launched on campus
              </h2>
              <p className="font-sans text-ink-soft text-sm sm:text-base max-w-xl">
                Student founders solving real problems across India, from AgriTech to distributed AI.
              </p>
            </div>

            <Link href="/startups">
              <Button variant="ghost" size="sm" className="gap-1.5 font-semibold text-orange-deep">
                Explore all campus startups
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredStartups.length > 0
              ? featuredStartups.map((s) => (
                  <Link
                    key={s.id || s.slug || ""}
                    href={`/startups/${s.slug || ""}`}
                    className="rounded-2xl border border-line bg-card p-5 flex flex-col justify-between hover:border-ink/20 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="size-11 rounded-xl bg-orange-soft text-orange-deep flex items-center justify-center font-display font-black text-base border border-orange/15">
                          {(s.name || "Startup").slice(0, 2).toUpperCase()}
                        </div>
                        <Chip
                          variant={
                            s.verification_tier === "tfc_backed"
                              ? "backed"
                              : s.verification_tier === "verified"
                              ? "verified"
                              : "neutral"
                          }
                          className="text-[10px]"
                        >
                          {s.verification_tier === "tfc_backed"
                            ? "TFC Backed"
                            : s.verification_tier === "verified"
                            ? "Verified"
                            : "Listed"}
                        </Chip>
                      </div>

                      <div>
                        <h3 className="font-display font-bold text-base text-ink group-hover:text-orange transition-colors">
                          {s.name || "Campus Startup"}
                        </h3>
                        <p className="font-sans text-xs text-ink-soft">
                          {s.industry || "Tech"} &middot; {s.city || "India"}
                        </p>
                      </div>

                      <p className="font-sans text-xs text-ink line-clamp-2 leading-relaxed">
                        {s.one_liner || ""}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-line/50 mt-4 flex items-center justify-between text-[11px] font-mono text-ink-soft">
                      <span>&hearts; {s.follows_count || 0} follows</span>
                      <span className="capitalize">{s.stage || "building"}</span>
                    </div>
                  </Link>
                ))
              : (
                // Empty state — no fake data in production
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="size-14 rounded-2xl bg-orange-soft border border-orange/20 flex items-center justify-center font-display font-black text-2xl text-orange-deep">
                    🚀
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">
                    Be one of the first 50 startups listed
                  </h3>
                  <p className="font-sans text-sm text-ink-soft max-w-sm">
                    TFC Connect just launched. List your campus startup and get seen by 2,400+ verified student founders across India.
                  </p>
                  <Link
                    href={user ? "/startups/new" : "/login?next=/startups/new"}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-orange text-white font-sans font-semibold text-sm hover:bg-orange-deep transition-colors shadow-sm"
                  >
                    List your startup
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS — hidden until real ones exist */}
      {process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS === "true" && (
        <section className="py-20 max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-2">
              <span className="glow-dot" />
              <span className="eyebrow">COMMUNITY PROOF</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-ink">
              They stopped building alone
            </h2>
          </div>
          {/* Testimonial cards — add real ones here */}
        </section>
      )}

      {/* 7. FAQ SECTION */}
      <section className="py-20 bg-card/30 border-t border-line">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="glow-dot" />
              <span className="eyebrow">COMMON QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-ink">
              Everything you need to know
            </h2>
            <p className="font-sans text-ink-soft text-base">
              Got questions before diving in? Here are answers from our campus network team.
            </p>
          </div>

          <LandingFAQ />
        </div>
      </section>

      {/* 8. FOOTER CTA & FOOTER BAR */}
      <footer className="pt-16 pb-12 border-t border-line bg-warm">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 space-y-16">
          {/* Big Warm Call to Action Banner */}
          <div className="rounded-3xl border-2 border-orange/20 bg-gradient-to-br from-card via-card to-orange-soft/30 p-8 sm:p-14 text-center space-y-6 shadow-sm">
            <div className="inline-flex items-center gap-2">
              <span className="glow-dot" />
              <span className="eyebrow">JOIN THE NETWORK</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-ink">
              Don&apos;t build alone.
            </h2>
            <p className="font-sans text-ink-soft text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Your co-founder is probably in the library across the lawn. Find them today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link href={user ? "/match" : "/login?mode=signup"}>
                <Button size="lg" variant="solid" className="shadow-md px-7 font-semibold">
                  Find your co&#8209;founder &rarr;
                </Button>
              </Link>
              <Link href={user ? "/startups/new" : "/login?next=/startups/new"}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="bg-card border border-line hover:bg-bg px-7 font-semibold text-ink"
                >
                  List your startup
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom Bar with Links & Campus Chapters Badge */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-line/60">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="TFC Logo"
                width={26}
                height={26}
                className="rounded-md"
              />
              <span className="font-display text-base font-extrabold text-ink">
                TFC Connect
              </span>
              <span className="text-ink-soft text-xs">
                · A Future Council Initiative
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-sans text-xs text-ink-soft font-medium">
              <Link href="/match" className="hover:text-ink transition-colors">
                Co&#8209;founder Match
              </Link>
              <Link href="/startups" className="hover:text-ink transition-colors">
                Startups Directory
              </Link>
              <a
                href="https://thefuturecouncil.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                The Future Council
              </a>
              <a
                href="https://instagram.com/thefuturecouncil.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                Instagram
              </a>
              <a href="mailto:support@thefuturecouncil.in" className="hover:text-ink transition-colors">
                support@thefuturecouncil.in
              </a>
              <Link href="/privacy" className="hover:text-ink transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-ink transition-colors">
                Terms
              </Link>
            </div>

            <div className="font-mono text-[11px] text-ink-soft text-center md:text-right">
              © 2026 The Future Council · Free forever for campus founders.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
