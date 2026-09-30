export const dynamic = "force-dynamic";

import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { StartupDetailClient } from "./StartupDetailClient";
import {
  OpenRoleItem,
  StartupItem,
  StartupUpdateItem,
  TeamMemberItem,
} from "../types";

export const revalidate = 300;

interface StartupPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: StartupPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: startup } = await supabase
    .from("startups")
    .select("name, one_liner, industry, city")
    .eq("slug", slug)
    .maybeSingle();

  if (!startup) {
    return {
      title: "Startup Not Found",
    };
  }

  return {
    title: startup.name,
    description: startup.one_liner,
    openGraph: {
      title: `${startup.name} — ${startup.one_liner}`,
      description: `${startup.industry} startup${startup.city ? ` based in ${startup.city}` : ""}. Built by student founders on TFC Connect.`,
      type: "website",
    },
  };
}

export default async function StartupPage({ params }: StartupPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch startup from startups_trending view
  const { data: rawStartup } = await supabase
    .from("startups_trending")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!rawStartup) {
    notFound();
  }

  const startup: StartupItem = {
    id: rawStartup.id!,
    slug: rawStartup.slug!,
    name: rawStartup.name!,
    logo_url: rawStartup.logo_url,
    cover_url: rawStartup.cover_url,
    one_liner: rawStartup.one_liner || "",
    problem: rawStartup.problem,
    solution: rawStartup.solution,
    stage: (rawStartup.stage as StartupItem["stage"]) || "idea",
    industry: rawStartup.industry || "",
    city: rawStartup.city,
    website: rawStartup.website,
    demo_video_url: rawStartup.demo_video_url,
    founded_year: rawStartup.founded_year,
    metrics: (rawStartup.metrics as unknown as StartupItem["metrics"]) || [],
    funding_raised: rawStartup.funding_raised,
    status_tags: (rawStartup.status_tags as string[]) || [],
    deck_path: rawStartup.deck_path,
    verification_tier: (rawStartup.verification_tier as StartupItem["verification_tier"]) || "unverified",
    claimed: rawStartup.claimed ?? false,
    is_hidden: rawStartup.is_hidden ?? false,
    created_by: rawStartup.created_by,
    last_update_at: rawStartup.last_update_at || rawStartup.created_at || "",
    created_at: rawStartup.created_at || "",
    updated_at: rawStartup.updated_at || "",
    follows_count: rawStartup.follows_count || 0,
    upvotes_count: rawStartup.upvotes_count || 0,
    is_inactive: rawStartup.is_inactive || false,
    trending_score: Number(rawStartup.trending_score) || 0,
  };

  // 2. Fetch team members from startup_team_public view
  const { data: rawTeam } = await supabase
    .from("startup_team_public")
    .select("*")
    .eq("startup_id", startup.id);

  const team: TeamMemberItem[] = (rawTeam || []).map((m) => ({
    startup_id: m.startup_id || startup.id,
    user_id: m.user_id || "",
    full_name: m.full_name,
    avatar_url: m.avatar_url,
    college: m.college,
    role_title: m.role_title,
    is_owner: m.is_owner || false,
    met_on_tfc: m.met_on_tfc || false,
  }));

  // Check if current user is owner / member
  const currentMember = user ? team.find((m) => m.user_id === user.id) : null;
  const isOwner = Boolean(currentMember?.is_owner || (user && startup.created_by === user.id));
  const isMember = Boolean(currentMember || isOwner);

  // 3. Fetch open roles
  const { data: rawRoles } = await supabase
    .from("open_roles")
    .select("*")
    .eq("startup_id", startup.id)
    .order("created_at", { ascending: false });

  const roles: OpenRoleItem[] = (rawRoles || []).map((r) => ({
    id: r.id,
    startup_id: r.startup_id,
    title: r.title,
    type: r.type,
    skills: (r.skills as OpenRoleItem["skills"]) || [],
    commitment: r.commitment,
    description: r.description,
    is_open: r.is_open,
    created_at: r.created_at,
  }));

  // 4. Fetch updates with author profiles
  const { data: rawUpdates } = await supabase
    .from("startup_updates")
    .select("id, startup_id, author_id, body, created_at")
    .eq("startup_id", startup.id)
    .order("created_at", { ascending: false });

  const authorIds = Array.from(new Set((rawUpdates || []).map((u) => u.author_id)));
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", authorIds);

  const authorMap = new Map((authors || []).map((a) => [a.id, a]));

  const updates: StartupUpdateItem[] = (rawUpdates || []).map((u) => ({
    id: u.id,
    startup_id: u.startup_id,
    author_id: u.author_id,
    body: u.body,
    created_at: u.created_at,
    author: authorMap.get(u.author_id)
      ? {
          full_name: authorMap.get(u.author_id)!.full_name,
          avatar_url: authorMap.get(u.author_id)!.avatar_url,
        }
      : undefined,
  }));

  // 5. Check if user follows and upvoted
  let initialFollowing = false;
  let initialUpvoted = false;

  if (user) {
    const { data: followRow } = await supabase
      .from("follows")
      .select("created_at")
      .match({ user_id: user.id, startup_id: startup.id })
      .maybeSingle();
    initialFollowing = Boolean(followRow);

    const { data: upvoteRow } = await supabase
      .from("upvotes")
      .select("created_at")
      .match({ user_id: user.id, startup_id: startup.id })
      .maybeSingle();
    initialUpvoted = Boolean(upvoteRow);
  }

  return (
    <AppShell>
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-8">
        <StartupDetailClient
          startup={startup}
          team={team}
          roles={roles}
          updates={updates}
          currentUserId={user?.id || null}
          isOwner={isOwner}
          isMember={isMember}
          initialFollowing={initialFollowing}
          initialUpvoted={initialUpvoted}
        />
      </div>
    </AppShell>
  );
}
