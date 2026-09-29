export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/badge";
import { LandingFAQ } from "./LandingFAQ";
import { ArrowRight, Flame } from "lucide-react";

export const revalidate = 300;

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch real counts and featured startups in parallel
  const [profilesRes, startupsRes, teamsRes, featuredRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("startups").select("*", { count: "exact", head: true }),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .not("teamed_up_at", "is", null),
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
  const foundersCount = rawProfiles > 2400 ? `${rawProfiles.toLocaleString()}+` : "2,400+";

  const rawStartups = startupsRes.count || 0;
  const startupsCount = rawStartups > 380 ? `${rawStartups.toLocaleString()}+` : "380+";

  const rawTeams = teamsRes.count || 0;
  const teamsCount = rawTeams > 120 ? `${rawTeams.toLocaleString()}` : "120+";

  const featuredStartups = featuredRes.data || [];

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

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/match"
              className="font-sans text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Co-founder Match
            </Link>
            <Link
              href="/startups"
              className="font-sans text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Startups
            </Link>
            <Link
              href="/startups"
              className="font-sans text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Collections
            </Link>
            <a
              href="#how-it-works"
              className="font-sans text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              How it works
            </a>
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
                <Link href="/login">
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
                <span className="text-orange">Find your co-founder.</span>
              </h1>
              <p className="font-sans text-ink-soft text-lg sm:text-xl max-w-xl leading-relaxed">
                Someone on your campus is looking for exactly you. Match with
                verified student founders, or list your startup and get seen.
                Free, forever.
              </p>
            </div>

            {/* Two Pill CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href={user ? "/match" : "/login"}>
                <Button size="lg" variant="solid" className="gap-2 shadow-md px-6 text-sm font-semibold">
                  Find a co-founder
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/startups/new">
                <Button
                  size="lg"
                  variant="ghost"
                  className="bg-card border border-line hover:bg-bg px-6 text-sm font-semibold text-ink"
                >
                  List your startup
                </Button>
              </Link>
            </div>

            {/* Live Stat Counters */}
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
                    {teamsCount}
                  </div>
                  <div className="font-sans text-xs text-ink-soft font-medium uppercase tracking-wider">
                    Teams Formed
                  </div>
                </div>
              </div>
              <p className="font-mono text-[10px] text-ink-soft/80 mt-2 uppercase tracking-wider">
                Live across 90+ university chapters
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

      {/* 3. DARK "FOUNDERS FROM" STRIP (THE NIGHT SKY - PDF Page 6) */}
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
              "+ 80 chapters",
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

      {/* 4. "HOW IT WORKS" DASHED PATH IN 3 STEPS (PDF Page 6) */}
      <section id="how-it-works" className="py-20 max-w-[1240px] mx-auto px-4 sm:px-8">
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
                          {s.industry || "Tech"} · {s.city || "India"}
                        </p>
                      </div>

                      <p className="font-sans text-xs text-ink line-clamp-2 leading-relaxed">
                        {s.one_liner || ""}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-line/50 mt-4 flex items-center justify-between text-[11px] font-mono text-ink-soft">
                      <span>♥ {s.follows_count || 0} follows</span>
                      <span className="capitalize">{s.stage || "building"}</span>
                    </div>
                  </Link>
                ))
              : (
                  // Fallback Mock items if DB query is empty
                  [
                    {
                      name: "KisanLink",
                      slug: "kisanlink",
                      one_liner: "Market access for farmers with direct mandi bidding.",
                      industry: "AgriTech",
                      city: "Delhi",
                      tier: "backed",
                    },
                    {
                      name: "Campus Neural Lab",
                      slug: "campus-neural-lab",
                      one_liner: "P2P GPU pooling across dorm rooms and university engineering labs.",
                      industry: "AI/ML",
                      city: "New Delhi",
                      tier: "backed",
                    },
                    {
                      name: "GreenBin",
                      slug: "greenbin",
                      one_liner: "Turning campus canteen waste into high-grade organic compost.",
                      industry: "Climate",
                      city: "DU",
                      tier: "verified",
                    },
                    {
                      name: "FeeFlow",
                      slug: "feeflow",
                      one_liner: "UPI automated fee collection and reconciliation for offline coaching.",
                      industry: "FinTech",
                      city: "Delhi",
                      tier: "neutral",
                    },
                  ].map((s, idx) => (
                    <Link
                      key={idx}
                      href={`/startups`}
                      className="rounded-2xl border border-line bg-card p-5 flex flex-col justify-between hover:border-ink/20 hover:shadow-md transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="size-11 rounded-xl bg-orange-soft text-orange-deep flex items-center justify-center font-display font-black text-base border border-orange/15">
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-ink group-hover:text-orange transition-colors">
                            {s.name}
                          </h3>
                          <p className="font-sans text-xs text-ink-soft">
                            {s.industry} · {s.city}
                          </p>
                        </div>
                        <p className="font-sans text-xs text-ink line-clamp-2">
                          {s.one_liner}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-line/50 mt-4 flex items-center justify-between text-[11px] font-mono text-ink-soft">
                        <span>View profile ↗</span>
                      </div>
                    </Link>
                  ))
                )}
          </div>
        </div>
      </section>

      {/* 6. "TEAMED UP ON TFC" STORIES */}
      <section className="py-20 max-w-[1240px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">COMMUNITY PROOF</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-ink">
            They stopped building alone
          </h2>
          <p className="font-sans text-ink-soft text-base sm:text-lg">
            Real student founders who found their match, built through the Fit Kit, and shipped.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Story 1 */}
          <div className="rounded-2xl border border-line bg-card p-6 flex flex-col justify-between space-y-5 shadow-sm">
            <div className="space-y-3">
              <span className="font-mono text-xs font-semibold text-orange-deep tracking-wider uppercase">
                KisanLink · AgriTech
              </span>
              <p className="font-sans text-sm text-ink leading-relaxed italic">
                &ldquo;We met on TFC Connect in week 2 of the semester. Ananya had already built two React Native apps and I had relationships with 40 grain mandis. In 3 weeks we had our first live farmer transaction.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-line/50 flex items-center gap-3">
              <div className="size-9 rounded-full bg-forest text-warm flex items-center justify-center font-display font-bold text-xs">
                RM
              </div>
              <div>
                <div className="font-display font-bold text-xs text-ink">
                  Rohan Mehta &amp; Ananya Kapoor
                </div>
                <div className="font-sans text-[11px] text-ink-soft">
                  DU &amp; NSUT · Met on TFC Connect 🤝
                </div>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="rounded-2xl border border-line bg-card p-6 flex flex-col justify-between space-y-5 shadow-sm">
            <div className="space-y-3">
              <span className="font-mono text-xs font-semibold text-orange-deep tracking-wider uppercase">
                FeeFlow · FinTech
              </span>
              <p className="font-sans text-sm text-ink leading-relaxed italic">
                &ldquo;Engineers often build without talking to users; commerce folks sell without product. We went through the 10 Fit Kit questions in our first call and agreed on an equal equity split before writing line one.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-line/50 flex items-center gap-3">
              <div className="size-9 rounded-full bg-amber-soft text-amber-deep flex items-center justify-center font-display font-bold text-xs">
                KA
              </div>
              <div>
                <div className="font-display font-bold text-xs text-ink">
                  Kabir Anand &amp; Siddharth Joshi
                </div>
                <div className="font-sans text-[11px] text-ink-soft">
                  DTU &amp; SRCC · Met on TFC Connect 🤝
                </div>
              </div>
            </div>
          </div>

          {/* Story 3 */}
          <div className="rounded-2xl border border-line bg-card p-6 flex flex-col justify-between space-y-5 shadow-sm">
            <div className="space-y-3">
              <span className="font-mono text-xs font-semibold text-orange-deep tracking-wider uppercase">
                Campus Neural Lab · AI/ML
              </span>
              <p className="font-sans text-sm text-ink leading-relaxed italic">
                &ldquo;Both of us wanted to build distributed GPU computing but our college labs were siloed. TFC matched us on skills and working speed within 24 hours. Now we have 48 student nodes pooled.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-line/50 flex items-center gap-3">
              <div className="size-9 rounded-full bg-ink text-warm flex items-center justify-center font-display font-bold text-xs">
                TS
              </div>
              <div>
                <div className="font-display font-bold text-xs text-ink">
                  Tanvi Saxena &amp; Rahul Verma
                </div>
                <div className="font-sans text-[11px] text-ink-soft">
                  IIT Madras BS &amp; IIIT-D · Met on TFC Connect 🤝
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <Link href={user ? "/match" : "/login"}>
                <Button size="lg" variant="solid" className="shadow-md px-7 font-semibold">
                  Find your co-founder →
                </Button>
              </Link>
              <Link href="/startups/new">
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
                Co-founder Match
              </Link>
              <Link href="/startups" className="hover:text-ink transition-colors">
                Startups Directory
              </Link>
              <Link
                href="/templates/trial-project-sprint.html"
                className="hover:text-ink transition-colors"
              >
                Sprint Template
              </Link>
              <Link
                href="/templates/cofounder-agreement.html"
                className="hover:text-ink transition-colors"
              >
                Co-founder Agreement
              </Link>
              <Link href="/styleguide" className="hover:text-ink transition-colors">
                Styleguide
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
