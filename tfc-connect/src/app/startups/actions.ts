"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { trackServerEvent } from "@/lib/analytics/posthog";

const createStartupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name cannot exceed 60 characters"),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  one_liner: z.string().min(5, "One-liner is required").max(80, "One-liner cannot exceed 80 characters"),
  problem: z.string().max(600).optional().nullable(),
  solution: z.string().max(600).optional().nullable(),
  stage: z.enum(["idea", "building", "launched", "revenue", "funded"]).default("idea"),
  industry: z.string().min(2, "Industry is required"),
  city: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  demo_video_url: z.string().url().optional().nullable().or(z.literal("")),
  founded_year: z.number().int().min(2015).max(2035).optional().nullable(),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  status_tags: z
    .array(z.enum(["needs_cofounder", "hiring", "beta_users", "raising", "mentors"]))
    .default([]),
  logo_url: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
  deck_path: z.string().optional().nullable(),
  co_founder_ids: z.array(z.string().uuid()).default([]),
  initial_role: z
    .object({
      title: z.string().min(2),
      type: z.enum(["cofounder", "intern", "freelance"]),
      commitment: z.enum(["full_time", "part_time", "after_grad"]).optional().nullable(),
      description: z.string().max(1000).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export async function createStartupAction(
  rawInput: z.infer<typeof createStartupSchema>
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const parse = createStartupSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "Invalid inputs" };
  }

  const data = parse.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to list a startup." };
  }

  // Insert startup (trigger startups_add_owner will automatically add the user as owner)
  const { data: startup, error: insertErr } = await supabase
    .from("startups")
    .insert({
      name: data.name.trim(),
      slug: data.slug.trim(),
      one_liner: data.one_liner.trim(),
      problem: data.problem?.trim() || null,
      solution: data.solution?.trim() || null,
      stage: data.stage,
      industry: data.industry.trim(),
      city: data.city?.trim() || null,
      website: data.website?.trim() || null,
      demo_video_url: data.demo_video_url?.trim() || null,
      founded_year: data.founded_year || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metrics: data.metrics as any,
      status_tags: data.status_tags,
      logo_url: data.logo_url || null,
      cover_url: data.cover_url || null,
      deck_path: data.deck_path || null,
      claimed: true,
      verification_tier: "listed",
    })
    .select("id, slug")
    .single();

  if (insertErr) {
    return { ok: false, error: insertErr.message };
  }

  // If co-founders selected, insert them into startup_members with met_on_tfc = true
  if (data.co_founder_ids && data.co_founder_ids.length > 0) {
    const memberRows = data.co_founder_ids.map((cid) => ({
      startup_id: startup.id,
      user_id: cid,
      role_title: "Co-Founder",
      is_owner: true,
      met_on_tfc: true,
    }));
    await supabase.from("startup_members").insert(memberRows);
  }

  // If initial open role is specified, insert into open_roles
  if (data.initial_role) {
    await supabase.from("open_roles").insert({
      startup_id: startup.id,
      title: data.initial_role.title.trim(),
      type: data.initial_role.type,
      commitment: data.initial_role.commitment || null,
      description: data.initial_role.description?.trim() || null,
      is_open: true,
    });
  }

  // Analytics
  void trackServerEvent(user.id, "startup_listed", {
    startup_id: startup.id,
    slug: startup.slug,
    stage: data.stage,
    industry: data.industry,
  });

  revalidatePath("/startups");
  revalidatePath(`/startups/${startup.slug}`);
  return { ok: true, slug: startup.slug };
}

export async function toggleFollowAction(
  startupId: string
): Promise<{ ok: true; following: boolean } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please log in to follow startups." };
  }

  // Check if following
  const { data: existing } = await supabase
    .from("follows")
    .select("created_at")
    .match({ user_id: user.id, startup_id: startupId })
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .match({ user_id: user.id, startup_id: startupId });
    if (error) return { ok: false, error: error.message };
    void trackServerEvent(user.id, "startup_followed", {
      startup_id: startupId,
      following: false,
    });
    revalidatePath(`/startups`);
    return { ok: true, following: false };
  } else {
    const { error } = await supabase
      .from("follows")
      .insert({ user_id: user.id, startup_id: startupId });
    if (error) return { ok: false, error: error.message };
    void trackServerEvent(user.id, "startup_followed", {
      startup_id: startupId,
      following: true,
    });
    revalidatePath(`/startups`);
    return { ok: true, following: true };
  }
}

export async function toggleUpvoteAction(
  startupId: string
): Promise<{ ok: true; upvoted: boolean } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please log in to upvote startups." };
  }

  // Check if upvoted
  const { data: existing } = await supabase
    .from("upvotes")
    .select("created_at")
    .match({ user_id: user.id, startup_id: startupId })
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("upvotes")
      .delete()
      .match({ user_id: user.id, startup_id: startupId });
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/startups`);
    return { ok: true, upvoted: false };
  } else {
    const { error } = await supabase
      .from("upvotes")
      .insert({ user_id: user.id, startup_id: startupId });
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/startups`);
    return { ok: true, upvoted: true };
  }
}

export async function postStartupUpdateAction(
  startupId: string,
  body: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!body || body.trim().length === 0) {
    return { ok: false, error: "Update message cannot be empty." };
  }
  if (body.trim().length > 500) {
    return { ok: false, error: "Update message cannot exceed 500 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to post updates." };
  }

  const { error } = await supabase.from("startup_updates").insert({
    startup_id: startupId,
    author_id: user.id,
    body: body.trim(),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/startups");
  return { ok: true };
}

export async function applyToRoleAction(
  roleId: string,
  note: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = note.trim();
  if (trimmed.length < 50 || trimmed.length > 500) {
    return { ok: false, error: "Application note must be between 50 and 500 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please log in to apply for roles." };
  }

  const { error } = await supabase.from("role_applications").insert({
    role_id: roleId,
    applicant_id: user.id,
    note: trimmed,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "You have already applied for this role." };
    }
    return { ok: false, error: error.message };
  }

  void trackServerEvent(user.id, "role_applied", {
    role_id: roleId,
  });

  return { ok: true };
}

export async function claimStartupAction(
  startupId: string,
  evidence: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!evidence || evidence.trim().length < 10) {
    return { ok: false, error: "Please provide evidence or official links to claim this startup." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in to claim a startup." };
  }

  const { error } = await supabase.from("verification_requests").insert({
    kind: "startup",
    target_id: startupId,
    submitted_by: user.id,
    evidence: evidence.trim(),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function requestStartupVerificationAction(
  startupId: string,
  evidence: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!evidence || evidence.trim().length < 5) {
    return { ok: false, error: "Please provide your working product link or verified student credentials." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { error } = await supabase.from("verification_requests").insert({
    kind: "startup",
    target_id: startupId,
    submitted_by: user.id,
    evidence: evidence.trim(),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function createOpenRoleAction(
  startupId: string,
  data: {
    title: string;
    type: "cofounder" | "intern" | "freelance";
    commitment?: "full_time" | "part_time" | "after_grad" | null;
    skills?: ("tech" | "product" | "design" | "growth" | "sales" | "ops" | "domain")[];
    description?: string | null;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("open_roles").insert({
    startup_id: startupId,
    title: data.title.trim(),
    type: data.type,
    commitment: data.commitment || null,
    skills: data.skills || [],
    description: data.description?.trim() || null,
    is_open: true,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/startups`);
  return { ok: true };
}
