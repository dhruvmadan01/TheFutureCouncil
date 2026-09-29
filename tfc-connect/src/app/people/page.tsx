import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PeopleBrowseClient, type PersonItem } from "./PeopleBrowseClient";

export default async function PeoplePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/people");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Query eligible profiles for browse (RLS already enforces privacy)
  const { data: rawPeople } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, headline, college, city, role, primary_skill, secondary_skills, tags, industries, commitment, chapter_verified, is_fellow, open_to_join")
    .eq("onboarding_complete", true)
    .eq("hidden", false)
    .order("last_active_at", { ascending: false })
    .limit(100);

  const people: PersonItem[] = (rawPeople || []).map((p) => ({
    id: p.id,
    fullName: p.full_name || "Builder",
    avatarUrl: p.avatar_url,
    headline: p.headline,
    college: p.college,
    city: p.city,
    role: p.role,
    primarySkill: p.primary_skill,
    secondarySkills: p.secondary_skills,
    tags: p.tags,
    industries: p.industries,
    commitment: p.commitment,
    chapterVerified: p.chapter_verified,
    isFellow: p.is_fellow,
    openToJoin: p.open_to_join,
  }));

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email,
        fullName: currentProfile?.full_name || user.user_metadata?.full_name || "Builder",
        avatarUrl: currentProfile?.avatar_url || user.user_metadata?.avatar_url,
      }}
    >
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <PeopleBrowseClient initialPeople={people} currentUserId={user.id} />
      </div>
    </AppShell>
  );
}
