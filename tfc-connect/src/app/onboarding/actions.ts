"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type Database } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  type Step1Data,
  type Step2Data,
  type Step3Data,
  type Step4Data,
  type Step5Data,
} from "@/lib/onboarding/schemas";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function saveStep1Action(data: Step1Data): Promise<ActionResult> {
  const parsed = step1Schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const input = parsed.data;

  // 1. Update profiles table
  const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] = {
    full_name: input.full_name,
    college: input.college,
    city: input.city,
    updated_at: new Date().toISOString(),
  };

  if (input.avatar_url) {
    profileUpdate.avatar_url = input.avatar_url;
  }

  // Optional chapter code verification
  if (input.chapter_code?.trim()) {
    const code = input.chapter_code.trim().toUpperCase();
    const { data: chapter } = await supabase
      .from("chapters")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (chapter) {
      profileUpdate.chapter_id = chapter.id;
    }

    // Insert verification request (if one doesn't exist)
    await supabase.from("verification_requests").insert({
      kind: "profile",
      target_id: user.id,
      submitted_by: user.id,
      evidence: code,
      status: "pending",
    });
  }

  const { error: profileErr } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);

  if (profileErr) {
    return { ok: false, error: profileErr.message };
  }

  // 2. Update profile_contacts table
  const { error: contactsErr } = await supabase
    .from("profile_contacts")
    .upsert({
      user_id: user.id,
      email: input.email,
      linkedin_url: input.linkedin_url || null,
    });

  if (contactsErr) {
    return { ok: false, error: contactsErr.message };
  }

  return { ok: true };
}

export async function saveStep2Action(data: Step2Data): Promise<ActionResult> {
  const parsed = step2Schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const input = parsed.data;
  const openToJoin = input.role === "join" || input.role === "either";

  const { error } = await supabase
    .from("profiles")
    .update({
      role: input.role,
      primary_skill: input.primary_skill,
      secondary_skills: input.secondary_skills || [],
      open_to_join: openToJoin,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveStep3Action(data: Step3Data): Promise<ActionResult> {
  const parsed = step3Schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const input = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      looking_for_skills: input.looking_for_skills,
      industries: input.industries,
      commitment: input.commitment,
      city: input.city,
      remote_ok: input.remote_ok,
      equity_pref: input.equity_pref,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveStep4Action(data: Step4Data): Promise<ActionResult> {
  const parsed = step4Schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const input = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      proof_links: input.proof_links,
      why_startup: input.why_startup,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveStep5AndCompleteAction(
  data: Step5Data
): Promise<ActionResult<{ matchesComputed: number }>> {
  const parsed = step5Schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const input = parsed.data;
  const now = new Date().toISOString();

  // 1. Mark onboarding complete in profiles
  const { error } = await supabase
    .from("profiles")
    .update({
      work_style: {
        speed: input.speed,
        risk: input.risk,
        hours: input.hours,
        decision: input.decision,
      },
      onboarding_complete: true,
      last_active_at: now,
      still_looking_at: now,
      updated_at: now,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  // 2. Compute user's first matches immediately using service role (PRD §4.1)
  let count = 0;
  try {
    const adminSupabase = createAdminClient();
    const { data: matchesCount, error: rpcErr } = await adminSupabase.rpc(
      "compute_user_matches",
      { target_user: user.id, per_user: 5 }
    );

    if (!rpcErr && typeof matchesCount === "number") {
      count = matchesCount;
    }
  } catch (err) {
    console.warn("Non-fatal: Error running initial matches computation:", err);
  }

  revalidatePath("/match");
  revalidatePath("/me");

  return { ok: true, data: { matchesComputed: count } };
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<{ avatarUrl: string }>> {
  const file = formData.get("file") as File | null;
  if (!file) {
    return { ok: false, error: "No file provided" };
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Please upload an image file (PNG, JPG, WebP)" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "Image size must be under 5MB" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update profile avatar_url
  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return { ok: true, data: { avatarUrl: publicUrl } };
}
