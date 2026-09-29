import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendQuietNudgeEmail,
  sendStillLookingEmail,
  sendStartupUpdateReminderEmail,
  sendDailyMatchesEmail,
} from "@/lib/email/resend";

export const dynamic = "force-dynamic";

/**
 * Scheduled Notifications Handler (PRD §7)
 * Runs daily or can be invoked with Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const results = {
    dailyMatchesSent: 0,
    quietNudgesSent: 0,
    stillLookingSent: 0,
    listingRemindersSent: 0,
  };

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://connect.thefuturecouncil.in";

  try {
    // 1. Daily matches notifications for users with unviewed matches today
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    const { data: dailyMatches } = await adminClient
      .from("matches_daily")
      .select("user_id")
      .eq("for_date", today)
      .eq("action", "none");

    if (dailyMatches && dailyMatches.length > 0) {
      const uniqueUserIds = [...new Set(dailyMatches.map((m) => m.user_id))];
      for (const userId of uniqueUserIds) {
        const { data: contacts } = await adminClient
          .from("profile_contacts")
          .select("email")
          .eq("user_id", userId)
          .maybeSingle();

        const { data: profile } = await adminClient
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .maybeSingle();

        if (contacts?.email) {
          await sendDailyMatchesEmail({
            to: contacts.email,
            recipientName: profile?.full_name || "Founder",
            matchUrl: `${appUrl}/match`,
          });
          results.dailyMatchesSent++;
        }
      }
    }

    // 2. 5-day quiet nudge for stalled conversations
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const { data: quietConns } = await adminClient
      .from("connections")
      .select("id, from_id, to_id, last_message_at")
      .eq("status", "accepted")
      .lt("last_message_at", fiveDaysAgo)
      .gt("last_message_at", sevenDaysAgo);

    if (quietConns && quietConns.length > 0) {
      for (const conn of quietConns) {
        // Nudge both participants
        const { data: pFrom } = await adminClient
          .from("profiles")
          .select("id, full_name")
          .eq("id", conn.from_id)
          .single();
        const { data: pTo } = await adminClient
          .from("profiles")
          .select("id, full_name")
          .eq("id", conn.to_id)
          .single();

        const { data: cFrom } = await adminClient
          .from("profile_contacts")
          .select("email")
          .eq("user_id", conn.from_id)
          .maybeSingle();

        if (cFrom?.email && pTo) {
          await sendQuietNudgeEmail({
            to: cFrom.email,
            recipientName: pFrom?.full_name || "Founder",
            partnerName: pTo.full_name || "Partner",
            chatUrl: `${appUrl}/messages/${conn.id}`,
          });
          results.quietNudgesSent++;
        }
      }
    }

    // 3. 30-day "Still looking?" check
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const fortyFiveDaysAgo = new Date(Date.now() - 45 * 86400000).toISOString();

    const { data: staleProfiles } = await adminClient
      .from("profiles")
      .select("id, full_name, still_looking_at")
      .eq("onboarding_complete", true)
      .lt("still_looking_at", thirtyDaysAgo)
      .gt("still_looking_at", fortyFiveDaysAgo)
      .limit(50);

    if (staleProfiles && staleProfiles.length > 0) {
      for (const p of staleProfiles) {
        const { data: contact } = await adminClient
          .from("profile_contacts")
          .select("email")
          .eq("user_id", p.id)
          .maybeSingle();

        if (contact?.email) {
          await sendStillLookingEmail({
            to: contact.email,
            recipientName: p.full_name || "Founder",
            refreshUrl: `${appUrl}/match?still_looking=true`,
            browseUrl: `${appUrl}/people`,
          });
          results.stillLookingSent++;
        }
      }
    }

    // 4. 60-day startup listing update reminder
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();

    const { data: inactiveStartups } = await adminClient
      .from("startups")
      .select("id, name, slug, created_by, last_update_at")
      .lt("last_update_at", sixtyDaysAgo)
      .gt("last_update_at", ninetyDaysAgo)
      .limit(50);

    if (inactiveStartups && inactiveStartups.length > 0) {
      for (const st of inactiveStartups) {
        if (!st.created_by) continue;
        const { data: ownerContact } = await adminClient
          .from("profile_contacts")
          .select("email")
          .eq("user_id", st.created_by)
          .maybeSingle();

        const { data: ownerProfile } = await adminClient
          .from("profiles")
          .select("full_name")
          .eq("id", st.created_by)
          .maybeSingle();

        if (ownerContact?.email) {
          await sendStartupUpdateReminderEmail({
            to: ownerContact.email,
            recipientName: ownerProfile?.full_name || "Founder",
            startupName: st.name,
            startupSlug: st.slug,
            lastUpdateDays: 60,
            updateUrl: `${appUrl}/startups/${st.slug}#updates`,
          });
          results.listingRemindersSent++;
        }
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
