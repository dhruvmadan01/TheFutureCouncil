import { createClient } from "@/lib/supabase/server";
import { ConversationSummary, ActiveConversationDetails, MessageItem } from "./types";

export async function fetchUserConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  const { data: conns } = await supabase
    .from("connections")
    .select("id, from_id, to_id, created_at, last_message_at, teamed_up_at, status")
    .eq("status", "accepted")
    .or(`from_id.eq.${userId},to_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (!conns || conns.length === 0) {
    return [];
  }

  // Find all other user IDs
  const otherUserIds = Array.from(
    new Set(conns.map((c) => (c.from_id === userId ? c.to_id : c.from_id)))
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, full_name, headline, avatar_url, college, chapter_verified, college_email_verified, linkedin_verified, is_fellow"
    )
    .in("id", otherUserIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [
      p.id,
      {
        id: p.id,
        name: p.full_name || "TFC Member",
        headline: p.headline || "Student Founder",
        avatar_url: p.avatar_url,
        college: p.college || "University",
        is_verified: Boolean(
          p.chapter_verified || p.college_email_verified || p.linkedin_verified
        ),
        is_tfc_fellow: Boolean(p.is_fellow),
      },
    ])
  );

  // Fetch latest message for each connection for preview
  const connIds = conns.map((c) => c.id);
  const { data: latestMessages } = await supabase
    .from("messages")
    .select("connection_id, body, created_at")
    .in("connection_id", connIds)
    .order("created_at", { ascending: false });

  const msgMap = new Map<string, string>();
  if (latestMessages) {
    for (const msg of latestMessages) {
      if (!msgMap.has(msg.connection_id)) {
        msgMap.set(msg.connection_id, msg.body);
      }
    }
  }

  const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;

  return conns.map((c) => {
    const otherId = c.from_id === userId ? c.to_id : c.from_id;
    const prof = profileMap.get(otherId) || {
      id: otherId,
      name: "TFC Member",
      headline: "Student Founder",
      avatar_url: null,
      college: "University",
      is_verified: false,
      is_tfc_fellow: false,
    };

    const lastTime = c.last_message_at
      ? new Date(c.last_message_at).getTime()
      : new Date(c.created_at).getTime();

    const isQuiet = lastTime <= fiveDaysAgo;

    return {
      id: c.id,
      otherUser: prof,
      last_message_at: c.last_message_at,
      last_message_preview: msgMap.get(c.id) || null,
      created_at: c.created_at,
      teamed_up_at: c.teamed_up_at,
      is_quiet_5_days: isQuiet,
    };
  });
}

export async function fetchConversationDetails(
  connectionId: string,
  userId: string
): Promise<{
  conversation: ActiveConversationDetails;
  messages: MessageItem[];
} | null> {
  const supabase = await createClient();

  const { data: conn } = await supabase
    .from("connections")
    .select(
      "id, from_id, to_id, created_at, status, fitkit_done, teamed_up_from, teamed_up_to, teamed_up_at"
    )
    .eq("id", connectionId)
    .single();

  if (!conn || (conn.from_id !== userId && conn.to_id !== userId)) {
    return null;
  }

  if (conn.status !== "accepted") {
    return null;
  }

  const otherId = conn.from_id === userId ? conn.to_id : conn.from_id;

  const { data: prof } = await supabase
    .from("profiles")
    .select(
      "id, full_name, headline, avatar_url, college, chapter_verified, college_email_verified, linkedin_verified, is_fellow"
    )
    .eq("id", otherId)
    .single();

  const otherUser = prof
    ? {
        id: prof.id,
        name: prof.full_name || "TFC Member",
        headline: prof.headline || "Student Founder",
        avatar_url: prof.avatar_url,
        college: prof.college || "University",
        is_verified: Boolean(
          prof.chapter_verified ||
            prof.college_email_verified ||
            prof.linkedin_verified
        ),
        is_tfc_fellow: Boolean(prof.is_fellow),
      }
    : {
        id: otherId,
        name: "TFC Member",
        headline: "Student Founder",
        avatar_url: null,
        college: "University",
        is_verified: false,
        is_tfc_fellow: false,
      };

  // Fetch score from matches_daily or calculate default
  const { data: matchRow } = await supabase
    .from("matches_daily")
    .select("score")
    .or(`and(user_id.eq.${userId},candidate_id.eq.${otherId}),and(user_id.eq.${otherId},candidate_id.eq.${userId})`)
    .limit(1)
    .maybeSingle();

  const score = matchRow?.score || 88;

  // Fetch all messages in chronological order
  const { data: msgs } = await supabase
    .from("messages")
    .select("id, connection_id, sender_id, body, kind, created_at")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  const typedMessages: MessageItem[] = (msgs || []).map((m) => ({
    id: m.id,
    connection_id: m.connection_id,
    sender_id: m.sender_id,
    body: m.body,
    kind: m.kind as "text" | "fitkit",
    created_at: m.created_at,
  }));

  return {
    conversation: {
      id: conn.id,
      from_id: conn.from_id,
      to_id: conn.to_id,
      status: conn.status,
      created_at: conn.created_at,
      fitkit_done: (conn.fitkit_done as number[]) || [],
      teamed_up_from: conn.teamed_up_from || false,
      teamed_up_to: conn.teamed_up_to || false,
      teamed_up_at: conn.teamed_up_at,
      score,
      otherUser,
    },
    messages: typedMessages,
  };
}
