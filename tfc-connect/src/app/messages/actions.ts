"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewMessageEmail, sendTeamedUpEmail } from "@/lib/email/resend";
import { trackServerEvent } from "@/lib/analytics/posthog";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(
  connectionId: string,
  body: string,
  kind: "text" | "fitkit" = "text"
): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  if (!body || body.trim().length === 0) {
    return { ok: false, error: "Message cannot be empty." };
  }
  if (body.trim().length > 4000) {
    return { ok: false, error: "Message is too long (max 4000 characters)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // Verify connection is accepted and user is a participant
  const { data: conn } = await supabase
    .from("connections")
    .select("id, from_id, to_id, status, last_message_at")
    .eq("id", connectionId)
    .single();

  if (!conn || (conn.from_id !== user.id && conn.to_id !== user.id)) {
    return { ok: false, error: "Connection not found or unauthorized." };
  }

  if (conn.status !== "accepted") {
    return { ok: false, error: "Cannot message until connection is accepted." };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      connection_id: connectionId,
      sender_id: user.id,
      body: body.trim(),
      kind,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  // Analytics & Email Notification (Batched: max 1 an hour if recipient has not been in chat recently)
  void trackServerEvent(user.id, "message_sent", {
    connection_id: connectionId,
    kind,
  });

  const recipientId = conn.from_id === user.id ? conn.to_id : conn.from_id;
  const isBatchedOverOneHour =
    !conn.last_message_at ||
    Date.now() - new Date(conn.last_message_at).getTime() > 60 * 60 * 1000;

  if (isBatchedOverOneHour) {
    (async () => {
      try {
        const admin = createAdminClient();
        const { data: recipientContact } = await admin
          .from("profile_contacts")
          .select("email")
          .eq("user_id", recipientId)
          .maybeSingle();
        const { data: senderProfile } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        const { data: recipientProfile } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", recipientId)
          .maybeSingle();

        if (recipientContact?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://connect.thefuturecouncil.in";
          await sendNewMessageEmail({
            to: recipientContact.email,
            recipientName: recipientProfile?.full_name || "Founder",
            senderName: senderProfile?.full_name || "A Founder",
            messageSnippet: body.trim().slice(0, 150),
            chatUrl: `${appUrl}/messages/${connectionId}`,
          });
        }
      } catch (e) {
        console.error("[Message Email Failed]", e);
      }
    })();
  }

  revalidatePath(`/messages/${connectionId}`);
  revalidatePath("/messages");
  return { ok: true, messageId: data.id };
}

export async function toggleFitKitQuestionAction(
  connectionId: string,
  questionNumber: number
): Promise<{ ok: true; updatedFitKit: number[] } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { data: conn, error: connErr } = await supabase
    .from("connections")
    .select("id, from_id, to_id, fitkit_done")
    .eq("id", connectionId)
    .single();

  if (connErr || !conn || (conn.from_id !== user.id && conn.to_id !== user.id)) {
    return { ok: false, error: "Connection not found or unauthorized." };
  }

  const currentDone: number[] = conn.fitkit_done || [];
  let updatedDone: number[];

  if (currentDone.includes(questionNumber)) {
    updatedDone = currentDone.filter((n) => n !== questionNumber);
  } else {
    updatedDone = [...currentDone, questionNumber].sort((a, b) => a - b);
  }

  const { error: updateErr } = await supabase
    .from("connections")
    .update({ fitkit_done: updatedDone })
    .eq("id", connectionId);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  revalidatePath(`/messages/${connectionId}`);
  return { ok: true, updatedFitKit: updatedDone };
}

export async function teamUpAction(
  connectionId: string
): Promise<{ ok: true; teamedUp: boolean } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { data: conn, error: fetchErr } = await supabase
    .from("connections")
    .select("id, from_id, to_id, teamed_up_from, teamed_up_to, teamed_up_at")
    .eq("id", connectionId)
    .single();

  if (fetchErr || !conn || (conn.from_id !== user.id && conn.to_id !== user.id)) {
    return { ok: false, error: "Connection not found." };
  }

  const updatePayload: {
    teamed_up_from?: boolean;
    teamed_up_to?: boolean;
  } = {};
  let willBeTeamedUp = false;

  if (conn.from_id === user.id) {
    updatePayload.teamed_up_from = true;
    if (conn.teamed_up_to) willBeTeamedUp = true;
  } else {
    updatePayload.teamed_up_to = true;
    if (conn.teamed_up_from) willBeTeamedUp = true;
  }

  const { error: updateErr } = await supabase
    .from("connections")
    .update(updatePayload)
    .eq("id", connectionId);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  // Analytics
  void trackServerEvent(user.id, "teamed_up", {
    connection_id: connectionId,
    will_be_teamed_up: willBeTeamedUp,
  });

  // If both confirmed "We teamed up", send celebration email to both founders!
  if (willBeTeamedUp) {
    (async () => {
      try {
        const admin = createAdminClient();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://connect.thefuturecouncil.in";
        const createStartupUrl = `${appUrl}/startups/new`;

        const [contactFrom, contactTo, profileFrom, profileTo] = await Promise.all([
          admin.from("profile_contacts").select("email").eq("user_id", conn.from_id).maybeSingle(),
          admin.from("profile_contacts").select("email").eq("user_id", conn.to_id).maybeSingle(),
          admin.from("profiles").select("full_name").eq("id", conn.from_id).maybeSingle(),
          admin.from("profiles").select("full_name").eq("id", conn.to_id).maybeSingle(),
        ]);

        const nameFrom = profileFrom.data?.full_name || "Founder";
        const nameTo = profileTo.data?.full_name || "Founder";

        if (contactFrom.data?.email) {
          await sendTeamedUpEmail({
            to: contactFrom.data.email,
            recipientName: nameFrom,
            partnerName: nameTo,
            createStartupUrl,
          });
        }

        if (contactTo.data?.email) {
          await sendTeamedUpEmail({
            to: contactTo.data.email,
            recipientName: nameTo,
            partnerName: nameFrom,
            createStartupUrl,
          });
        }
      } catch (e) {
        console.error("[Teamed Up Email Failed]", e);
      }
    })();
  }

  revalidatePath(`/messages/${connectionId}`);
  revalidatePath("/messages");
  return { ok: true, teamedUp: willBeTeamedUp };
}

export async function reportUserAction(
  targetId: string,
  reason: "spam" | "fake" | "harassment" | "inappropriate" | "other",
  details?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: "profile",
    target_id: targetId,
    reason,
    details: details?.trim() || null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function blockUserAction(
  targetId: string,
  connectionId?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // 1. Insert into blocks
  const { error: blockErr } = await supabase.from("blocks").upsert({
    blocker_id: user.id,
    blocked_id: targetId,
  });

  if (blockErr) {
    return { ok: false, error: blockErr.message };
  }

  // 2. Archive connection if provided
  if (connectionId) {
    await supabase
      .from("connections")
      .update({ status: "archived" })
      .eq("id", connectionId);
  }

  revalidatePath("/messages");
  revalidatePath("/requests");
  return { ok: true };
}
