import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

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
      <OnboardingWizard
        initialProfile={
          profile
            ? {
                ...profile,
                work_style: profile.work_style as {
                  speed?: number;
                  risk?: number;
                  hours?: number;
                  decision?: number;
                } | null,
                proof_links: profile.proof_links as {
                  url: string;
                  title: string;
                  note: string;
                }[] | null,
                equity_pref: profile.equity_pref as "equal" | "open" | "depends" | null,
              }
            : undefined
        }
        initialEmail={contacts?.email || user.email || ""}
        initialLinkedIn={contacts?.linkedin_url || ""}
      />
    </AppShell>
  );
}
