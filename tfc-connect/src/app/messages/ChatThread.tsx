"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Check,
  Flag,
  HelpCircle,
  Lightbulb,
  MoreVertical,
  Send,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  blockUserAction,
  reportUserAction,
  sendMessageAction,
  teamUpAction,
} from "./actions";
import { FitKitPanel } from "./FitKitPanel";
import { ActiveConversationDetails, MessageItem } from "./types";

interface ChatThreadProps {
  currentUserId: string;
  conversation: ActiveConversationDetails;
  initialMessages: MessageItem[];
}

export function ChatThread({
  currentUserId,
  conversation,
  initialMessages,
}: ChatThreadProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [teamedUpAt, setTeamedUpAt] = useState<string | null>(
    conversation.teamed_up_at
  );
  const [teamedUpFrom, setTeamedUpFrom] = useState(conversation.teamed_up_from);
  const [teamedUpTo, setTeamedUpTo] = useState(conversation.teamed_up_to);
  const [fitkitDone, setFitkitDone] = useState<number[]>(conversation.fitkit_done);

  // Mobile tab state: "chat" or "fitkit"
  const [mobileTab, setMobileTab] = useState<"chat" | "fitkit">("chat");

  // More menu & modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportReason, setReportReason] = useState<
    "spam" | "fake" | "harassment" | "inappropriate" | "other"
  >("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [, startTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSender = conversation.from_id === currentUserId;
  const myTeamedUp = isSender ? teamedUpFrom : teamedUpTo;
  const otherFirstName = conversation.otherUser.name.split(" ")[0];

  const connectedDaysAgo = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(conversation.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mobileTab]);

  // Click outside to close ⋯ menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat_${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageItem;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connections",
          filter: `id=eq.${conversation.id}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const updated = payload.new;
          if (updated.fitkit_done) {
            setFitkitDone(updated.fitkit_done);
          }
          if (updated.teamed_up_at) {
            setTeamedUpAt(updated.teamed_up_at);
          }
          if (updated.teamed_up_from !== undefined) {
            setTeamedUpFrom(updated.teamed_up_from);
          }
          if (updated.teamed_up_to !== undefined) {
            setTeamedUpTo(updated.teamed_up_to);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  const handleSendMessage = async (
    text?: string,
    kind: "text" | "fitkit" = "text"
  ) => {
    const body = (text !== undefined ? text : inputValue).trim();
    if (!body || isSending) return;

    if (text === undefined) {
      setInputValue("");
    }
    setIsSending(true);

    try {
      const res = await sendMessageAction(conversation.id, body, kind);
      if (!res.ok) {
        alert(res.error);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleTeamUp = () => {
    startTransition(async () => {
      const res = await teamUpAction(conversation.id);
      if (res.ok) {
        if (isSender) {
          setTeamedUpFrom(true);
        } else {
          setTeamedUpTo(true);
        }
        if (res.teamedUp) {
          setTeamedUpAt(new Date().toISOString());
        }
      } else {
        alert(res.error);
      }
    });
  };

  const handleReport = async () => {
    startTransition(async () => {
      const res = await reportUserAction(
        conversation.otherUser.id,
        reportReason,
        reportDetails
      );
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportOpen(false);
          setReportSuccess(false);
          setReportDetails("");
        }, 1500);
      } else {
        alert(res.error);
      }
    });
  };

  const handleBlock = async () => {
    startTransition(async () => {
      const res = await blockUserAction(
        conversation.otherUser.id,
        conversation.id
      );
      if (res.ok) {
        setBlockOpen(false);
        router.push("/messages");
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  };

  const initials = conversation.otherUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* 1. Header */}
      <div className="p-3.5 sm:p-4 border-b border-line bg-card/90 backdrop-blur-sm shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/messages"
            className="md:hidden p-1.5 -ml-1 text-ink-soft hover:text-ink rounded-lg hover:bg-bg transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <Link
            href={`/people/${conversation.otherUser.id}`}
            className="shrink-0 relative group"
          >
            {conversation.otherUser.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conversation.otherUser.avatar_url}
                alt={conversation.otherUser.name}
                className="size-10 rounded-full object-cover border border-line group-hover:border-ink transition-colors"
              />
            ) : (
              <div className="size-10 rounded-full bg-ink text-white font-display text-sm font-bold flex items-center justify-center border border-line">
                {initials}
              </div>
            )}
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/people/${conversation.otherUser.id}`}
                className="font-display text-sm sm:text-base font-bold text-ink hover:underline truncate"
              >
                {conversation.otherUser.name}
              </Link>
              {conversation.otherUser.is_verified && (
                <Badge variant="verified" className="text-[10px] px-1.5 py-0 shrink-0">
                  ✓ Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-ink-soft">
              <span>
                {connectedDaysAgo === 0
                  ? "Connected today"
                  : `Connected ${connectedDaysAgo}d ago`}
              </span>
              <span>·</span>
              <span className="font-semibold text-ink">
                Score {conversation.score}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* "🤝 We teamed up" button & status */}
          {teamedUpAt ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F6F54]/10 text-[#1F6F54] border border-[#1F6F54]/30 font-mono text-xs font-semibold">
              <Sparkles className="size-3.5" />
              Teamed up! 🤝
            </div>
          ) : myTeamedUp ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F6F54]/10 text-[#1F6F54] border border-[#1F6F54]/20 font-mono text-[11px] font-medium">
              <span className="size-2 rounded-full bg-[#1F6F54] animate-pulse" />
              Waiting for {otherFirstName} to confirm
            </div>
          ) : (
            <Button
              variant="forest"
              size="sm"
              onClick={handleTeamUp}
              className="text-xs shrink-0"
            >
              🤝 We teamed up
            </Button>
          )}

          {/* Mobile Tabs Toggle */}
          <div className="flex lg:hidden bg-bg rounded-full p-0.5 border border-line text-xs font-sans">
            <button
              type="button"
              onClick={() => setMobileTab("chat")}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                mobileTab === "chat"
                  ? "bg-card text-ink font-semibold shadow-xs"
                  : "text-ink-soft"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("fitkit")}
              className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                mobileTab === "fitkit"
                  ? "bg-card text-orange-600 font-semibold shadow-xs"
                  : "text-ink-soft"
              }`}
            >
              Fit Kit
              <span className="font-mono text-[10px] bg-orange-500/10 text-orange-600 px-1 rounded-full">
                {fitkitDone.length}
              </span>
            </button>
          </div>

          {/* ⋯ Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-bg transition-colors"
              aria-label="More conversation actions"
            >
              <MoreVertical className="size-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-card border border-line shadow-card py-1.5 z-30 font-sans text-xs">
                <Link
                  href={`/people/${conversation.otherUser.id}`}
                  className="flex items-center gap-2 px-3.5 py-2 text-ink hover:bg-bg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="size-4 text-ink-soft" />
                  View profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-ink hover:bg-bg transition-colors text-left"
                >
                  <Flag className="size-4 text-orange-600" />
                  Report user
                </button>
                <div className="border-t border-line my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setBlockOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <ShieldAlert className="size-4 text-red-600" />
                  Block user
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Celebration Banner if Teamed Up */}
      {teamedUpAt && (
        <div className="bg-gradient-to-r from-[#1F6F54]/15 via-[#F7F9F5] to-orange-500/10 border-b border-[#1F6F54]/30 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-display text-sm font-bold text-ink">
                You both teamed up! Met on TFC Connect 🤝
              </p>
              <p className="font-sans text-xs text-ink-soft">
                Congratulations on forming your founding team. Ready to build?
              </p>
            </div>
          </div>
          <Link href="/startups/new">
            <Button variant="forest" size="sm" className="shrink-0 text-xs">
              + List your startup together
            </Button>
          </Link>
        </div>
      )}

      {/* Mobile Fit Kit View */}
      {mobileTab === "fitkit" ? (
        <div className="flex-1 overflow-y-auto lg:hidden">
          <FitKitPanel
            connectionId={conversation.id}
            initialFitkitDone={fitkitDone}
            onShareToChat={(qText) => handleSendMessage(qText, "fitkit")}
            isMobile
          />
        </div>
      ) : (
        /* Chat Content Area */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Scroll Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          >
            {/* Conversation Starter Timestamp */}
            <div className="text-center my-2">
              <span className="font-mono text-[10px] text-ink-soft bg-bg px-3 py-1 rounded-full border border-line">
                Connection established · {new Date(conversation.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="py-12 text-center max-w-sm mx-auto space-y-3">
                <div className="size-12 rounded-full bg-orange-500/10 text-orange-600 mx-auto flex items-center justify-center">
                  <Lightbulb className="size-6" />
                </div>
                <h4 className="font-display text-base font-bold text-ink">
                  Start the conversation
                </h4>
                <p className="font-sans text-xs text-ink-soft leading-relaxed">
                  Break the ice or share your first question from the Founder Fit Kit to kick off co-founder alignment.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                const timeStr = new Date(msg.created_at).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                );

                if (msg.kind === "fitkit") {
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-md w-full rounded-2xl border-2 border-dashed border-orange-500/50 bg-[#FFF9F5] p-4 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-orange-600">
                            <HelpCircle className="size-4" />
                            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                              FOUNDER FIT KIT QUESTION
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-ink-soft">
                            {timeStr}
                          </span>
                        </div>

                        <p className="font-display text-sm font-bold text-ink leading-snug">
                          {msg.body}
                        </p>

                        <div className="pt-1 flex items-center justify-between border-t border-orange-500/15 text-[11px] font-sans text-ink-soft">
                          <span>Shared from Fit Kit checklist</span>
                          <span className="text-orange-700 font-medium">
                            {isMine ? "You shared" : `${otherFirstName} shared`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm font-sans leading-relaxed break-words ${
                        isMine
                          ? "bg-ink text-white rounded-tr-xs"
                          : "bg-card border border-line text-ink rounded-tl-xs shadow-xs"
                      }`}
                    >
                      {msg.body}
                    </div>
                    <span className="font-mono text-[10px] text-ink-soft mt-1 px-1">
                      {timeStr}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 sm:p-4 border-t border-line bg-card/90 backdrop-blur-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={`Message ${otherFirstName}... (Shift+Enter for newline)`}
                className="flex-1 max-h-32 min-h-[42px] py-2.5 px-4 rounded-xl border border-line bg-bg font-sans text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-1 focus:ring-ink resize-none transition-all"
              />
              <Button
                type="submit"
                variant="solid"
                size="sm"
                disabled={!inputValue.trim() || isSending}
                className="h-[42px] px-4 shrink-0 rounded-xl"
              >
                <Send className="size-4" />
                <span className="hidden sm:inline ml-1.5">Send</span>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Report User Modal */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {conversation.otherUser.name}</DialogTitle>
            <DialogDescription>
              Help keep TFC Connect safe. Reports are reviewed by human admins within 24 hours.
            </DialogDescription>
          </DialogHeader>

          {reportSuccess ? (
            <div className="p-6 text-center space-y-2">
              <div className="size-10 rounded-full bg-[#1F6F54]/10 text-[#1F6F54] mx-auto flex items-center justify-center">
                <Check className="size-5 stroke-[2.5]" />
              </div>
              <p className="font-display text-sm font-bold text-ink">Report submitted</p>
              <p className="font-sans text-xs text-ink-soft">
                Thank you for notifying us. We will investigate this account promptly.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-ink">
                  Reason for report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) =>
                    setReportReason(
                      e.target.value as "spam" | "fake" | "harassment" | "inappropriate" | "other"
                    )
                  }
                  className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                >
                  <option value="spam">Spam / Unsolicited promotion</option>
                  <option value="fake">Fake profile / Misrepresentation</option>
                  <option value="harassment">Harassment / Abusive conduct</option>
                  <option value="inappropriate">Inappropriate content or proposal</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-ink">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder="Provide context or specific details..."
                  className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-1 focus:ring-ink resize-none"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReportOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="solid" size="sm" onClick={handleReport}>
                  Submit Report
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block User Modal */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {conversation.otherUser.name}?</DialogTitle>
            <DialogDescription>
              They will not be able to send you messages or view your profile. This conversation will be archived.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBlockOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={handleBlock}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
