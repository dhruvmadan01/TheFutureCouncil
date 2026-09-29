"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendRequestAcceptedEmail } from "@/lib/email/resend";
import { trackServerEvent } from "@/lib/analytics/posthog";
import { revalidatePath } from "next/cache";

export async function acceptRequestAction(
  connectionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { data: conn, error: fetchErr } = await supabase
    .from("connections")
    .select("id, from_id, to_id")
    .eq("id", connectionId)
    .eq("to_id", user.id)
    .single();

  if (fetchErr || !conn) {
    return { ok: false, error: "Connection request not found." };
  }

  const { error } = await supabase
    .from("connections")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
    })
    .eq("id", connectionId)
    .eq("to_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  // Analytics & Email Notification
  void trackServerEvent(user.id, "request_accepted", {
    connection_id: connectionId,
    from_id: conn.from_id,
  });

  (async () => {
    try {
      const admin = createAdminClient();
      const { data: senderContact } = await admin
        .from("profile_contacts")
        .select("email")
        .eq("user_id", conn.from_id)
        .maybeSingle();
      const { data: acceptingProfile } = await admin
        .from("profiles")
        .select("full_name, college")
        .eq("id", user.id)
        .maybeSingle();
      const { data: senderProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", conn.from_id)
        .maybeSingle();

      if (senderContact?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://connect.thefuturecouncil.in";
        await sendRequestAcceptedEmail({
          to: senderContact.email,
          recipientName: senderProfile?.full_name || "Founder",
          partnerName: acceptingProfile?.full_name || "A Founder",
          partnerCollege: acceptingProfile?.college || "TFC Chapter",
          chatUrl: `${appUrl}/messages/${connectionId}`,
        });
      }
    } catch (e) {
      console.error("[Accept Email Failed]", e);
    }
  })();

  revalidatePath("/requests");
  revalidatePath("/messages");
  return { ok: true };
}

export async function declineRequestAction(
  connectionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("connections")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", connectionId)
    .eq("to_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/requests");
  return { ok: true };
}

export async function withdrawRequestAction(
  connectionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("connections")
    .update({
      status: "archived",
    })
    .eq("id", connectionId)
    .eq("from_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/requests");
  return { ok: true };
}
