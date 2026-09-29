export interface ConversationUser {
  id: string;
  name: string;
  headline: string;
  avatar_url: string | null;
  college: string;
  is_verified: boolean;
  is_tfc_fellow: boolean;
}

export interface ConversationSummary {
  id: string;
  otherUser: ConversationUser;
  last_message_at: string | null;
  last_message_preview?: string | null;
  created_at: string;
  teamed_up_at: string | null;
  is_quiet_5_days: boolean;
}

export interface MessageItem {
  id: string;
  connection_id: string;
  sender_id: string;
  body: string;
  kind: "text" | "fitkit";
  created_at: string;
}

export interface ActiveConversationDetails {
  id: string;
  from_id: string;
  to_id: string;
  status: string;
  created_at: string;
  fitkit_done: number[];
  teamed_up_from: boolean;
  teamed_up_to: boolean;
  teamed_up_at: string | null;
  score: number;
  otherUser: ConversationUser;
}
