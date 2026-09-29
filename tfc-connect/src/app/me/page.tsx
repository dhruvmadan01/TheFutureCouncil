import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditor } from "./ProfileEditor";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function MePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/me");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, chapters(name, college)")
    .eq("id", user.id)
    .single();

  const { data: contacts } = await supabase
    .from("profile_contacts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || "Builder",
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url,
      }}
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        <div className="flex items-center justify-between border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="glow-dot" />
              <span className="eyebrow">FOUNDER PROFILE &amp; SETTINGS</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              My Profile
            </h1>
          </div>

          <form action="/auth/signout" method="POST">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="text-plum hover:bg-plum-soft gap-2"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>

        <ProfileEditor
          profile={{
            id: user.id,
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
            headline: profile?.headline,
            college: profile?.college,
            city: profile?.city,
            bio: profile?.bio,
            why_startup: profile?.why_startup,
            role: profile?.role,
            primary_skill: profile?.primary_skill,
            secondary_skills: profile?.secondary_skills,
            looking_for_skills: profile?.looking_for_skills,
            industries: profile?.industries,
            commitment: profile?.commitment,
            remote_ok: profile?.remote_ok,
            equity_pref: profile?.equity_pref as "equal" | "open" | "depends" | null | undefined,
            proof_links: profile?.proof_links as {
              url: string;
              title: string;
              note?: string;
            }[] | null,
            work_style: profile?.work_style as {
              speed?: number;
              risk?: number;
              hours?: number;
              decision?: number;
            } | null,
            chapter_verified: profile?.chapter_verified,
            is_fellow: profile?.is_fellow,
            is_admin: profile?.is_admin,
            onboarding_complete: profile?.onboarding_complete,
            hide_from_own_college: profile?.hide_from_own_college,
            hidden: profile?.hidden,
            chapters: profile?.chapters as { name: string; college: string } | null,
          }}
          contacts={contacts}
        />
      </div>
    </AppShell>
  );
}
