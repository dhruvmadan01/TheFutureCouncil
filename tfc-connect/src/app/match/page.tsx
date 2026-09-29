import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { MatchCardList, type MatchCandidate } from "./MatchCardList";

export default async function MatchPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/match");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // If user hasn't finished onboarding, middleware redirects them, but handle gracefully
  if (currentProfile && !currentProfile.onboarding_complete) {
    redirect("/onboarding");
  }

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

  // 1. Fetch today's matches from matches_daily
  let { data: dailyRows } = await supabase
    .from("matches_daily")
    .select("candidate_id, score, reasons, action, for_date")
    .eq("user_id", user.id)
    .eq("for_date", today)
    .order("score", { ascending: false });

  // 2. If empty for today, compute matches on-demand for this user (PRD §4.1)
  if (!dailyRows || dailyRows.length === 0) {
    try {
      const adminClient = createAdminClient();
      await adminClient.rpc("compute_user_matches", { target_user: user.id, per_user: 5 });

      const { data: refetched } = await supabase
        .from("matches_daily")
        .select("candidate_id, score, reasons, action, for_date")
        .eq("user_id", user.id)
        .eq("for_date", today)
        .order("score", { ascending: false });

      if (refetched && refetched.length > 0) {
        dailyRows = refetched;
      }
    } catch (err) {
      console.warn("Could not compute daily matches on demand:", err);
    }
  }

  // 3. Enrich match rows with candidate profiles
  const candidateIds = dailyRows?.map((r) => r.candidate_id) || [];
  let candidateProfiles: Record<string, {
    full_name?: string | null;
    avatar_url?: string | null;
    headline?: string | null;
    college?: string | null;
    city?: string | null;
    role?: string | null;
    primary_skill?: string | null;
    secondary_skills?: string[] | null;
    chapter_verified?: boolean;
    is_fellow?: boolean;
    proof_links?: { url: string; title: string; note?: string }[] | null;
  }> = {};

  if (candidateIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, headline, college, city, role, primary_skill, secondary_skills, chapter_verified, is_fellow, proof_links")
      .in("id", candidateIds);

    if (profiles) {
      candidateProfiles = Object.fromEntries(
        profiles.map((p) => [
          p.id,
          {
            ...p,
            proof_links: p.proof_links as { url: string; title: string; note?: string }[] | null,
          },
        ])
      );
    }
  }

  const initialMatches: MatchCandidate[] = (dailyRows || []).map((row) => {
    const p = candidateProfiles[row.candidate_id] || {};
    return {
      id: row.candidate_id,
      fullName: p.full_name || "Builder",
      avatarUrl: p.avatar_url,
      headline: p.headline,
      college: p.college,
      city: p.city,
      role: p.role,
      primarySkill: p.primary_skill,
      secondarySkills: p.secondary_skills,
      chapterVerified: p.chapter_verified,
      isFellow: p.is_fellow,
      score: row.score,
      reasons: row.reasons || [],
      proofLinks: p.proof_links as { url: string; title: string; note?: string }[] | undefined,
      action: row.action as MatchCandidate["action"],
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
        <MatchCardList initialMatches={initialMatches} />
      </div>
    </AppShell>
  );
}
