import { AppShell } from "@/components/tfc/AppShell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchUserConversations } from "./loader";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const conversations = await fetchUserConversations(user.id);

  // If user has accepted conversations, open the most recent one
  if (conversations.length > 0) {
    redirect(`/messages/${conversations[0].id}`);
  }

  // Otherwise, render clean empty state
  return (
    <AppShell>
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div className="border-b border-line pb-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">CHATS &amp; FIT KIT</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
            Messages
          </h1>
          <p className="font-sans text-sm text-ink-soft">
            Direct chat with your accepted connections, powered by the Founder Fit Kit.
          </p>
        </div>

        <div className="bg-card border border-line rounded-2xl p-10 text-center max-w-lg mx-auto space-y-5 shadow-card">
          <div className="size-14 rounded-full bg-ballpoint-soft text-ballpoint mx-auto flex items-center justify-center">
            <MessageSquare className="size-6 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-ink">
              No conversations yet
            </h3>
            <p className="font-sans text-sm text-ink-soft leading-relaxed">
              When a connection request is accepted, your private thread opens here alongside the 10 Founder Fit Kit alignment questions.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/match">
              <Button variant="solid" size="sm">
                Explore Matches
              </Button>
            </Link>
            <Link href="/requests">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Users className="size-4" />
                View Requests
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
