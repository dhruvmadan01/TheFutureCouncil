"use client";

import { FIT_KIT_QUESTIONS } from "@/lib/matching/weights";
import { Check, ExternalLink, FileText, Send, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleFitKitQuestionAction } from "./actions";

interface FitKitPanelProps {
  connectionId: string;
  initialFitkitDone: number[];
  onShareToChat: (questionText: string, questionNumber: number) => Promise<void>;
  isMobile?: boolean;
}

export function FitKitPanel({
  connectionId,
  initialFitkitDone,
  onShareToChat,
  isMobile = false,
}: FitKitPanelProps) {
  const [fitkitDone, setFitkitDone] = useState<number[]>(initialFitkitDone);
  const [sharingIndex, setSharingIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const handleToggle = (qNum: number) => {
    // Optimistic update
    setFitkitDone((prev) =>
      prev.includes(qNum) ? prev.filter((n) => n !== qNum) : [...prev, qNum].sort((a, b) => a - b)
    );

    startTransition(async () => {
      const res = await toggleFitKitQuestionAction(connectionId, qNum);
      if (res.ok) {
        setFitkitDone(res.updatedFitKit);
      }
    });
  };

  const handleShare = async (qText: string, qNum: number) => {
    setSharingIndex(qNum);
    try {
      await onShareToChat(qText, qNum);
    } finally {
      setSharingIndex(null);
    }
  };

  const answeredCount = fitkitDone.length;
  const pct = Math.round((answeredCount / 10) * 100);

  return (
    <div className={`h-full flex flex-col bg-card border-l border-line ${isMobile ? "border-l-0" : ""}`}>
      {/* Header & Progress */}
      <div className="p-5 border-b border-line bg-card/80 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="font-display text-base font-bold text-ink">
              Founder Fit Kit
            </h3>
          </div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
            {answeredCount}/10 answered
          </span>
        </div>
        <p className="font-sans text-xs text-ink-soft leading-relaxed">
          10 candid conversations to de-risk equity, roles, runway, and commitment before teaming up.
        </p>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="h-2 w-full rounded-full bg-[#EFEFE6] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-[#1F6F54] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-ink-soft">
            <span>{pct}% aligned</span>
            {pct === 100 ? (
              <span className="text-[#1F6F54] font-semibold flex items-center gap-1">
                <Sparkles className="size-3" /> Fully aligned
              </span>
            ) : (
              <span>{10 - answeredCount} remaining</span>
            )}
          </div>
        </div>
      </div>

      {/* 10 Questions Scroll List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {FIT_KIT_QUESTIONS.map((question, idx) => {
          const qNum = idx + 1;
          const isDone = fitkitDone.includes(qNum);
          const isSharing = sharingIndex === qNum;

          return (
            <div
              key={qNum}
              className={`group border rounded-xl p-3 transition-all ${
                isDone
                  ? "bg-[#F7F9F5] border-[#1F6F54]/30"
                  : "bg-card border-line hover:border-ink/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggle(qNum)}
                  className={`mt-0.5 size-5 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-[#1F6F54] border-[#1F6F54] text-white"
                      : "border-line bg-card hover:border-ink"
                  }`}
                  aria-label={`Mark question ${qNum} as ${isDone ? "unanswered" : "answered"}`}
                >
                  {isDone && <Check className="size-3.5 stroke-[3]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-semibold text-ink-soft px-1.5 py-0.5 rounded bg-bg">
                      #{qNum.toString().padStart(2, "0")}
                    </span>
                    {isDone && (
                      <span className="font-mono text-[10px] font-medium text-[#1F6F54]">
                        Aligned
                      </span>
                    )}
                  </div>
                  <p
                    className={`font-sans text-xs leading-snug ${
                      isDone ? "text-ink/60 line-through" : "text-ink font-medium"
                    }`}
                  >
                    {question}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleShare(question, qNum)}
                  disabled={isSharing}
                  title="Share to chat thread"
                  className="shrink-0 p-1.5 rounded-lg text-ink-soft hover:text-orange-600 hover:bg-orange-500/10 transition-colors opacity-80 group-hover:opacity-100"
                >
                  <Send className={`size-3.5 ${isSharing ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Templates Section */}
        <div className="pt-4 mt-4 border-t border-line space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[10px]">LEGAL &amp; SPRINT TEMPLATES</span>
            <span className="font-mono text-[10px] text-ink-soft">Not legal advice</span>
          </div>

          <div className="space-y-2">
            <a
              href="/templates/trial-project-sprint.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-card hover:bg-bg/60 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <FileText className="size-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-sans text-xs font-semibold text-ink group-hover:text-orange-600 transition-colors">
                    2-Week Trial Sprint
                  </p>
                  <p className="font-sans text-[11px] text-ink-soft">
                    Sandbox to test velocity before equity
                  </p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-ink-soft group-hover:text-ink transition-colors" />
            </a>

            <a
              href="/templates/cofounder-agreement.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-card hover:bg-bg/60 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-[#1F6F54]/10 text-[#1F6F54] flex items-center justify-center">
                  <FileText className="size-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-sans text-xs font-semibold text-ink group-hover:text-[#1F6F54] transition-colors">
                    Co-Founder Agreement Checklist
                  </p>
                  <p className="font-sans text-[11px] text-ink-soft">
                    4-year vesting, 1-yr cliff &amp; IP terms
                  </p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-ink-soft group-hover:text-ink transition-colors" />
            </a>

            <a
              href="/templates/one-page-nda.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-card hover:bg-bg/60 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-ballpoint-soft text-ballpoint flex items-center justify-center">
                  <FileText className="size-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-sans text-xs font-semibold text-ink group-hover:text-ballpoint transition-colors">
                    One-Page Mutual NDA
                  </p>
                  <p className="font-sans text-[11px] text-ink-soft">
                    Simple bilateral secrecy for early discussions
                  </p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-ink-soft group-hover:text-ink transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
