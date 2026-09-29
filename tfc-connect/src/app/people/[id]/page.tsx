export const dynamic = "force-dynamic";

import { AppShell } from "@/components/tfc/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectDialog } from "@/components/tfc/ConnectDialog";
import {
  ExternalLink,
  Mail,
  Phone,
  Lock,
  MessageSquare,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Edit,
  ShieldCheck,
} from "lucide-react";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PersonProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect(`/login?next=/people/${id}`);
  }

  // 1. Fetch public profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*, chapters(name, college, city)")
    .eq("id", id)
    .maybeSingle();

  if (profileErr || !profile) {
    notFound();
  }

  // 2. Fetch contact info - RLS controls this!
  // If not owner, not connected, and not admin, returns null.
  const { data: contacts } = await supabase
    .from("profile_contacts")
    .select("*")
    .eq("user_id", id)
    .maybeSingle();

  // 3. Fetch connection status with current user
  const isSelf = currentUser.id === id;
  let connectionStatus: "none" | "pending_sent" | "pending_received" | "accepted" = "none";

  if (!isSelf) {
    const { data: connection } = await supabase
      .from("connections")
      .select("id, from_id, to_id, status")
      .or(
        `and(from_id.eq.${currentUser.id},to_id.eq.${id}),and(from_id.eq.${id},to_id.eq.${currentUser.id})`
      )
      .in("status", ["pending", "accepted"])
      .maybeSingle();

    if (connection) {
      if (connection.status === "accepted") {
        connectionStatus = "accepted";
      } else if (connection.from_id === currentUser.id) {
        connectionStatus = "pending_sent";
      } else {
        connectionStatus = "pending_received";
      }
    }
  }

  const proofLinks = (profile.proof_links as { url: string; title: string; note?: string }[]) || [];
  const workStyle = (profile.work_style as {
    speed?: number;
    risk?: number;
    hours?: number;
    decision?: number;
  }) || {};

  return (
    <AppShell
      user={{
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.user_metadata?.full_name || "Builder",
        avatarUrl: currentUser.user_metadata?.avatar_url,
      }}
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/match"
            className="inline-flex items-center gap-1.5 font-sans text-xs text-ink-soft hover:text-ink transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to matches
          </Link>

          {isSelf && (
            <Link href="/me">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Edit className="size-3.5" /> Edit your profile
              </Button>
            </Link>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-line/60">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="size-20 rounded-full border-2 border-line bg-warm flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "Founder"}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-display font-extrabold text-2xl text-ink">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                    {profile.full_name || "Builder"}
                  </h1>
                  {profile.chapter_verified && (
                    <Chip variant="verified" size="sm">
                      <ShieldCheck className="size-3" /> ✓ Verified
                    </Chip>
                  )}
                  {profile.is_fellow && (
                    <Chip variant="backed" size="sm">
                      <Sparkles className="size-3" /> TFC Fellow
                    </Chip>
                  )}
                </div>

                <p className="font-sans text-xs sm:text-sm text-ink-soft font-medium">
                  {profile.headline ||
                    `${profile.primary_skill ? profile.primary_skill.toUpperCase() : "Builder"} · ${
                      profile.college || "Campus"
                    } · ${profile.city || "India"}`}
                </p>

                {profile.chapters && (
                  <p className="font-mono text-[11px] text-orange-deep flex items-center gap-1 font-semibold">
                    <span className="glow-dot size-1.5" />
                    {(profile.chapters as { name: string }).name} Chapter
                  </p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div>
              {isSelf ? (
                <Link href="/me">
                  <Button variant="solid" size="sm" className="gap-2">
                    <Edit className="size-4" /> Edit Profile
                  </Button>
                </Link>
              ) : connectionStatus === "accepted" ? (
                <Link href="/messages">
                  <Button variant="forest" size="sm" className="gap-2">
                    <MessageSquare className="size-4" /> Message
                  </Button>
                </Link>
              ) : connectionStatus === "pending_sent" ? (
                <Button variant="ghost" size="sm" disabled className="gap-2 text-mute">
                  <Clock className="size-4" /> Request Pending
                </Button>
              ) : connectionStatus === "pending_received" ? (
                <Link href="/requests">
                  <Button variant="solid" size="sm" className="gap-2">
                    <CheckCircle2 className="size-4" /> Respond to Request
                  </Button>
                </Link>
              ) : (
                <ConnectDialog
                  targetId={profile.id}
                  targetName={profile.full_name || "Founder"}
                />
              )}
            </div>
          </div>

          {/* Quick Status Chips */}
          <div className="flex flex-wrap gap-2">
            {profile.role === "idea" && <Chip variant="neutral">💡 Has an idea</Chip>}
            {profile.role === "join" && <Chip variant="verified">🛠 Open to join</Chip>}
            {profile.role === "either" && <Chip variant="backed">🤝 Open to either</Chip>}

            {profile.commitment && (
              <Chip variant="neutral">
                {profile.commitment === "full_time"
                  ? "Full-time"
                  : profile.commitment === "part_time"
                  ? "Part-time"
                  : "After graduation"}
              </Chip>
            )}

            {profile.remote_ok && <Chip variant="neutral">Remote OK</Chip>}

            {profile.primary_skill && (
              <Chip variant="backed">
                Primary: {profile.primary_skill.toUpperCase()}
              </Chip>
            )}

            {profile.secondary_skills?.map((sk) => (
              <Chip key={sk} variant="neutral">
                {sk}
              </Chip>
            ))}
          </div>

          {/* Contact Details (RLS Controlled) */}
          <div className="bg-warm/60 border border-line rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                Direct Contact Details
              </span>
              <span className="font-mono text-[10px] text-mute flex items-center gap-1">
                <Lock className="size-3 text-forest" /> RLS Protected
              </span>
            </div>

            {contacts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {contacts.email && (
                  <div className="flex items-center gap-2 text-xs font-sans text-ink">
                    <Mail className="size-4 text-orange" />
                    <a
                      href={`mailto:${contacts.email}`}
                      className="hover:underline font-medium text-ink"
                    >
                      {contacts.email}
                    </a>
                  </div>
                )}
                {contacts.linkedin_url && (
                  <div className="flex items-center gap-2 text-xs font-sans text-ink">
                    <LinkedInIcon className="size-4 text-ballpoint" />
                    <a
                      href={contacts.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-medium text-ballpoint flex items-center gap-1"
                    >
                      LinkedIn Profile <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
                {contacts.phone && (
                  <div className="flex items-center gap-2 text-xs font-sans text-ink">
                    <Phone className="size-4 text-forest" />
                    <span>{contacts.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/80 border border-line/60 rounded-lg p-3 text-xs text-ink-soft space-y-1">
                <p className="font-medium text-ink flex items-center gap-1.5">
                  <Lock className="size-3.5 text-forest" /> Contact details hidden for privacy
                </p>
                <p className="font-sans text-[11px] text-mute leading-relaxed">
                  Email, LinkedIn, and phone details unlock once you connect and both sides accept.
                </p>
              </div>
            )}
          </div>

          {/* About / Why Startup */}
          {(profile.bio || profile.why_startup) && (
            <div className="space-y-3 pt-2">
              <h3 className="font-display text-lg font-bold text-ink">About</h3>
              {profile.bio && (
                <p className="font-sans text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}
              {profile.why_startup && (
                <div className="bg-orange-soft/40 border border-orange/20 rounded-xl p-3.5 space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-orange-deep font-bold">
                    Why I want to start up
                  </span>
                  <p className="font-sans text-xs text-ink leading-relaxed">
                    &ldquo;{profile.why_startup}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Proof of Work */}
          {proofLinks.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-display text-lg font-bold text-ink">Proof of Work</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proofLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-white border border-line rounded-xl hover:border-orange hover:shadow-sm transition-all group block space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-ink group-hover:text-orange transition-colors">
                        {link.title}
                      </span>
                      <ExternalLink className="size-3.5 text-mute group-hover:text-orange" />
                    </div>
                    {link.note && (
                      <p className="font-sans text-xs text-ink-soft line-clamp-2">
                        {link.note}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Working Style Breakdown */}
          {workStyle && typeof workStyle.speed === "number" && (
            <div className="space-y-4 pt-2">
              <h3 className="font-display text-lg font-bold text-ink">Working Style</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-warm/50 border border-line rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-ink">
                    <span>Ship fast</span>
                    <span>Polish first</span>
                  </div>
                  <div className="h-2 bg-warm-2 rounded-full overflow-hidden border border-line/40">
                    <div
                      className="h-full bg-orange rounded-full"
                      style={{ width: `${workStyle.speed ?? 50}%` }}
                    />
                  </div>
                </div>

                <div className="bg-warm/50 border border-line rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-ink">
                    <span>Play safe</span>
                    <span>Big bets</span>
                  </div>
                  <div className="h-2 bg-warm-2 rounded-full overflow-hidden border border-line/40">
                    <div
                      className="h-full bg-orange rounded-full"
                      style={{ width: `${workStyle.risk ?? 50}%` }}
                    />
                  </div>
                </div>

                <div className="bg-warm/50 border border-line rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-ink">
                    <span>20 hrs/wk</span>
                    <span>40+ hrs/wk</span>
                  </div>
                  <div className="h-2 bg-warm-2 rounded-full overflow-hidden border border-line/40">
                    <div
                      className="h-full bg-orange rounded-full"
                      style={{ width: `${workStyle.hours ?? 50}%` }}
                    />
                  </div>
                </div>

                <div className="bg-warm/50 border border-line rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-ink">
                    <span>Data driven</span>
                    <span>Gut driven</span>
                  </div>
                  <div className="h-2 bg-warm-2 rounded-full overflow-hidden border border-line/40">
                    <div
                      className="h-full bg-orange rounded-full"
                      style={{ width: `${workStyle.decision ?? 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Looking For */}
          <div className="space-y-3 pt-2">
            <h3 className="font-display text-lg font-bold text-ink">Looking For</h3>
            <div className="space-y-2">
              {profile.looking_for_skills && profile.looking_for_skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-mute uppercase tracking-wider">
                    Skills:
                  </span>
                  {profile.looking_for_skills.map((s) => (
                    <Chip key={s} variant="backed" size="sm">
                      {s.toUpperCase()}
                    </Chip>
                  ))}
                </div>
              )}

              {profile.industries && profile.industries.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-mute uppercase tracking-wider">
                    Industries:
                  </span>
                  {profile.industries.map((ind) => (
                    <Chip key={ind} variant="neutral" size="sm">
                      {ind}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
