export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { fetchConversationDetails, fetchUserConversations } from "../loader";
import { MessagesShell } from "../MessagesShell";

interface ConversationPageProps {
  params: Promise<{
    connectionId: string;
  }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { connectionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all conversations for the user's left sidebar
  const conversations = await fetchUserConversations(user.id);

  // Fetch specific conversation details + messages
  const data = await fetchConversationDetails(connectionId, user.id);

  if (!data) {
    // If connection doesn't exist, is not accepted, or user is not a participant
    if (conversations.length > 0) {
      redirect(`/messages/${conversations[0].id}`);
    } else {
      notFound();
    }
  }

  return (
    <MessagesShell
      currentUserId={user.id}
      conversations={conversations}
      activeConversation={data.conversation}
      initialMessages={data.messages}
    />
  );
}
