import { notFound } from "next/navigation";
import { AppShell } from "@/components/tfc/AppShell";
import { StartupCard } from "@/app/startups/StartupCard";
import { StartupItem } from "@/app/startups/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: col } = await admin
    .from("collections")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!col) return { title: "Collection — TFC Connect" };

  return {
    title: `${col.title} — Curated Campus Startups | TFC Connect`,
    description: col.description || `Browse student startups in ${col.title} on TFC Connect.`,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: collection } = await admin
    .from("collections")
    .select("id, title, slug, description, theme, sort_order")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!collection) {
    notFound();
  }

  // Fetch startup IDs in this collection
  const { data: items } = await admin
    .from("collection_items")
    .select("startup_id, position")
    .eq("collection_id", collection.id)
    .order("position", { ascending: true });

  const startupIds = (items || []).map((i) => i.startup_id);

  let startups: StartupItem[] = [];
  if (startupIds.length > 0) {
    const { data: rawStartups } = await admin
      .from("startups_trending")
      .select("*")
      .in("id", startupIds)
      .eq("is_hidden", false);

    const startupMap = new Map((rawStartups || []).map((s) => [s.id, s]));

    startups = startupIds
      .map((id) => startupMap.get(id))
      .filter(Boolean)
      .map((s) => ({
        id: s!.id!,
        slug: s!.slug!,
        name: s!.name!,
        logo_url: s!.logo_url,
        cover_url: s!.cover_url,
        one_liner: s!.one_liner || "",
        problem: s!.problem,
        solution: s!.solution,
        stage: (s!.stage as StartupItem["stage"]) || "idea",
        industry: s!.industry || "",
        city: s!.city,
        website: s!.website,
        demo_video_url: s!.demo_video_url,
        founded_year: s!.founded_year,
        metrics: (s!.metrics as unknown as StartupItem["metrics"]) || [],
        funding_raised: s!.funding_raised,
        status_tags: (s!.status_tags as string[]) || [],
        deck_path: s!.deck_path,
        verification_tier: (s!.verification_tier as StartupItem["verification_tier"]) || "unverified",
        claimed: s!.claimed ?? false,
        is_hidden: s!.is_hidden ?? false,
        created_by: s!.created_by,
        last_update_at: s!.last_update_at || s!.created_at || "",
        created_at: s!.created_at || "",
        updated_at: s!.updated_at || "",
        follows_count: s!.follows_count || 0,
        upvotes_count: s!.upvotes_count || 0,
        is_inactive: s!.is_inactive || false,
        trending_score: Number(s!.trending_score) || 0,
      }));
  }

  const getThemeClass = (theme: string) => {
    switch (theme) {
      case "forest":
        return "from-[#1F5A45] to-[#2C7D61]";
      case "amber":
        return "from-[#9A6412] to-[#C78726]";
      case "ink":
        return "from-[#1B1712] to-[#40372F]";
      case "ballpoint":
        return "from-[#2C4A9A] to-[#4A6EC9]";
      case "orange":
      default:
        return "from-[#E2542A] to-[#F27854]";
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/startups"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Startup Directory
        </Link>

        {/* Collection Hero Banner */}
        <div
          className={`rounded-3xl p-8 sm:p-12 text-white bg-gradient-to-br ${getThemeClass(
            collection.theme
          )} shadow-card relative overflow-hidden`}
        >
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 size-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="size-3" />
              Curated Collection
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="font-sans text-base text-white/90 leading-relaxed">
                {collection.description}
              </p>
            )}
            <p className="font-mono text-xs text-white/70 pt-2">
              {startups.length} {startups.length === 1 ? "venture" : "ventures"} featured
            </p>
          </div>
        </div>

        {/* Startups Grid or Empty State */}
        {startups.length === 0 ? (
          <div className="bg-card border border-line rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-card">
            <div className="size-12 rounded-full bg-warm border border-line text-ink-soft mx-auto flex items-center justify-center text-xl">
              📂
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-ink">
                No startups in this collection yet
              </h2>
              <p className="font-sans text-xs text-ink-soft">
                Check back soon or explore the full directory of campus ventures.
              </p>
            </div>
            <Link href="/startups">
              <Button variant="solid" size="sm">
                Explore All Startups
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {startups.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
