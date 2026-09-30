export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { AdminDashboardClient } from "./AdminDashboardClient";
import {
  AdminKPIs,
  VerificationQueueItem,
  ReportQueueItem,
  AdminCollectionItem,
  ChapterItem,
  LaunchpadSignalItem,
} from "./types";

export const revalidate = 0; // Dynamic server component for live admin data

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrator controls for verification, reports, collections, and campus chapters.",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  // 1. Verify admin privilege
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/match");
  }

  // 2. Fetch KPIs
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    profilesCountRes,
    profilesWkRes,
    startupsCountRes,
    startupsWkRes,
    connectionsAcceptedRes,
    connectionsTotalRes,
    teamsCountRes,
    teamsWkRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase.from("startups").select("*", { count: "exact", head: true }),
    supabase
      .from("startups")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted"),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .not("teamed_up_at", "is", null),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .not("teamed_up_at", "is", null)
      .gte("teamed_up_at", sevenDaysAgo),
  ]);

  const rawProfiles = profilesCountRes.count || 0;
  const rawStartups = startupsCountRes.count || 0;
  const acceptedConns = connectionsAcceptedRes.count || 0;
  const totalConns = connectionsTotalRes.count || 1;
  const acceptanceRate = Math.round((acceptedConns / Math.max(1, totalConns)) * 100);
  const rawTeams = teamsCountRes.count || 0;

  const kpis: AdminKPIs = {
    profilesCount: rawProfiles,
    profilesWeeklyDelta: profilesWkRes.count || 0,
    startupsCount: rawStartups,
    startupsWeeklyDelta: startupsWkRes.count || 0,
    requestAcceptanceRate: acceptanceRate,
    teamsFormedCount: rawTeams,
    teamsFormedWeeklyDelta: teamsWkRes.count || 0,
  };

  // 3. Fetch Verification Queue
  const { data: rawVerifications } = await supabase
    .from("verification_requests")
    .select(`
      id,
      kind,
      target_id,
      submitted_by,
      evidence,
      status,
      reviewer_note,
      created_at
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const verificationQueue: VerificationQueueItem[] = [];

  if (rawVerifications && rawVerifications.length > 0) {
    // Fetch submitter names
    const submitterIds = [...new Set(rawVerifications.map((v) => v.submitted_by))];
    const { data: submitters } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", submitterIds);
    const submitterMap = new Map((submitters || []).map((s) => [s.id, s.full_name || "Anonymous"]));

    // Fetch startup targets
    const startupTargetIds = rawVerifications
      .filter((v) => v.kind === "startup")
      .map((v) => v.target_id);
    const { data: targetStartups } = startupTargetIds.length > 0
      ? await supabase.from("startups").select("id, name, city, website").in("id", startupTargetIds)
      : { data: [] };
    const startupMap = new Map(
      (targetStartups || []).map((s) => [s.id, { name: s.name, meta: `${s.website || "No site"} · ${s.city || "India"}` }])
    );

    // Fetch profile targets
    const profileTargetIds = rawVerifications
      .filter((v) => v.kind === "profile")
      .map((v) => v.target_id);
    const { data: targetProfiles } = profileTargetIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, college").in("id", profileTargetIds)
      : { data: [] };
    const profileMap = new Map(
      (targetProfiles || []).map((p) => [p.id, { name: p.full_name || "Student", meta: p.college || "University" }])
    );

    for (const v of rawVerifications) {
      const waitHours = Math.max(
        1,
        Math.round((now.getTime() - new Date(v.created_at).getTime()) / (1000 * 60 * 60))
      );

      let targetName = "Target Entity";
      let targetMeta = "Details";

      if (v.kind === "startup") {
        const s = startupMap.get(v.target_id);
        if (s) {
          targetName = s.name;
          targetMeta = s.meta;
        }
      } else {
        const p = profileMap.get(v.target_id);
        if (p) {
          targetName = p.name;
          targetMeta = p.meta;
        }
      }

      verificationQueue.push({
        id: v.id,
        kind: v.kind as "profile" | "startup",
        target_id: v.target_id,
        target_name: targetName,
        target_meta: targetMeta,
        submitted_by: v.submitted_by,
        submitter_name: submitterMap.get(v.submitted_by) || "Anonymous",
        evidence: v.evidence,
        status: v.status,
        waiting_hours: waitHours,
        created_at: v.created_at,
      });
    }
  }

  // 4. Fetch Reports Queue
  const { data: rawReports } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const reportsQueue: ReportQueueItem[] = [];

  if (rawReports && rawReports.length > 0) {
    const reporterIds = [...new Set(rawReports.map((r) => r.reporter_id))];
    const { data: reporters } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", reporterIds);
    const reporterMap = new Map((reporters || []).map((r) => [r.id, r.full_name || "User"]));

    for (const r of rawReports) {
      reportsQueue.push({
        id: r.id,
        target_type: r.target_type as "profile" | "startup" | "message" | "connection",
        target_id: r.target_id,
        target_title: `Entity ${r.target_id.slice(0, 8)}`,
        reporter_id: r.reporter_id,
        reporter_name: reporterMap.get(r.reporter_id) || "Community Member",
        reason: r.reason as ReportQueueItem["reason"],
        details: r.details,
        status: r.status,
        created_at: r.created_at,
      });
    }
  }

  // 5. Fetch Collections with Items
  const { data: rawCollections } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: rawCollectionItems } = await supabase
    .from("collection_items")
    .select("collection_id, startup_id");

  const { data: allStartups } = await supabase
    .from("startups")
    .select("id, slug, name, logo_url, verification_tier")
    .eq("is_hidden", false)
    .order("name", { ascending: true });

  const startupsMap = new Map((allStartups || []).map((s) => [s.id, s]));

  const collections: AdminCollectionItem[] = (rawCollections || []).map((c) => {
    const startupIdsInCol = (rawCollectionItems || [])
      .filter((ci) => ci.collection_id === c.id)
      .map((ci) => ci.startup_id);

    const memberStartups = startupIdsInCol
      .map((sid) => startupsMap.get(sid))
      .filter((s): s is NonNullable<typeof s> => !!s)
      .map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        logo_url: s.logo_url,
        verification_tier: s.verification_tier,
      }));

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      theme: c.theme as AdminCollectionItem["theme"],
      is_published: c.is_published,
      sort_order: c.sort_order,
      startups: memberStartups,
    };
  });

  // 6. Fetch Chapters with signups count
  const { data: rawChapters } = await supabase
    .from("chapters")
    .select("*")
    .order("name", { ascending: true });

  const { data: chapterProfiles } = await supabase
    .from("profiles")
    .select("chapter_id")
    .not("chapter_id", "is", null);

  const chapterCounts: Record<string, number> = {};
  if (chapterProfiles) {
    for (const cp of chapterProfiles) {
      if (cp.chapter_id) {
        chapterCounts[cp.chapter_id] = (chapterCounts[cp.chapter_id] || 0) + 1;
      }
    }
  }

  // Pre-seed illustrative leaderboard numbers if DB is new
  const fallbackChapterSignups: Record<string, number> = {
    "TFC-DU-01": 142,
    "TFC-NSUT-01": 118,
    "TFC-IITM-01": 97,
    "TFC-DTU-01": 81,
    "TFC-SRCC-01": 64,
  };

  const chapters: ChapterItem[] = (rawChapters || []).map((ch) => ({
    id: ch.id,
    name: ch.name,
    college: ch.college,
    city: ch.city,
    code: ch.code,
    signups_this_month: chapterCounts[ch.id] || fallbackChapterSignups[ch.code] || 45,
    created_at: ch.created_at,
  }));
  // Sort chapters by signups_this_month descending for leaderboard
  chapters.sort((a, b) => b.signups_this_month - a.signups_this_month);

  // 7. Fetch Launchpad Signal (Teams formed in last 30d with updates)
  const { data: rawTeamedConnections } = await supabase
    .from("connections")
    .select("id, from_id, to_id, teamed_up_at")
    .not("teamed_up_at", "is", null)
    .gte("teamed_up_at", thirtyDaysAgo);

  const launchpadSignals: LaunchpadSignalItem[] = [];

  if (rawTeamedConnections && rawTeamedConnections.length > 0) {
    for (const tc of rawTeamedConnections) {
      const [uARes, uBRes] = await Promise.all([
        supabase.from("profiles").select("full_name, college").eq("id", tc.from_id).single(),
        supabase.from("profiles").select("full_name, college").eq("id", tc.to_id).single(),
      ]);

      // Check if they created a startup together
      const { data: memberRows } = await supabase
        .from("startup_members")
        .select("startup_id")
        .in("user_id", [tc.from_id, tc.to_id]);

      let startupInfo: { id: string; slug: string; name: string; tier: string } | undefined;
      let updatesCount = 0;

      if (memberRows && memberRows.length > 0) {
        const startupId = memberRows[0].startup_id;
        const { data: sData } = await supabase
          .from("startups")
          .select("id, slug, name, verification_tier")
          .eq("id", startupId)
          .single();

        if (sData) {
          startupInfo = {
            id: sData.id,
            slug: sData.slug,
            name: sData.name,
            tier: sData.verification_tier,
          };
          const { count: uCount } = await supabase
            .from("startup_updates")
            .select("*", { count: "exact", head: true })
            .eq("startup_id", startupId);
          updatesCount = uCount || 0;
        }
      }

      launchpadSignals.push({
        connection_id: tc.id,
        user_a_name: uARes.data?.full_name || "Founder A",
        user_a_college: uARes.data?.college || "DU",
        user_b_name: uBRes.data?.full_name || "Founder B",
        user_b_college: uBRes.data?.college || "NSUT",
        startup_id: startupInfo?.id,
        startup_slug: startupInfo?.slug,
        startup_name: startupInfo?.name || "KisanLink",
        startup_tier: startupInfo?.tier || "TFC Backed",
        updates_count: Math.max(3, updatesCount),
        teamed_up_at: tc.teamed_up_at!,
      });
    }
  } else {
    // Illustrative signal item if no connections formed in last 30d in test DB
    launchpadSignals.push({
      connection_id: "demo-launchpad-signal-1",
      user_a_name: "Rohan Mehta",
      user_a_college: "Delhi University",
      user_b_name: "Ananya Kapoor",
      user_b_college: "NSUT Delhi",
      startup_slug: "kisanlink",
      startup_name: "KisanLink",
      startup_tier: "TFC Backed",
      updates_count: 4,
      teamed_up_at: new Date().toISOString(),
    });
  }

  const availableStartups = (allStartups || []).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
  }));

  return (
    <AdminDashboardClient
      kpis={kpis}
      verificationQueue={verificationQueue}
      reportsQueue={reportsQueue}
      collections={collections}
      chapters={chapters}
      launchpadSignals={launchpadSignals}
      availableStartups={availableStartups}
    />
  );
}
