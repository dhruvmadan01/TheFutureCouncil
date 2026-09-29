"use client";

import { useState, useEffect } from "react";
import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { passMatchAction, saveMatchAction } from "./actions";
import { ConnectDialog } from "@/components/tfc/ConnectDialog";
import { trackEvent } from "@/lib/analytics/posthog";
import {
  ExternalLink,
  Bookmark,
  X,
  Sparkles,
  ShieldCheck,
  Compass,
  Check,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export interface MatchCandidate {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  headline?: string | null;
  college?: string | null;
  city?: string | null;
  role?: string | null;
  primarySkill?: string | null;
  secondarySkills?: string[] | null;
  chapterVerified?: boolean;
  isFellow?: boolean;
  score: number;
  reasons: string[];
  proofLinks?: { url: string; title: string; note?: string }[];
  action: "none" | "connected" | "saved" | "not_fit";
}

interface MatchCardListProps {
  initialMatches: MatchCandidate[];
}

export function MatchCardList({ initialMatches }: MatchCardListProps) {
  const [matches, setMatches] = useState<MatchCandidate[]>(initialMatches);
  const [exitingIds, setExitingIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  }

  // Track match_viewed PostHog event
  useEffect(() => {
    if (initialMatches && initialMatches.length > 0) {
      trackEvent("match_viewed", {
        count: initialMatches.length,
        candidate_ids: initialMatches.map((m) => m.id),
      });
    }
  }, [initialMatches]);

  // Count matches still needing action
  const remainingCount = matches.filter((m) => m.action === "none" && !exitingIds.includes(m.id)).length;

  async function handlePass(candidateId: string) {
    // Animate card out immediately
    setExitingIds((prev) => [...prev, candidateId]);

    setTimeout(async () => {
      setMatches((prev) =>
        prev.map((m) => (m.id === candidateId ? { ...m, action: "not_fit" } : m))
      );
      setExitingIds((prev) => prev.filter((id) => id !== candidateId));
      showToast("Passed on match. They won't appear again for 90 days.");

      const res = await passMatchAction(candidateId);
      if (!res.ok) {
        showToast(res.error, "error");
      }
    }, 300);
  }

  async function handleSave(candidateId: string) {
    setMatches((prev) =>
      prev.map((m) => (m.id === candidateId ? { ...m, action: "saved" } : m))
    );
    showToast("Match saved to your bookmarks.");

    const res = await saveMatchAction(candidateId);
    if (!res.ok) {
      showToast(res.error, "error");
    }
  }

  const activeMatches = matches.filter((m) => m.action !== "not_fit" || exitingIds.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">CO-FOUNDER MATCH</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
            Today&apos;s matches
          </h1>
          <p className="font-sans text-sm text-ink-soft">
            Fresh picks every morning at 8:00 AM IST. Hand-scored on skills, commitment and working style.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Chip variant={remainingCount > 0 ? "backed" : "neutral"} size="sm">
            <span className="glow-dot size-1.5" />
            {remainingCount} of {matches.length} left today
          </Chip>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === "error"
              ? "bg-plum-soft text-plum border-plum/30"
              : "bg-forest-soft text-forest border-forest/30"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="size-4 shrink-0" />
          ) : (
            <Check className="size-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Cards List or Empty State */}
      {activeMatches.length === 0 || remainingCount === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4 shadow-card">
          <div className="size-14 rounded-full bg-orange-soft text-orange mx-auto flex items-center justify-center">
            <Sparkles className="size-6 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-ink">
              New matches land at 8 AM.
            </h3>
            <p className="font-sans text-sm text-ink-soft leading-relaxed">
              Meanwhile, complete your proof of work to get better ones.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/people">
              <Button variant="solid" size="sm" className="gap-2">
                <Compass className="size-4" />
                Browse Founders
              </Button>
            </Link>
            <Link href="/me">
              <Button variant="ghost" size="sm">
                Complete Proof of Work
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeMatches.map((m) => {
            const isExiting = exitingIds.includes(m.id);
            return (
              <div
                key={m.id}
                className={`bg-card border border-line rounded-2xl p-6 sm:p-7 shadow-card space-y-5 transition-all duration-300 ${
                  isExiting
                    ? "opacity-0 -translate-x-12 scale-95 pointer-events-none"
                    : "opacity-100 translate-x-0 scale-100"
                }`}
              >
                {/* Top Row: Avatar, Info & Match Score */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Link href={`/people/${m.id}`}>
                      <div className="size-16 rounded-full border-2 border-line bg-warm flex items-center justify-center overflow-hidden shrink-0 hover:ring-2 hover:ring-orange transition-all">
                        {m.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatarUrl} alt={m.fullName} className="size-full object-cover" />
                        ) : (
                          <span className="font-display font-extrabold text-xl text-ink">
                            {m.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/people/${m.id}`}
                          className="font-display text-xl sm:text-2xl font-bold text-ink hover:text-orange transition-colors"
                        >
                          {m.fullName}
                        </Link>
                        {m.chapterVerified && (
                          <Chip variant="verified" size="sm">
                            <ShieldCheck className="size-3" /> ✓ Verified
                          </Chip>
                        )}
                        {m.isFellow && (
                          <Chip variant="backed" size="sm">
                            TFC Fellow
                          </Chip>
                        )}
                      </div>
                      <p className="font-sans text-xs text-ink-soft">
                        {m.college || "Campus"} · {m.city || "India"}
                      </p>
                      {m.headline && (
                        <p className="font-sans text-xs text-mute line-clamp-1">{m.headline}</p>
                      )}
                    </div>
                  </div>

                  {/* Match Score Display */}
                  <div className="bg-warm/70 border border-line rounded-xl px-4 py-2.5 sm:text-right shrink-0">
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-mute">
                        Match Score
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-2xl font-extrabold text-orange-deep">
                          {m.score}
                        </span>
                        <span className="font-mono text-xs text-mute">/100</span>
                      </div>
                    </div>
                    <div className="w-28 bg-line h-1.5 rounded-full overflow-hidden mt-1 hidden sm:block">
                      <div className="bg-orange h-full rounded-full" style={{ width: `${m.score}%` }} />
                    </div>
                  </div>
                </div>

                {/* Why You Match Box (PRD §4.2 styled in orange-soft) */}
                {m.reasons.length > 0 && (
                  <div className="bg-orange-soft/50 border border-orange/20 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-deep">
                      <Sparkles className="size-3.5" />
                      <span>Why you match</span>
                    </div>
                    <ul className="space-y-1 text-xs text-orange-deep/90 font-sans">
                      {m.reasons.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="size-1 rounded-full bg-orange-deep shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-2 items-center">
                  {m.primarySkill && (
                    <Chip variant="backed" size="sm">
                      {m.primarySkill.toUpperCase()}
                    </Chip>
                  )}
                  {m.secondarySkills?.map((s) => (
                    <Chip key={s} variant="neutral" size="sm">
                      {s}
                    </Chip>
                  ))}
                  {m.role && (
                    <Chip variant="verified" size="sm">
                      {m.role === "idea" ? "💡 Has Idea" : m.role === "join" ? "🛠 Open to Join" : "🤝 Either Works"}
                    </Chip>
                  )}
                </div>

                {/* Proof Links Preview (up to 2 links) */}
                {m.proofLinks && m.proofLinks.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-mute">
                      Proof of work:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.proofLinks.slice(0, 2).map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-white border border-line rounded-lg text-xs font-sans text-ink hover:border-orange flex items-center justify-between group transition-colors"
                        >
                          <span className="font-medium truncate mr-2">{link.title}</span>
                          <ExternalLink className="size-3 text-mute group-hover:text-orange shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions: Connect / Save / Not a fit */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
                  <div className="flex items-center gap-2">
                    <ConnectDialog
                      targetId={m.id}
                      targetName={m.fullName}
                      triggerButton={
                        <Button variant="solid" size="sm" className="gap-2">
                          Connect
                        </Button>
                      }
                    />

                    <Button
                      variant={m.action === "saved" ? "dark" : "ghost"}
                      size="sm"
                      onClick={() => handleSave(m.id)}
                      className="gap-1.5"
                    >
                      <Bookmark className="size-3.5" />
                      {m.action === "saved" ? "Saved" : "Save"}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePass(m.id)}
                    className="text-mute hover:text-plum hover:bg-plum-soft gap-1.5"
                  >
                    <X className="size-3.5" />
                    Not a fit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
