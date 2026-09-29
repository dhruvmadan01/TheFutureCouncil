"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewRequestEmail } from "@/lib/email/resend";
import { trackServerEvent } from "@/lib/analytics/posthog";
import { revalidatePath } from "next/cache";

export async function passMatchAction(candidateId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // 1. Insert into profile_passes (so they don't appear again for 90 days)
  await supabase.from("profile_passes").upsert({
    user_id: user.id,
    target_id: candidateId,
  });

  // 2. Update matches_daily action for today
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  await supabase
    .from("matches_daily")
    .update({ action: "not_fit" })
    .eq("user_id", user.id)
    .eq("candidate_id", candidateId)
    .eq("for_date", today);

  revalidatePath("/match");
  return { ok: true };
}

export async function saveMatchAction(candidateId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // 1. Insert into profile_saves
  await supabase.from("profile_saves").upsert({
    user_id: user.id,
    target_id: candidateId,
  });

  // 2. Update matches_daily action for today
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  await supabase
    .from("matches_daily")
    .update({ action: "saved" })
    .eq("user_id", user.id)
    .eq("candidate_id", candidateId)
    .eq("for_date", today);

  revalidatePath("/match");
  return { ok: true };
}

export async function connectMatchAction(
  candidateId: string,
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
    return { ok: false, error: "Not authenticated" };
  }

  // 1. Insert into connections (triggers check 10/week rate limit & blocking)
  const { data, error } = await supabase
    .from("connections")
    .insert({
      from_id: user.id,
      to_id: candidateId,
      note: note.trim(),
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  // 2. Update matches_daily action for today
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  await supabase
    .from("matches_daily")
    .update({ action: "connected" })
    .eq("user_id", user.id)
    .eq("candidate_id", candidateId)
    .eq("for_date", today);

  // 3. Analytics & Email Notification
  void trackServerEvent(user.id, "connect_sent", {
    candidate_id: candidateId,
    note_length: note.length,
  });

  (async () => {
    try {
      const admin = createAdminClient();
      const { data: recipientContact } = await admin
        .from("profile_contacts")
        .select("email")
        .eq("user_id", candidateId)
        .maybeSingle();
      const { data: senderProfile } = await admin
        .from("profiles")
        .select("full_name, college, headline")
        .eq("id", user.id)
        .maybeSingle();
      const { data: recipientProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", candidateId)
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

  revalidatePath("/match");
  revalidatePath("/requests");
  return { ok: true, connectionId: data.id };
}
