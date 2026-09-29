import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RequestsClient, type RequestItem } from "./RequestsClient";

export default async function RequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/requests");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // 1. Fetch Incoming requests (to_id = user.id)
  const { data: incomingRows } = await supabase
    .from("connections")
    .select("id, from_id, note, status, created_at")
    .eq("to_id", user.id)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: false });

  // 2. Fetch Sent requests (from_id = user.id)
  const { data: sentRows } = await supabase
    .from("connections")
    .select("id, to_id, note, status, created_at")
    .eq("from_id", user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  // Collect user IDs to fetch profile metadata
  const senderIds = incomingRows?.map((r) => r.from_id) || [];
  const recipientIds = sentRows?.map((r) => r.to_id) || [];
  const allTargetIds = Array.from(new Set([...senderIds, ...recipientIds]));

  let profileMap: Record<string, {
    full_name?: string | null;
    avatar_url?: string | null;
    headline?: string | null;
    college?: string | null;
    city?: string | null;
    role?: string | null;
    primary_skill?: string | null;
    chapter_verified?: boolean;
    is_fellow?: boolean;
  }> = {};

  if (allTargetIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, headline, college, city, role, primary_skill, chapter_verified, is_fellow")
      .in("id", allTargetIds);

    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  // Check if match scores exist
  const { data: matches } = await supabase
    .from("matches_daily")
    .select("candidate_id, score")
    .eq("user_id", user.id)
    .in("candidate_id", senderIds);

  const scoreMap = new Map();
  matches?.forEach((m) => scoreMap.set(m.candidate_id, m.score));

  const incoming: RequestItem[] = (incomingRows || []).map((row) => {
    const p = profileMap[row.from_id] || {};
    return {
      id: row.id,
      note: row.note,
      status: row.status as RequestItem["status"],
      createdAt: row.created_at,
      otherUser: {
        id: row.from_id,
        fullName: p.full_name || "Builder",
        avatarUrl: p.avatar_url,
        headline: p.headline,
        college: p.college,
        city: p.city,
        role: p.role,
        primarySkill: p.primary_skill,
        chapterVerified: p.chapter_verified,
        isFellow: p.is_fellow,
      },
      score: scoreMap.get(row.from_id) || null,
    };
  });

  const sent: RequestItem[] = (sentRows || []).map((row) => {
    const p = profileMap[row.to_id] || {};
    return {
      id: row.id,
      note: row.note,
      status: row.status as RequestItem["status"],
      createdAt: row.created_at,
      otherUser: {
        id: row.to_id,
        fullName: p.full_name || "Builder",
        avatarUrl: p.avatar_url,
        headline: p.headline,
        college: p.college,
        city: p.city,
        role: p.role,
        primarySkill: p.primary_skill,
        chapterVerified: p.chapter_verified,
        isFellow: p.is_fellow,
      },
    };
  });

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email,
        fullName: currentProfile?.full_name || user.user_metadata?.full_name || "Builder",
        avatarUrl: currentProfile?.avatar_url || user.user_metadata?.avatar_url,
      }}
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <RequestsClient initialIncoming={incoming} initialSent={sent} />
      </div>
    </AppShell>
  );
}
