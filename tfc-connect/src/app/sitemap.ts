import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://connect.thefuturecouncil.in";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/startups`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const supabase = await createClient();
    const { data: startups } = await supabase
      .from("startups")
      .select("slug, updated_at")
      .eq("is_hidden", false)
      .limit(500);

    const startupRoutes: MetadataRoute.Sitemap = (startups || [])
      .filter((s) => s.slug)
      .map((s) => ({
        url: `${base}/startups/${s.slug}`,
        lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...startupRoutes];
  } catch {
    return staticRoutes;
  }
}
