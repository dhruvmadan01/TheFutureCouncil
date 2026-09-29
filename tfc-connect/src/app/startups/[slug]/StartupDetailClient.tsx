"use client";

import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  Globe,
  Heart,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  applyToRoleAction,
  claimStartupAction,
  createOpenRoleAction,
  postStartupUpdateAction,
  requestStartupVerificationAction,
  toggleFollowAction,
  toggleUpvoteAction,
} from "../actions";
import {
  OpenRoleItem,
  StartupItem,
  StartupUpdateItem,
  STATUS_TAGS,
  TeamMemberItem,
} from "../types";

interface StartupDetailClientProps {
  startup: StartupItem;
  team: TeamMemberItem[];
  roles: OpenRoleItem[];
  updates: StartupUpdateItem[];
  currentUserId: string | null;
  isOwner: boolean;
  isMember: boolean;
  initialFollowing: boolean;
  initialUpvoted: boolean;
}

export function StartupDetailClient({
  startup,
  team,
  roles,
  updates,
  currentUserId,
  isOwner,
  initialFollowing,
  initialUpvoted,
}: StartupDetailClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Engagement state
  const [following, setFollowing] = useState(initialFollowing);
  const [followsCount, setFollowsCount] = useState(startup.follows_count || 0);
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [upvotesCount, setUpvotesCount] = useState(startup.upvotes_count || 0);

  // Modals state
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimEvidence, setClaimEvidence] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyEvidence, setVerifyEvidence] = useState("");
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateBody, setUpdateBody] = useState("");
  const [updateSubmitting, setUpdateSubmitting] = useState(false);

  const [applyRole, setApplyRole] = useState<OpenRoleItem | null>(null);
  const [applyNote, setApplyNote] = useState("");
  const [applySubmitting, setApplySubmitting] = useState(false);

  const [newRoleOpen, setNewRoleOpen] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleType, setNewRoleType] = useState<
    "cofounder" | "intern" | "freelance"
  >("cofounder");
  const [newRoleCommitment, setNewRoleCommitment] = useState<
    "full_time" | "part_time" | "after_grad"
  >("full_time");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleSubmitting, setNewRoleSubmitting] = useState(false);

  const statusLabels = new Map(STATUS_TAGS.map((t) => [t.id, t.label]));

  // Actions
  const handleFollowToggle = () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    const next = !following;
    setFollowing(next);
    setFollowsCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));

    startTransition(async () => {
      const res = await toggleFollowAction(startup.id);
      if (!res.ok) {
        setFollowing(!next);
        setFollowsCount((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
        alert(res.error);
      }
    });
  };

  const handleUpvoteToggle = () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    const next = !upvoted;
    setUpvoted(next);
    setUpvotesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));

    startTransition(async () => {
      const res = await toggleUpvoteAction(startup.id);
      if (!res.ok) {
        setUpvoted(!next);
        setUpvotesCount((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
        alert(res.error);
      }
    });
  };

  const handlePostUpdate = async () => {
    if (!updateBody.trim() || updateSubmitting) return;
    setUpdateSubmitting(true);
    try {
      const res = await postStartupUpdateAction(startup.id, updateBody);
      if (res.ok) {
        setUpdateOpen(false);
        setUpdateBody("");
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const handleApplyRole = async () => {
    if (!applyRole || applySubmitting) return;
    setApplySubmitting(true);
    try {
      const res = await applyToRoleAction(applyRole.id, applyNote);
      if (res.ok) {
        alert("Application submitted successfully!");
        setApplyRole(null);
        setApplyNote("");
      } else {
        alert(res.error);
      }
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleClaim = async () => {
    if (!claimEvidence.trim() || claimSubmitting) return;
    setClaimSubmitting(true);
    try {
      const res = await claimStartupAction(startup.id, claimEvidence);
      if (res.ok) {
        alert("Claim request submitted! Our admin team will review it within 48h.");
        setClaimOpen(false);
        setClaimEvidence("");
      } else {
        alert(res.error);
      }
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyEvidence.trim() || verifySubmitting) return;
    setVerifySubmitting(true);
    try {
      const res = await requestStartupVerificationAction(startup.id, verifyEvidence);
      if (res.ok) {
        alert("Verification request submitted! We will check your product and verified credentials.");
        setVerifyOpen(false);
        setVerifyEvidence("");
      } else {
        alert(res.error);
      }
    } finally {
      setVerifySubmitting(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleTitle.trim() || newRoleSubmitting) return;
    setNewRoleSubmitting(true);
    try {
      const res = await createOpenRoleAction(startup.id, {
        title: newRoleTitle,
        type: newRoleType,
        commitment: newRoleCommitment,
        description: newRoleDesc,
      });
      if (res.ok) {
        setNewRoleOpen(false);
        setNewRoleTitle("");
        setNewRoleDesc("");
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setNewRoleSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Unclaimed Banner */}
      {!startup.claimed && (
        <div className="bg-amber-soft border border-amber/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏷️</span>
            <div>
              <p className="font-display text-sm font-bold text-ink">
                Is this your startup? Claim it.
              </p>
              <p className="font-sans text-xs text-ink-soft">
                This listing was indexed by TFC. Verify your founder status to manage team, open roles, and updates.
              </p>
            </div>
          </div>
          <Button
            variant="solid"
            size="sm"
            onClick={() => setClaimOpen(true)}
            className="shrink-0 text-xs"
          >
            Claim listing
          </Button>
        </div>
      )}

      {/* 2. Owner Management Bar */}
      {isOwner && (
        <div className="bg-card border border-line rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <span className="font-sans text-xs font-semibold text-ink">
              Founder Dashboard Controls
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="solid"
              size="sm"
              onClick={() => setUpdateOpen(true)}
              className="text-xs gap-1.5"
            >
              <Send className="size-3.5" />
              Post update
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewRoleOpen(true)}
              className="text-xs gap-1.5 border border-line"
            >
              <Plus className="size-3.5" />
              Add open role
            </Button>
            {startup.verification_tier === "listed" && (
              <Button
                variant="forest"
                size="sm"
                onClick={() => setVerifyOpen(true)}
                className="text-xs gap-1.5"
              >
                <ShieldCheck className="size-3.5" />
                Request verification
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 3. Hero Header & Banner */}
      <div className="bg-card border border-line rounded-3xl overflow-hidden shadow-card">
        {/* Cover */}
        <div className="h-44 sm:h-60 w-full bg-gradient-to-r from-warm-2 via-warm to-orange-soft relative">
          {startup.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={startup.cover_url}
              alt={startup.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Content Bar */}
        <div className="p-6 sm:p-8 -mt-12 sm:-mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Logo & Identity */}
            <div className="flex items-end gap-4 sm:gap-6">
              {startup.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={startup.logo_url}
                  alt={startup.name}
                  className="size-20 sm:size-24 rounded-2xl object-cover border-4 border-card bg-card shadow-md shrink-0"
                />
              ) : (
                <div className="size-20 sm:size-24 rounded-2xl bg-ink text-white font-display text-3xl font-extrabold flex items-center justify-center border-4 border-card bg-card shadow-md shrink-0">
                  {startup.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {startup.name}
                  </h1>
                  {startup.verification_tier === "tfc_backed" && (
                    <Chip variant="backed" className="text-xs px-2.5 py-0.5">
                      <Sparkles className="size-3.5 mr-1" /> TFC Backed
                    </Chip>
                  )}
                  {startup.verification_tier === "verified" && (
                    <Chip variant="verified" className="text-xs px-2.5 py-0.5">
                      ✓ Verified
                    </Chip>
                  )}
                  {startup.is_inactive && (
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      Inactive (90d+)
                    </span>
                  )}
                </div>

                <p className="font-sans text-sm sm:text-base text-ink-soft max-w-2xl font-medium">
                  {startup.one_liner}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant={upvoted ? "solid" : "ghost"}
                size="sm"
                onClick={handleUpvoteToggle}
                className="gap-1.5 border border-line"
              >
                <Heart
                  className={`size-4 ${
                    upvoted ? "fill-white text-white" : "text-ink-soft"
                  }`}
                />
                <span>Upvote</span>
                <span className="font-mono text-xs opacity-80">
                  {upvotesCount}
                </span>
              </Button>

              <Button
                variant={following ? "solid" : "ghost"}
                size="sm"
                onClick={handleFollowToggle}
                className="gap-1.5 border border-line"
              >
                <Users className="size-4" />
                <span>{following ? "Following" : "Follow"}</span>
                <span className="font-mono text-xs opacity-80">
                  {followsCount}
                </span>
              </Button>

              {startup.website && (
                <a
                  href={
                    startup.website.startsWith("http")
                      ? startup.website
                      : `https://${startup.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="gap-1.5 border border-line">
                    <Globe className="size-4" />
                    <span>Try product</span>
                    <ArrowUpRight className="size-3.5 text-ink-soft" />
                  </Button>
                </a>
              )}

              {roles.length > 0 && (
                <a href="#open-roles">
                  <Button variant="solid" size="sm" className="gap-1.5">
                    <Briefcase className="size-4" />
                    Join team ({roles.length})
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Metadata Chips Bar */}
          <div className="mt-6 pt-6 border-t border-line flex flex-wrap items-center gap-2 text-xs font-sans">
            <span className="font-mono px-3 py-1 rounded-full bg-bg border border-line font-semibold capitalize text-ink">
              Stage: {startup.stage}
            </span>
            <span className="font-mono px-3 py-1 rounded-full bg-bg border border-line font-semibold text-ink">
              {startup.industry}
            </span>
            {startup.city && (
              <span className="font-mono px-3 py-1 rounded-full bg-bg border border-line text-ink-soft flex items-center gap-1">
                <MapPin className="size-3 text-ink-soft" />
                {startup.city}
              </span>
            )}
            {startup.founded_year && (
              <span className="font-mono px-3 py-1 rounded-full bg-bg border border-line text-ink-soft flex items-center gap-1">
                <Calendar className="size-3 text-ink-soft" />
                Founded {startup.founded_year}
              </span>
            )}
            {startup.status_tags?.map((tag) => (
              <span
                key={tag}
                className="font-mono px-3 py-1 rounded-full bg-orange-soft text-orange-deep font-semibold border border-orange/20"
              >
                {statusLabels.get(tag as typeof STATUS_TAGS[number]["id"]) || tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Metric Tiles (up to 3) */}
      {startup.metrics && startup.metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {startup.metrics.slice(0, 3).map((metric, idx) => (
            <div
              key={idx}
              className="bg-card border border-line rounded-2xl p-5 shadow-xs text-center space-y-1"
            >
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
                {metric.value}
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-ink-soft">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Problem → Solution */}
      {(startup.problem || startup.solution) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {startup.problem && (
            <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500" />
                <span className="eyebrow text-xs text-red-700">THE PROBLEM</span>
              </div>
              <p className="font-sans text-sm text-ink-soft leading-relaxed">
                {startup.problem}
              </p>
            </div>
          )}

          {startup.solution && (
            <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-forest" />
                <span className="eyebrow text-xs text-forest">OUR SOLUTION</span>
              </div>
              <p className="font-sans text-sm text-ink-soft leading-relaxed">
                {startup.solution}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 6. Updates Feed */}
      <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="space-y-0.5">
            <h3 className="font-display text-xl font-bold text-ink">
              Updates &amp; Milestones
            </h3>
            <p className="font-sans text-xs text-ink-soft">
              Weekly progress shared by the founding team
            </p>
          </div>

          {isOwner && (
            <Button
              variant="solid"
              size="sm"
              onClick={() => setUpdateOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Send className="size-3.5" />
              Post update
            </Button>
          )}
        </div>

        {updates.length === 0 ? (
          <div className="py-8 text-center text-ink-soft space-y-1">
            <p className="font-sans text-xs">No updates posted yet.</p>
            {isOwner && (
              <p className="font-sans text-xs text-orange-deep font-medium">
                Keep your listing active and trending by sharing a weekly update!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((up) => (
              <div
                key={up.id}
                className="p-4 rounded-xl bg-bg border border-line space-y-2"
              >
                <div className="flex items-center justify-between font-mono text-[11px] text-ink-soft">
                  <span className="font-semibold text-ink">
                    {up.author?.full_name || "Founder"}
                  </span>
                  <span>
                    {new Date(up.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="font-sans text-sm text-ink leading-relaxed">
                  {up.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Team Section */}
      <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-0.5 border-b border-line pb-4">
          <h3 className="font-display text-xl font-bold text-ink">
            Founding Team
          </h3>
          <p className="font-sans text-xs text-ink-soft">
            Builders and operators behind {startup.name}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {team.map((member) => (
            <Link
              key={member.user_id}
              href={`/people/${member.user_id}`}
              className="p-4 rounded-xl border border-line bg-bg hover:border-ink/30 transition-all flex items-start gap-3.5 group"
            >
              {member.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatar_url}
                  alt={member.full_name || "Team member"}
                  className="size-12 rounded-full object-cover border border-line shrink-0"
                />
              ) : (
                <div className="size-12 rounded-full bg-ink text-white font-display text-sm font-bold flex items-center justify-center border border-line shrink-0">
                  {(member.full_name || "TFC").slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 space-y-0.5">
                <p className="font-display text-sm font-bold text-ink group-hover:underline truncate">
                  {member.full_name || "TFC Founder"}
                </p>
                <p className="font-sans text-xs text-ink-soft truncate">
                  {member.role_title || "Co-Founder"}
                </p>
                {member.college && (
                  <p className="font-mono text-[10px] text-ink-soft/80 truncate">
                    {member.college}
                  </p>
                )}
                {member.met_on_tfc && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-forest bg-forest-soft px-2 py-0.5 rounded-full border border-forest/20">
                      🤝 Met on TFC Connect
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 8. Open Roles Section */}
      <div
        id="open-roles"
        className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-6"
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="space-y-0.5">
            <h3 className="font-display text-xl font-bold text-ink">
              Open Roles ({roles.length})
            </h3>
            <p className="font-sans text-xs text-ink-soft">
              Join this startup as a co-founder, founding engineer, or intern
            </p>
          </div>

          {isOwner && (
            <Button
              variant="solid"
              size="sm"
              onClick={() => setNewRoleOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Add role
            </Button>
          )}
        </div>

        {roles.length === 0 ? (
          <div className="py-8 text-center text-ink-soft space-y-1">
            <p className="font-sans text-xs">
              No open roles currently listed for this startup.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="p-5 rounded-2xl border border-line bg-bg space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-display text-base font-bold text-ink">
                      {role.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-card border border-line font-semibold capitalize text-ink">
                        {role.type.replace("_", " ")}
                      </span>
                      {role.commitment && (
                        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-card border border-line text-ink-soft capitalize">
                          {role.commitment.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isOwner && (
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={() => {
                        if (!currentUserId) {
                          router.push("/login");
                          return;
                        }
                        setApplyRole(role);
                      }}
                      className="shrink-0 text-xs gap-1.5"
                    >
                      Apply now
                    </Button>
                  )}
                </div>

                {role.description && (
                  <p className="font-sans text-xs text-ink-soft leading-relaxed">
                    {role.description}
                  </p>
                )}

                {role.skills && role.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.skills.map((s) => (
                      <span
                        key={s}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-card border border-line text-ink uppercase"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Dialog */}
      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim {startup.name}</DialogTitle>
            <DialogDescription>
              Submit verification details (founder college email, LinkedIn, or domain ownership) to take ownership of this startup page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Founder Evidence &amp; Links
              </label>
              <textarea
                value={claimEvidence}
                onChange={(e) => setClaimEvidence(e.target.value)}
                rows={3}
                placeholder="Include your LinkedIn profile, college email, or GitHub repo..."
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClaimOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={handleClaim}
                disabled={claimSubmitting}
              >
                Submit Claim
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Verification Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Verification</DialogTitle>
            <DialogDescription>
              Verified startups receive the green ✓ badge, 1.3× trending boost, and elevated visibility across college networks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Working Product Link &amp; Details
              </label>
              <textarea
                value={verifyEvidence}
                onChange={(e) => setVerifyEvidence(e.target.value)}
                rows={3}
                placeholder="Live app URL, TestFlight link, or demo credentials..."
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVerifyOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={handleVerify}
                disabled={verifySubmitting}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Update Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Startup Update</DialogTitle>
            <DialogDescription>
              Share product launches, customer feedback, or revenue milestones. (Max 3 updates per rolling week).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Update Message (1–500 chars)
              </label>
              <textarea
                value={updateBody}
                onChange={(e) => setUpdateBody(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="What did you ship or learn this week?"
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
              />
              <p className="font-mono text-[10px] text-ink-soft text-right">
                {updateBody.length}/500
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUpdateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={handlePostUpdate}
                disabled={updateSubmitting || !updateBody.trim()}
              >
                Publish Update
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply to Role Dialog */}
      <Dialog open={!!applyRole} onOpenChange={(open) => !open && setApplyRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {applyRole?.title}</DialogTitle>
            <DialogDescription>
              Tell the founders why you are excited and what you bring to the table (50–500 characters).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Your Note
              </label>
              <textarea
                value={applyNote}
                onChange={(e) => setApplyNote(e.target.value)}
                rows={4}
                minLength={50}
                maxLength={500}
                placeholder="Why this role? Share relevant projects, code links, or domain experience..."
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
              />
              <div className="flex justify-between font-mono text-[10px] text-ink-soft">
                <span>Minimum 50 characters</span>
                <span>{applyNote.length}/500</span>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setApplyRole(null)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={handleApplyRole}
                disabled={applySubmitting || applyNote.trim().length < 50}
              >
                Submit Application
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Open Role Dialog */}
      <Dialog open={newRoleOpen} onOpenChange={setNewRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Open Role</DialogTitle>
            <DialogDescription>
              Attract top student co-founders and founding engineers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Role Title
              </label>
              <input
                type="text"
                value={newRoleTitle}
                onChange={(e) => setNewRoleTitle(e.target.value)}
                placeholder="e.g. Founding Full-Stack Engineer"
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-ink">
                  Role Type
                </label>
                <select
                  value={newRoleType}
                  onChange={(e) =>
                    setNewRoleType(
                      e.target.value as "cofounder" | "intern" | "freelance"
                    )
                  }
                  className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                >
                  <option value="cofounder">Co-Founder</option>
                  <option value="intern">Intern</option>
                  <option value="freelance">Freelance / Contractor</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-ink">
                  Commitment
                </label>
                <select
                  value={newRoleCommitment}
                  onChange={(e) =>
                    setNewRoleCommitment(
                      e.target.value as "full_time" | "part_time" | "after_grad"
                    )
                  }
                  className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="after_grad">After Graduation</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Description (optional)
              </label>
              <textarea
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                rows={3}
                placeholder="What will they build? Tech stack, expectations, equity..."
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewRoleOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={handleCreateRole}
                disabled={newRoleSubmitting || !newRoleTitle.trim()}
              >
                Create Role
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
