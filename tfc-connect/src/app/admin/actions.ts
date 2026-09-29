"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Forbidden: You do not have administrator permissions.");
  }

  return { supabase, user };
}

// ----------------- Verification Actions -----------------

export async function approveVerificationAction(
  requestId: string,
  options: {
    tier?: "verified" | "tfc_backed";
    reviewerNote?: string;
  } = {}
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await requireAdmin();

    const { data: req, error: reqErr } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqErr || !req) {
      return { ok: false, error: "Verification request not found" };
    }

    // 1. If startup verification, update startup tier
    if (req.kind === "startup") {
      const targetTier = options.tier || "verified";
      const { error: sErr } = await supabase
        .from("startups")
        .update({
          verification_tier: targetTier,
          claimed: true,
        })
        .eq("id", req.target_id);

      if (sErr) {
        return { ok: false, error: sErr.message };
      }
    }

    // 2. If profile verification, update profile flags
    if (req.kind === "profile") {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          chapter_verified: true,
          college_email_verified: true,
        })
        .eq("id", req.target_id);

      if (pErr) {
        return { ok: false, error: pErr.message };
      }
    }

    // 3. Mark request as approved
    const { error: vErr } = await supabase
      .from("verification_requests")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        reviewer_note: options.reviewerNote?.trim() || null,
      })
      .eq("id", requestId);

    if (vErr) {
      return { ok: false, error: vErr.message };
    }

    revalidatePath("/admin");
    revalidatePath("/startups");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error approving verification" };
  }
}

export async function rejectVerificationAction(
  requestId: string,
  reviewerNote?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await requireAdmin();

    const { error } = await supabase
      .from("verification_requests")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        reviewer_note: reviewerNote?.trim() || "Requirements not met.",
      })
      .eq("id", requestId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error rejecting verification" };
  }
}

export async function askInfoVerificationAction(
  requestId: string,
  reviewerNote: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await requireAdmin();

    if (!reviewerNote.trim()) {
      return { ok: false, error: "Please provide instructions for the submitter." };
    }

    const { error } = await supabase
      .from("verification_requests")
      .update({
        status: "needs_info",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        reviewer_note: reviewerNote.trim(),
      })
      .eq("id", requestId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error requesting info" };
  }
}

// ----------------- Reports Actions -----------------

export async function resolveReportAction(
  reportId: string,
  action: "resolve_dismiss" | "resolve_hide"
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await requireAdmin();

    const { data: report, error: rErr } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (rErr || !report) {
      return { ok: false, error: "Report not found" };
    }

    // If resolve_hide, hide the target entity
    if (action === "resolve_hide") {
      if (report.target_type === "profile") {
        await supabase
          .from("profiles")
          .update({ hidden: true })
          .eq("id", report.target_id);
      } else if (report.target_type === "startup") {
        await supabase
          .from("startups")
          .update({ is_hidden: true })
          .eq("id", report.target_id);
      }
    }

    // Mark report status as approved (meaning action reviewed/resolved)
    const { error } = await supabase
      .from("reports")
      .update({
        status: "approved",
        resolved_by: user.id,
      })
      .eq("id", reportId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/startups");
    revalidatePath("/people");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error resolving report" };
  }
}

// ----------------- Collections Actions -----------------

const collectionSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens"),
  description: z.string().optional().nullable(),
  theme: z.enum(["orange", "forest", "amber", "ink", "ballpoint"]).default("orange"),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export async function createCollectionAction(
  input: z.infer<typeof collectionSchema>
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const parse = collectionSchema.safeParse(input);
    if (!parse.success) {
      return { ok: false, error: parse.error.issues[0].message };
    }

    const { data, error } = await supabase
      .from("collections")
      .insert({
        title: parse.data.title.trim(),
        slug: parse.data.slug.trim(),
        description: parse.data.description?.trim() || null,
        theme: parse.data.theme,
        is_published: parse.data.is_published,
        sort_order: parse.data.sort_order,
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/startups");
    return { ok: true, id: data.id };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error creating collection" };
  }
}

export async function updateCollectionAction(
  id: string,
  data: Partial<z.infer<typeof collectionSchema>>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("collections")
      .update(data)
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/startups");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error updating collection" };
  }
}

export async function deleteCollectionAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/startups");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error deleting collection" };
  }
}

export async function reorderCollectionsAction(
  orderedIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();

    for (let i = 0; i < orderedIds.length; i++) {
      await supabase
        .from("collections")
        .update({ sort_order: i })
        .eq("id", orderedIds[i]);
    }

    revalidatePath("/admin");
    revalidatePath("/startups");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error reordering collections" };
  }
}

export async function addStartupToCollectionAction(
  collectionId: string,
  startupId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("collection_items")
      .upsert({ collection_id: collectionId, startup_id: startupId }, { onConflict: "collection_id,startup_id" });

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/startups");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error adding startup to collection" };
  }
}

export async function removeStartupFromCollectionAction(
  collectionId: string,
  startupId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("startup_id", startupId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/startups");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error removing startup from collection" };
  }
}

// ----------------- Chapters Actions -----------------

const chapterSchema = z.object({
  name: z.string().min(2, "Chapter name is required"),
  college: z.string().min(2, "College name is required"),
  city: z.string().optional().nullable(),
  code: z.string().min(2, "Code is required").toUpperCase(),
});

export async function createChapterAction(
  input: z.infer<typeof chapterSchema>
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const parse = chapterSchema.safeParse(input);
    if (!parse.success) {
      return { ok: false, error: parse.error.issues[0].message };
    }

    const { data, error } = await supabase
      .from("chapters")
      .insert({
        name: parse.data.name.trim(),
        college: parse.data.college.trim(),
        city: parse.data.city?.trim() || null,
        code: parse.data.code.trim().toUpperCase(),
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true, id: data.id };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error creating chapter" };
  }
}

export async function updateChapterAction(
  id: string,
  input: Partial<z.infer<typeof chapterSchema>>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("chapters")
      .update(input)
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error updating chapter" };
  }
}

export async function deleteChapterAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error deleting chapter" };
  }
}

// ----------------- Launchpad Signal Actions -----------------

export async function sendLaunchpadInviteAction(
  connectionId: string,
  note?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    // Simulate / log Launchpad invite dispatch
    console.log(`[Launchpad Signal] Invited team for connection ${connectionId}: ${note || "Standard Fellowship '27 invite"}`);
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Error sending invite" };
  }
}
