"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewRequestEmail } from "@/lib/email/resend";
import { trackServerEvent } from "@/lib/analytics/posthog";
import { revalidatePath } from "next/cache";

export async function sendConnectionRequestAction(
  targetId: string,
  note: string
): Promise<{ ok: true; connectionId: string } | { ok: false; error: string }> {
  if (!note || note.trim().length < 50) {
    return { ok: false, error: "Note must be at least 50 characters to prevent spam." };
  }
  if (note.trim().length > 500) {
    return { ok: false, error: "Note cannot exceed 500 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to connect." };
  }

  if (user.id === targetId) {
    return { ok: false, error: "You cannot connect with yourself." };
  }

  const { data, error } = await supabase
    .from("connections")
    .insert({
      from_id: user.id,
      to_id: targetId,
      note: note.trim(),
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    // Database check or limit trigger returns human-friendly error messages
    return { ok: false, error: error.message };
  }

  // Analytics & Email Notification
  void trackServerEvent(user.id, "connect_sent", {
    candidate_id: targetId,
    note_length: note.length,
  });

  (async () => {
    try {
      const admin = createAdminClient();
      const { data: recipientContact } = await admin
        .from("profile_contacts")
        .select("email")
        .eq("user_id", targetId)
        .maybeSingle();
      const { data: senderProfile } = await admin
        .from("profiles")
        .select("full_name, college, headline")
        .eq("id", user.id)
        .maybeSingle();
      const { data: recipientProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", targetId)
        .maybeSingle();

      if (recipientContact?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://connect.thefuturecouncil.in";
        await sendNewRequestEmail({
          to: recipientContact.email,
          recipientName: recipientProfile?.full_name || "Founder",
          senderName: senderProfile?.full_name || "A Founder",
          senderHeadline: senderProfile?.headline || senderProfile?.college || "Builder",
          noteSnippet: note.trim().slice(0, 200),
          requestUrl: `${appUrl}/requests`,
        });
      }
    } catch (e) {
      console.error("[Email Notification Failed]", e);
    }
  })();

  revalidatePath(`/people/${targetId}`);
  revalidatePath("/requests");
  return { ok: true, connectionId: data.id };
}
