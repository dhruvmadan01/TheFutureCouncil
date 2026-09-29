import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const SUPABASE_URL = "https://fwwbybbjvchrhozzzigp.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3d2J5YmJqdmNocmhvenp6aWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3MzgwNSwiZXhwIjoyMDkwNDQ5ODA1fQ.606eQ2iF10U-cT5e4j1l43GgC012356_placeholder"; // fallback or from .env.local

// Read service role key from .env.local if present
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey && fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
  if (match) {
    serviceKey = match[1].trim();
  }
}

const supabase = createClient(SUPABASE_URL, serviceKey);

async function runTest() {
  console.log("=== PHASE 4: MESSAGES & FOUNDER FIT KIT VERIFICATION ===");

  // 1. Check templates exist
  console.log("\n1. Verifying /public/templates files...");
  const templates = [
    "public/templates/trial-project-sprint.html",
    "public/templates/cofounder-agreement.html",
    "public/templates/one-page-nda.html",
  ];
  for (const t of templates) {
    if (fs.existsSync(t)) {
      const content = fs.readFileSync(t, "utf8");
      const hasDisclaimer = content.includes("NOT LEGAL ADVICE");
      console.log(`  ✓ ${t} exists (Disclaimer present: ${hasDisclaimer})`);
    } else {
      console.error(`  ✗ Missing template: ${t}`);
      process.exit(1);
    }
  }

  // 2. Fetch demo founder and target user
  const demoUserId = "3c7dd3e1-177a-43c9-8bb8-1bbc6108380a";
  const { data: otherProfiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name")
    .neq("id", demoUserId)
    .limit(2);

  if (profErr || !otherProfiles || otherProfiles.length === 0) {
    console.error("Could not find test profiles:", profErr);
    process.exit(1);
  }

  const partnerUser = otherProfiles[0];
  console.log(`\n2. Testing with Demo Founder & Partner: ${partnerUser.full_name} (${partnerUser.id})`);

  // 3. Ensure an accepted connection exists for testing
  let { data: conn } = await supabase
    .from("connections")
    .select("*")
    .or(`and(from_id.eq.${demoUserId},to_id.eq.${partnerUser.id}),and(from_id.eq.${partnerUser.id},to_id.eq.${demoUserId})`)
    .maybeSingle();

  if (!conn) {
    const { data: newConn, error: connErr } = await supabase
      .from("connections")
      .insert({
        from_id: demoUserId,
        to_id: partnerUser.id,
        status: "accepted",
        note: "Hey! Let's explore working together on a student venture.",
        responded_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (connErr) throw connErr;
    conn = newConn;
    console.log("  ✓ Created new accepted connection:", conn.id);
  } else {
    // Ensure accepted
    await supabase.from("connections").update({ status: "accepted" }).eq("id", conn.id);
    console.log("  ✓ Using existing accepted connection:", conn.id);
  }

  // 4. Test sending normal text message
  console.log("\n3. Testing normal message insertion...");
  const { data: msg1, error: msg1Err } = await supabase
    .from("messages")
    .insert({
      connection_id: conn.id,
      sender_id: demoUserId,
      body: "Hey! Loved your profile on TFC Connect. Excited to explore building together.",
      kind: "text",
    })
    .select()
    .single();

  if (msg1Err) throw msg1Err;
  console.log(`  ✓ Text message inserted: [${msg1.id}] "${msg1.body.slice(0, 35)}..."`);

  // 5. Test sending Fit Kit message
  console.log("\n4. Testing Fit Kit question message insertion...");
  const { data: msg2, error: msg2Err } = await supabase
    .from("messages")
    .insert({
      connection_id: conn.id,
      sender_id: demoUserId,
      body: "Why this problem, and why now?",
      kind: "fitkit",
    })
    .select()
    .single();

  if (msg2Err) throw msg2Err;
  console.log(`  ✓ FitKit message inserted: [${msg2.id}] kind=${msg2.kind}`);

  // 6. Test Fit Kit done toggle
  console.log("\n5. Testing Founder Fit Kit question tracking...");
  const { data: updatedConn1, error: fitErr } = await supabase
    .from("connections")
    .update({ fitkit_done: [1, 2, 3] })
    .eq("id", conn.id)
    .select("fitkit_done")
    .single();

  if (fitErr) throw fitErr;
  console.log("  ✓ Updated fitkit_done:", updatedConn1.fitkit_done);

  // 7. Test "We teamed up" dual confirmation logic
  console.log("\n6. Testing 'We teamed up' dual-confirmation trigger...");
  // Reset teamed up flags first
  await supabase
    .from("connections")
    .update({
      teamed_up_from: false,
      teamed_up_to: false,
      teamed_up_at: null,
    })
    .eq("id", conn.id);

  // First party taps
  await supabase
    .from("connections")
    .update({ teamed_up_from: true })
    .eq("id", conn.id);

  const { data: step1 } = await supabase
    .from("connections")
    .select("teamed_up_from, teamed_up_to, teamed_up_at")
    .eq("id", conn.id)
    .single();

  console.log(`  ✓ Step 1 (1st side confirmed): teamed_up_from=${step1.teamed_up_from}, teamed_up_at=${step1.teamed_up_at}`);
  if (step1.teamed_up_at !== null) {
    throw new Error("Trigger error: teamed_up_at should not be set until both sides confirm!");
  }

  // Second party taps
  await supabase
    .from("connections")
    .update({ teamed_up_to: true })
    .eq("id", conn.id);

  const { data: step2 } = await supabase
    .from("connections")
    .select("teamed_up_from, teamed_up_to, teamed_up_at")
    .eq("id", conn.id)
    .single();

  console.log(`  ✓ Step 2 (Both sides confirmed): teamed_up_to=${step2.teamed_up_to}, teamed_up_at=${step2.teamed_up_at}`);
  if (!step2.teamed_up_at) {
    throw new Error("Trigger error: teamed_up_at must be populated once both sides confirm!");
  }

  // 8. Test Report action
  console.log("\n7. Testing Report action...");
  const reportTarget = otherProfiles[1] || partnerUser;
  const { data: reportRow, error: repErr } = await supabase
    .from("reports")
    .insert({
      reporter_id: demoUserId,
      target_type: "profile",
      target_id: reportTarget.id,
      reason: "spam",
      details: "Automated test report: verified spam detection.",
    })
    .select()
    .single();

  if (repErr) throw repErr;
  console.log(`  ✓ Report logged: [${reportRow.id}] reason=${reportRow.reason}`);

  // 9. Test Block action
  console.log("\n8. Testing Block action...");
  const { data: blockRow, error: blockErr } = await supabase
    .from("blocks")
    .upsert({
      blocker_id: demoUserId,
      blocked_id: reportTarget.id,
    })
    .select()
    .single();

  if (blockErr) throw blockErr;
  console.log(`  ✓ Block registered: blocker=${blockRow.blocker_id}, blocked=${blockRow.blocked_id}`);

  // Clean up test report and block
  await supabase.from("reports").delete().eq("id", reportRow.id);
  await supabase.from("blocks").delete().match({ blocker_id: demoUserId, blocked_id: reportTarget.id });
  console.log("  ✓ Cleaned up temporary test report and block");

  console.log("\n🎉 ALL PHASE 4 MESSAGES & FIT KIT TESTS PASSED!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
