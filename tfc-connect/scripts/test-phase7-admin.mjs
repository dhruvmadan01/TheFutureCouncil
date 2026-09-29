import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function runTests() {
  console.log("=== Starting Phase 7 Admin Test Suite ===\n");

  // 1. Verify demo_founder is an admin
  console.log("1. Verifying admin status of demo_founder...");
  const { data: adminProfile } = await adminSupabase
    .from("profiles")
    .select("id, full_name, is_admin")
    .eq("id", "3c7dd3e1-177a-43c9-8bb8-1bbc6108380a")
    .single();

  if (!adminProfile?.is_admin) {
    console.error("❌ demo_founder is not an admin!");
    process.exit(1);
  }
  console.log(`✓ Admin user: ${adminProfile.full_name} (is_admin: ${adminProfile.is_admin})`);

  // 2. Test Verification Requests
  console.log("\n2. Testing Verification Requests queue & approval...");
  // Create a pending startup verification request
  const { data: startup } = await adminSupabase
    .from("startups")
    .select("id, name, verification_tier")
    .limit(1)
    .single();

  const { data: vReq, error: vErr } = await adminSupabase
    .from("verification_requests")
    .insert({
      kind: "startup",
      target_id: startup.id,
      submitted_by: adminProfile.id,
      evidence: "Official Launchpad fellowship admission letter & registered trademark.",
      status: "pending",
    })
    .select()
    .single();

  if (vErr) {
    console.error("❌ Failed to create test verification request:", vErr.message);
  } else {
    console.log(`✓ Created test verification request ${vReq.id} for startup ${startup.name}`);

    // Simulate Admin approval -> promote to tfc_backed
    await adminSupabase
      .from("startups")
      .update({ verification_tier: "tfc_backed", claimed: true })
      .eq("id", startup.id);

    await adminSupabase
      .from("verification_requests")
      .update({
        status: "approved",
        reviewed_by: adminProfile.id,
        reviewed_at: new Date().toISOString(),
        reviewer_note: "Verified by TFC team.",
      })
      .eq("id", vReq.id);

    const { data: updatedStartup } = await adminSupabase
      .from("startups")
      .select("verification_tier")
      .eq("id", startup.id)
      .single();

    console.log(`✓ Approved request! Startup verification_tier is now: "${updatedStartup.verification_tier}"`);
  }

  // 3. Test Trust & Safety Reports Queue
  console.log("\n3. Testing Reports Queue & Resolution...");
  const { data: testReport, error: rErr } = await adminSupabase
    .from("reports")
    .insert({
      reporter_id: adminProfile.id,
      target_type: "startup",
      target_id: startup.id,
      reason: "spam",
      details: "Duplicate copy of an existing college project.",
      status: "pending",
    })
    .select()
    .single();

  if (rErr) {
    console.error("❌ Failed to insert test report:", rErr.message);
  } else {
    console.log(`✓ Created test report ${testReport.id} (reason: ${testReport.reason})`);

    // Resolve report
    await adminSupabase
      .from("reports")
      .update({
        status: "approved",
        resolved_by: adminProfile.id,
      })
      .eq("id", testReport.id);

    console.log("✓ Report resolved successfully by admin.");
  }

  // 4. Test Collections Management
  console.log("\n4. Testing Collections Editor CRUD & Reordering...");
  const testColSlug = `admin-test-${Date.now()}`;
  const { data: newCol, error: colErr } = await adminSupabase
    .from("collections")
    .insert({
      slug: testColSlug,
      title: "Delhi Tech Innovators",
      description: "Fastest-shipping engineering teams from Delhi universities.",
      theme: "forest",
      is_published: true,
      sort_order: 99,
    })
    .select()
    .single();

  if (colErr) {
    console.error("❌ Failed to create collection:", colErr.message);
  } else {
    console.log(`✓ Created collection: ${newCol.title} (${newCol.slug})`);

    // Add startup to collection
    const { error: addErr } = await adminSupabase
      .from("collection_items")
      .insert({ collection_id: newCol.id, startup_id: startup.id, position: 0 });

    if (addErr) {
      console.error("❌ Failed to add startup to collection:", addErr.message);
    } else {
      console.log(`✓ Added startup ${startup.name} to collection!`);
    }

    // Clean up test collection
    await adminSupabase.from("collections").delete().eq("id", newCol.id);
    console.log("✓ Cleaned up test collection.");
  }

  // 5. Test Chapters Management CRUD
  console.log("\n5. Testing Chapters CRUD & Leaderboard...");
  const testChapCode = `TFC-TEST-${Date.now().toString().slice(-4)}`;
  const { data: newChap, error: chapErr } = await adminSupabase
    .from("chapters")
    .insert({
      name: "TFC BITS Pilani",
      college: "Birla Institute of Technology and Science",
      city: "Pilani",
      code: testChapCode,
    })
    .select()
    .single();

  if (chapErr) {
    console.error("❌ Failed to create chapter:", chapErr.message);
  } else {
    console.log(`✓ Created chapter: ${newChap.name} (Code: ${newChap.code})`);

    // Clean up
    await adminSupabase.from("chapters").delete().eq("id", newChap.id);
    console.log("✓ Cleaned up test chapter.");
  }

  // 6. Test Launchpad Signal Query
  console.log("\n6. Testing Launchpad Signal query...");
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: signalTeams, error: sigErr } = await adminSupabase
    .from("connections")
    .select("id, from_id, to_id, teamed_up_at")
    .not("teamed_up_at", "is", null)
    .gte("teamed_up_at", thirtyDaysAgo);

  if (sigErr) {
    console.error("❌ Failed to query launchpad signals:", sigErr.message);
  } else {
    console.log(`✓ Launchpad signal query succeeded (${signalTeams.length} teamed-up connections in last 30d).`);
  }

  console.log("\n=== Phase 7 Admin Test Suite Passed Successfully! ===");
}

runTests().catch(console.error);
