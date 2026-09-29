import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewStartupForm } from "./NewStartupForm";

interface NewStartupPageProps {
  searchParams: Promise<{
    co_founder?: string;
  }>;
}

export default async function NewStartupPage({
  searchParams,
}: NewStartupPageProps) {
  const { co_founder } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/startups/new");
  }

  // Fetch current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Fetch accepted connections for team selection
  const { data: rawConns } = await supabase
    .from("connections")
    .select("from_id, to_id")
    .eq("status", "accepted")
    .or(`from_id.eq.${user.id},to_id.eq.${user.id}`);

  const otherUserIds = Array.from(
    new Set((rawConns || []).map((c) => (c.from_id === user.id ? c.to_id : c.from_id)))
  );

  const { data: connectionProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, college, avatar_url")
    .in("id", otherUserIds);

  const acceptedConnections = (connectionProfiles || []).map((p) => ({
    id: p.id,
    name: p.full_name || "TFC Member",
    college: p.college || "University",
    avatar_url: p.avatar_url,
  }));

  return (
    <AppShell>
      <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="border-b border-line pb-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">CAMPUS VENTURE ENGINE</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
            List your startup
          </h1>
          <p className="font-sans text-sm text-ink-soft">
            Publish your venture to India&apos;s fastest growing network of student founders and builders.
          </p>
        </div>

        <NewStartupForm
          currentUserId={user.id}
          currentUserName={profile?.full_name || "Founder"}
          acceptedConnections={acceptedConnections}
          preselectedCoFounderId={co_founder || null}
        />
      </div>
    </AppShell>
  );
}
