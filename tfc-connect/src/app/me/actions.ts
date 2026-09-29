"use server";

import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/supabase/types";
import { profileEditSchema, type ProfileEditData } from "@/lib/onboarding/schemas";
import { revalidatePath } from "next/cache";

export async function updateMyProfileAction(
  data: ProfileEditData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = profileEditSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid data" };
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
    headline: input.headline || null,
    college: input.college || null,
    city: input.city || null,
    bio: input.bio || null,
    why_startup: input.why_startup || null,
    role: input.role,
    primary_skill: input.primary_skill,
    secondary_skills: input.secondary_skills || [],
    looking_for_skills: input.looking_for_skills || [],
    industries: input.industries || [],
    commitment: input.commitment,
    remote_ok: input.remote_ok ?? true,
    equity_pref: input.equity_pref || "open",
    proof_links: input.proof_links || [],
    hide_from_own_college: input.hide_from_own_college ?? false,
    hidden: input.hidden ?? false,
    updated_at: new Date().toISOString(),
  };

  if (
    typeof input.speed === "number" &&
    typeof input.risk === "number" &&
    typeof input.hours === "number" &&
    typeof input.decision === "number"
  ) {
    profileUpdate.work_style = {
      speed: input.speed,
      risk: input.risk,
      hours: input.hours,
      decision: input.decision,
    };
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
      email: input.email || user.email,
      phone: input.phone || null,
      linkedin_url: input.linkedin_url || null,
    });

  if (contactsErr) {
    return { ok: false, error: contactsErr.message };
  }

  revalidatePath("/me");
  revalidatePath(`/people/${user.id}`);
  revalidatePath("/match");

  return { ok: true };
}
