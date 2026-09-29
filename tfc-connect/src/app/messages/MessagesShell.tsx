"use client";

import { AppShell } from "@/components/tfc/AppShell";
import { sendMessageAction } from "./actions";
import { ChatThread } from "./ChatThread";
import { ConversationList } from "./ConversationList";
import { FitKitPanel } from "./FitKitPanel";
import {
  ActiveConversationDetails,
  ConversationSummary,
  MessageItem,
} from "./types";

interface MessagesShellProps {
  currentUserId: string;
  conversations: ConversationSummary[];
  activeConversation?: ActiveConversationDetails | null;
  initialMessages?: MessageItem[];
}

export function MessagesShell({
  currentUserId,
  conversations,
  activeConversation,
  initialMessages = [],
}: MessagesShellProps) {
  const handleShareFitKitToChat = async (qText: string) => {
    if (!activeConversation) return;
    await sendMessageAction(activeConversation.id, qText, "fitkit");
  };

  return (
    <AppShell>
      <div className="max-w-[1440px] mx-auto px-2 sm:px-6 py-4 sm:py-6">
        {/* Main 3-column / 2-column container */}
        <div className="bg-card border border-line rounded-2xl shadow-card overflow-hidden h-[calc(100vh-140px)] min-h-[560px] flex">
          {/* Left Column: Conversation List */}
          <div
            className={`w-full md:w-80 lg:w-84 shrink-0 h-full ${
              activeConversation ? "hidden md:block" : "block"
            }`}
          >
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
            />
          </div>

          {/* Center Column: Thread or Empty Selection */}
          <div
            className={`flex-1 h-full min-w-0 ${
              !activeConversation ? "hidden md:flex" : "flex"
            } flex-col`}
          >
            {activeConversation ? (
              <ChatThread
                currentUserId={currentUserId}
                conversation={activeConversation}
                initialMessages={initialMessages}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center bg-card">
                <div className="max-w-sm space-y-3">
                  <div className="size-12 rounded-full bg-bg border border-line text-ink-soft mx-auto flex items-center justify-center text-lg">
                    💬
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Select a conversation
                  </h3>
                  <p className="font-sans text-xs text-ink-soft leading-relaxed">
                    Choose a connection from the list on the left to view messages and work through the Founder Fit Kit.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Founder Fit Kit Panel (Desktop Only) */}
          {activeConversation && (
            <div className="hidden lg:block w-84 xl:w-96 shrink-0 h-full">
              <FitKitPanel
                connectionId={activeConversation.id}
                initialFitkitDone={activeConversation.fitkit_done}
                onShareToChat={handleShareFitKitToChat}
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
