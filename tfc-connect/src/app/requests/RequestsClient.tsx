"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/badge";
import { acceptRequestAction, declineRequestAction, withdrawRequestAction } from "./actions";
import {
  Inbox,
  Send,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export interface RequestItem {
  id: string;
  note: string;
  status: "pending" | "accepted" | "declined" | "expired" | "archived";
  createdAt: string;
  otherUser: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    headline?: string | null;
    college?: string | null;
    city?: string | null;
    role?: string | null;
    primarySkill?: string | null;
    chapterVerified?: boolean;
    isFellow?: boolean;
  };
  score?: number | null;
}

interface RequestsClientProps {
  initialIncoming: RequestItem[];
  initialSent: RequestItem[];
}

export function RequestsClient({ initialIncoming, initialSent }: RequestsClientProps) {
  const [tab, setTab] = useState<"incoming" | "sent">("incoming");
  const [incoming, setIncoming] = useState<RequestItem[]>(initialIncoming);
  const [sent, setSent] = useState<RequestItem[]>(initialSent);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleAccept(connectionId: string) {
    setActionLoading(connectionId);
    const res = await acceptRequestAction(connectionId);
    setActionLoading(null);

    if (res.ok) {
      setIncoming((prev) =>
        prev.map((item) => (item.id === connectionId ? { ...item, status: "accepted" } : item))
      );
    }
  }

  async function handleDecline(connectionId: string) {
    setActionLoading(connectionId);
    const res = await declineRequestAction(connectionId);
    setActionLoading(null);

    if (res.ok) {
      setIncoming((prev) => prev.filter((item) => item.id !== connectionId));
    }
  }

  async function handleWithdraw(connectionId: string) {
    setActionLoading(connectionId);
    const res = await withdrawRequestAction(connectionId);
    setActionLoading(null);

    if (res.ok) {
      setSent((prev) => prev.filter((item) => item.id !== connectionId));
    }
  }

  function formatTimeAgo(isoString: string) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  const pendingIncoming = incoming.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">CO-FOUNDER REQUESTS</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
            Requests
          </h1>
          <p className="font-sans text-sm text-ink-soft">
            Review incoming requests with personal notes, or track your sent invites.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-warm-2 p-1 rounded-full border border-line shrink-0">
          <button
            onClick={() => setTab("incoming")}
            className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold flex items-center gap-1.5 transition-all ${
              tab === "incoming"
                ? "bg-white text-ink shadow-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Inbox className="size-3.5" />
            Incoming ({pendingIncoming.length})
          </button>
          <button
            onClick={() => setTab("sent")}
            className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold flex items-center gap-1.5 transition-all ${
              tab === "sent"
                ? "bg-white text-ink shadow-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Send className="size-3.5" />
            Sent ({sent.length})
          </button>
        </div>
      </div>

      {/* Tab: INCOMING */}
      {tab === "incoming" && (
        <div className="space-y-4">
          {pendingIncoming.length === 0 ? (
            <div className="bg-card border border-line rounded-2xl p-10 text-center max-w-md mx-auto space-y-3 shadow-card">
              <Inbox className="size-10 text-mute mx-auto stroke-[1.5]" />
              <h3 className="font-display text-lg font-bold text-ink">No incoming requests right now</h3>
              <p className="font-sans text-xs text-ink-soft">
                When other founders want to collaborate, their personal notes will appear here.
              </p>
              <Link href="/match">
                <Button variant="solid" size="sm" className="mt-2">
                  Review Today&apos;s Matches
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {pendingIncoming.map((req) => (
                <div
                  key={req.id}
                  className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-4 hover:border-orange/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <Link href={`/people/${req.otherUser.id}`}>
                        <div className="size-14 rounded-full border border-line bg-warm flex items-center justify-center overflow-hidden shrink-0 hover:ring-2 hover:ring-orange transition-all">
                          {req.otherUser.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={req.otherUser.avatarUrl}
                              alt={req.otherUser.fullName}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="font-display font-extrabold text-lg text-ink">
                              {req.otherUser.fullName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/people/${req.otherUser.id}`}
                            className="font-display font-bold text-lg text-ink hover:text-orange transition-colors"
                          >
                            {req.otherUser.fullName}
                          </Link>
                          {req.otherUser.chapterVerified && (
                            <Chip variant="verified" size="sm">
                              <ShieldCheck className="size-3" /> ✓ Verified
                            </Chip>
                          )}
                          <span className="font-mono text-[10px] text-mute">
                            · {formatTimeAgo(req.createdAt)}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-ink-soft">
                          {req.otherUser.primarySkill?.toUpperCase()} · {req.otherUser.college || "Campus"}
                        </p>
                      </div>
                    </div>

                    {req.score && (
                      <Chip variant="backed" size="sm" className="self-start">
                        <Sparkles className="size-3" /> {req.score} Match Score
                      </Chip>
                    )}
                  </div>

                  {/* Note Quote Box */}
                  <div className="bg-warm/70 border border-line/80 rounded-xl p-4 text-xs font-sans text-ink leading-relaxed">
                    &ldquo;{req.note}&rdquo;
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-line/60">
                    <p className="font-sans text-[11px] text-mute">
                      Declines are private. The sender just sees &ldquo;not now&rdquo;.
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === req.id}
                        onClick={() => handleDecline(req.id)}
                        className="text-mute hover:text-plum hover:bg-plum-soft gap-1"
                      >
                        <X className="size-3.5" />
                        Decline
                      </Button>

                      <Button
                        variant="forest"
                        size="sm"
                        disabled={actionLoading === req.id}
                        onClick={() => handleAccept(req.id)}
                        className="gap-1.5"
                      >
                        <Check className="size-3.5" />
                        Accept &amp; Connect
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Tab: SENT */}
      {tab === "sent" && (
        <div className="space-y-4">
          {sent.length === 0 ? (
            <div className="bg-card border border-line rounded-2xl p-10 text-center max-w-md mx-auto space-y-3 shadow-card">
              <Send className="size-10 text-mute mx-auto stroke-[1.5]" />
              <h3 className="font-display text-lg font-bold text-ink">No sent requests</h3>
              <p className="font-sans text-xs text-ink-soft">
                Browse student founders or review today&apos;s matches to send a personalized request.
              </p>
              <Link href="/people">
                <Button variant="solid" size="sm" className="mt-2">
                  Browse People
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {sent.map((req) => (
                <div
                  key={req.id}
                  className="bg-card border border-line rounded-2xl p-5 sm:p-6 shadow-card space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/people/${req.otherUser.id}`}>
                        <div className="size-12 rounded-full border border-line bg-warm flex items-center justify-center overflow-hidden shrink-0">
                          {req.otherUser.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={req.otherUser.avatarUrl}
                              alt={req.otherUser.fullName}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="font-display font-bold text-base text-ink">
                              {req.otherUser.fullName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="space-y-0.5">
                        <Link
                          href={`/people/${req.otherUser.id}`}
                          className="font-display font-bold text-base text-ink hover:text-orange transition-colors flex items-center gap-1.5"
                        >
                          {req.otherUser.fullName}
                          <ExternalLink className="size-3 text-mute" />
                        </Link>
                        <p className="font-sans text-xs text-ink-soft">
                          {req.otherUser.college || "Campus"} · {formatTimeAgo(req.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === "accepted" && (
                        <Chip variant="verified" size="sm" className="gap-1">
                          <Check className="size-3" /> Connected
                        </Chip>
                      )}
                      {req.status === "pending" && (
                        <Chip variant="neutral" size="sm" className="gap-1">
                          <Clock className="size-3" /> Request Pending
                        </Chip>
                      )}
                      {req.status === "declined" && (
                        <Chip variant="neutral" size="sm" className="text-mute">
                          Not right now
                        </Chip>
                      )}
                    </div>
                  </div>

                  <div className="bg-warm/40 border border-line/60 rounded-xl p-3 text-xs font-sans text-ink-soft leading-relaxed line-clamp-2">
                    &ldquo;{req.note}&rdquo;
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-line/50">
                    <span className="font-mono text-[10px] text-mute">
                      Expires after 14 days if unanswered
                    </span>

                    {req.status === "accepted" ? (
                      <Link href="/messages">
                        <Button variant="forest" size="sm" className="gap-1.5">
                          <MessageSquare className="size-3.5" />
                          Chat
                        </Button>
                      </Link>
                    ) : req.status === "pending" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === req.id}
                        onClick={() => handleWithdraw(req.id)}
                        className="text-plum hover:bg-plum-soft text-xs"
                      >
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
