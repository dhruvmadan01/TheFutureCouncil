"use client";

import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ConversationSummary } from "./types";

interface ConversationListProps {
  conversations: ConversationSummary[];
  activeId?: string;
  onSelectNudge?: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.otherUser.name.toLowerCase().includes(q) ||
        c.otherUser.college.toLowerCase().includes(q) ||
        c.otherUser.headline.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-line">
      {/* Search Header */}
      <div className="p-4 border-b border-line space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <h2 className="font-display text-lg font-bold text-ink">Messages</h2>
          </div>
          <span className="font-mono text-xs text-ink-soft bg-bg px-2 py-0.5 rounded-full border border-line">
            {conversations.length}
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line bg-bg font-sans text-xs text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-1 focus:ring-ink transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-line/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="font-sans text-xs text-ink-soft">
              {search ? "No matches found" : "No active chats yet"}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = activeId === item.id;
            const initials = item.otherUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Link
                key={item.id}
                href={`/messages/${item.id}`}
                className={`block p-4 transition-colors relative hover:bg-bg/60 ${
                  isSelected ? "bg-bg/90" : "bg-card"
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-ink rounded-r" />
                )}

                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {item.otherUser.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.otherUser.avatar_url}
                        alt={item.otherUser.name}
                        className="size-11 rounded-full object-cover border border-line"
                      />
                    ) : (
                      <div className="size-11 rounded-full bg-ink text-white font-display text-sm font-bold flex items-center justify-center border border-line">
                        {initials}
                      </div>
                    )}
                    {item.teamed_up_at && (
                      <span
                        title="Teamed up on TFC Connect"
                        className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#1F6F54] text-white flex items-center justify-center text-[10px] ring-2 ring-card"
                      >
                        🤝
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-display text-sm font-bold text-ink truncate">
                          {item.otherUser.name}
                        </span>
                        {item.otherUser.is_verified && (
                          <Badge variant="verified" className="text-[10px] px-1.5 py-0">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-ink-soft shrink-0">
                        {formatTime(item.last_message_at || item.created_at)}
                      </span>
                    </div>

                    <p className="font-sans text-xs text-ink-soft line-clamp-1 mb-1.5">
                      {item.last_message_preview || item.otherUser.headline || item.otherUser.college}
                    </p>

                    {/* Quiet 5-Day State / Teamed Up Badge */}
                    {item.teamed_up_at ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#1F6F54] bg-[#1F6F54]/10 px-2 py-0.5 rounded-full">
                        🤝 Teamed up
                      </span>
                    ) : item.is_quiet_5_days ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-orange-700 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                        <span className="size-1.5 rounded-full bg-orange-600 animate-pulse" />
                        Quiet for 5 days · nudge?
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
