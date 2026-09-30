export const dynamic = "force-dynamic";

import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { StartupsDirectoryClient } from "./StartupsDirectoryClient";
import { CollectionItem, StartupItem } from "./types";

export const metadata: Metadata = {
  title: "Campus Startups Directory · TFC Connect",
  description:
    "Discover, support, and join top startups built by student founders across Delhi University, NSUT, DTU, SRCC, IIT Madras and beyond.",
  openGraph: {
    title: "Campus Startups Directory · TFC Connect",
    description:
      "Explore trending campus startups, open co-founder roles, and student ventures across India.",
    type: "website",
  },
};

export default async function StartupsPage() {
  let startups: StartupItem[] = [];
  let collections: CollectionItem[] = [];
  let collectionItemsMap: Record<string, string[]> = {};

  try {
    const supabase = await createClient();

    // 1. Fetch startups from startups_trending view
    const { data: rawStartups } = await supabase
      .from("startups_trending")
      .select("*")
      .eq("is_hidden", false)
      .order("trending_score", { ascending: false });

    // 2. Fetch published collections
    const { data: rawCollections } = await supabase
      .from("collections")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    // 3. Fetch collection items for filtering
    const { data: rawItems } = await supabase
      .from("collection_items")
      .select("collection_id, startup_id");

    collections = (rawCollections || []).map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      theme: c.theme as CollectionItem["theme"],
      is_published: c.is_published,
      sort_order: c.sort_order,
    }));

    // Build collectionSlug -> startupIds map
    const collectionIdToSlug = new Map(collections.map((c) => [c.id, c.slug]));
    const itemsMap: Record<string, string[]> = {};

    if (rawItems) {
      for (const item of rawItems) {
        const slug = collectionIdToSlug.get(item.collection_id);
        if (slug) {
          if (!itemsMap[slug]) itemsMap[slug] = [];
          itemsMap[slug].push(item.startup_id);
        }
      }
    }
    collectionItemsMap = itemsMap;

    // Parse startups data
    startups = (rawStartups || []).map((s) => ({
      id: s.id!,
      slug: s.slug!,
      name: s.name!,
      logo_url: s.logo_url,
      cover_url: s.cover_url,
      one_liner: s.one_liner || "",
      problem: s.problem,
      solution: s.solution,
      stage: (s.stage as StartupItem["stage"]) || "idea",
      industry: s.industry || "",
      city: s.city,
      website: s.website,
      demo_video_url: s.demo_video_url,
      founded_year: s.founded_year,
      metrics: (s.metrics as unknown as StartupItem["metrics"]) || [],
      funding_raised: s.funding_raised,
      status_tags: (s.status_tags as string[]) || [],
      deck_path: s.deck_path,
      verification_tier:
        (s.verification_tier as StartupItem["verification_tier"]) ||
        "unverified",
      claimed: s.claimed ?? false,
      is_hidden: s.is_hidden ?? false,
      created_by: s.created_by,
      last_update_at: s.last_update_at || s.created_at || "",
      created_at: s.created_at || "",
      updated_at: s.updated_at || "",
      follows_count: s.follows_count || 0,
      upvotes_count: s.upvotes_count || 0,
      is_inactive: s.is_inactive || false,
      trending_score: Number(s.trending_score) || 0,
    }));
  } catch (err) {
    // DB unavailable, view not yet migrated, or env vars missing — render empty state
    console.error("[TFC /startups] Data fetch failed:", err);
    // startups and collections remain empty — StartupsDirectoryClient shows empty state
  }

  return (
    <AppShell>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8">
        <StartupsDirectoryClient
          initialStartups={startups}
          collections={collections}
          collectionItemsMap={collectionItemsMap}
        />
      </div>
    </AppShell>
  );
}
