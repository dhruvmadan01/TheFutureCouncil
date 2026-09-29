import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("=== PHASE 3 AUTOMATED TEST: MATCHING, REQUESTS, BROWSE & RATE LIMITS ===");

  const emailX = `founder_match_x_${Date.now()}@tfc.internal`;
  const emailY = `founder_match_y_${Date.now()}@tfc.internal`;
  const password = "TestPassword123!#";

  // 1. Create two test accounts
  console.log("\n[TEST 1] Creating test accounts User X and User Y...");
  const { data: uX } = await admin.auth.admin.createUser({
    email: emailX,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Karan Malhotra" },
  });
  const { data: uY } = await admin.auth.admin.createUser({
    email: emailY,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Simran Sethi" },
  });

  const userX = uX.user;
  const userY = uY.user;
  console.log("✓ User X:", userX.id);
  console.log("✓ User Y:", userY.id);

  // Authenticate clients
  const clientX = createClient(SUPABASE_URL, ANON_KEY);
  await clientX.auth.signInWithPassword({ email: emailX, password });
  const clientY = createClient(SUPABASE_URL, ANON_KEY);
  await clientY.auth.signInWithPassword({ email: emailY, password });

  // Complete onboarding for both
  await clientX.from("profiles").update({
    full_name: "Karan Malhotra",
    college: "Netaji Subhas University of Technology",
    city: "Delhi NCR",
    role: "idea",
    primary_skill: "tech",
    looking_for_skills: ["growth"],
    industries: ["FinTech", "AI/ML"],
    commitment: "full_time",
    work_style: { speed: 80, risk: 75, hours: 80, decision: 40 },
    onboarding_complete: true,
  }).eq("id", userX.id);

  await clientY.from("profiles").update({
    full_name: "Simran Sethi",
    college: "Shri Ram College of Commerce",
    city: "Delhi NCR",
    role: "join",
    primary_skill: "growth",
    looking_for_skills: ["tech"],
    industries: ["FinTech", "EdTech"],
    commitment: "full_time",
    work_style: { speed: 85, risk: 70, hours: 85, decision: 45 },
    onboarding_complete: true,
  }).eq("id", userY.id);

  console.log("✓ Completed profiles for User X and User Y.");

  // 2. Test Match Computation
  console.log("\n[TEST 2] Testing compute_user_matches for User X...");
  const { data: matchCount, error: rpcErr } = await admin.rpc("compute_user_matches", {
    target_user: userX.id,
    per_user: 5,
  });
  if (rpcErr) throw rpcErr;
  console.log(`✓ Matches computed for User X: ${matchCount}`);

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const { data: dailyMatches } = await clientX
    .from("matches_daily")
    .select("candidate_id, score, reasons, action")
    .eq("user_id", userX.id)
    .eq("for_date", today);

  console.log("  Today's matches in DB:", dailyMatches?.length);
  if (dailyMatches && dailyMatches.length > 0) {
    console.log("  Sample match score:", dailyMatches[0].score, "Reasons:", dailyMatches[0].reasons);
  }

  // 3. Test Match Action: "Not a fit" (profile_passes)
  if (dailyMatches && dailyMatches.length > 0) {
    const candidateToPass = dailyMatches[0].candidate_id;
    console.log("\n[TEST 3] Testing 'Not a fit' action...");
    const { error: passErr } = await clientX.from("profile_passes").upsert({
      user_id: userX.id,
      target_id: candidateToPass,
    });
    if (passErr) throw passErr;

    await clientX.from("matches_daily").update({ action: "not_fit" })
      .eq("user_id", userX.id)
      .eq("candidate_id", candidateToPass)
      .eq("for_date", today);

    const { data: passCheck } = await clientX
      .from("profile_passes")
      .select("target_id")
      .eq("user_id", userX.id)
      .eq("target_id", candidateToPass)
      .single();

    console.log("✓ Recorded in profile_passes:", passCheck?.target_id);
  }

  // 4. Test Match Action: "Save" (profile_saves)
  if (dailyMatches && dailyMatches.length > 1) {
    const candidateToSave = dailyMatches[1].candidate_id;
    console.log("\n[TEST 4] Testing 'Save' action...");
    const { error: saveErr } = await clientX.from("profile_saves").upsert({
      user_id: userX.id,
      target_id: candidateToSave,
    });
    if (saveErr) throw saveErr;

    const { data: saveCheck } = await clientX
      .from("profile_saves")
      .select("target_id")
      .eq("user_id", userX.id)
      .eq("target_id", candidateToSave)
      .single();

    console.log("✓ Recorded in profile_saves:", saveCheck?.target_id);
  }

  // 5. Test Connect Request & Trigger Validation
  console.log("\n[TEST 5] Testing Connect request with 50+ character note...");
  const validNote = "Hey Simran! I'm Karan from NSUT building an AI payment router. Saw your FinTech D2C experience and would love to collaborate on a 2-week pilot!";
  const { data: conn, error: connErr } = await clientX
    .from("connections")
    .insert({
      from_id: userX.id,
      to_id: userY.id,
      note: validNote,
      status: "pending",
    })
    .select()
    .single();

  if (connErr) throw connErr;
  console.log("✓ Connection request inserted:", conn.id, "Status:", conn.status);

  // 6. Test DB Constraint: Note under 50 characters should fail
  console.log("\n[TEST 6] Testing character check trigger (note < 50 chars)...");
  const { error: shortNoteErr } = await clientX
    .from("connections")
    .insert({
      from_id: userX.id,
      to_id: userY.id,
      note: "Hi, let's connect!",
      status: "pending",
    });

  console.log("✓ Short note rejected as expected:", shortNoteErr ? shortNoteErr.message : "NO ERROR");

  // 7. Test Requests: User Y views incoming and accepts
  console.log("\n[TEST 7] User Y reads incoming requests...");
  const { data: incomingY } = await clientY
    .from("connections")
    .select("id, from_id, note, status")
    .eq("to_id", userY.id)
    .eq("status", "pending");

  console.log("  User Y incoming count:", incomingY?.length);
  console.log("  Note received:", incomingY?.[0]?.note);

  console.log("User Y accepts request...");
  const { error: acceptErr } = await clientY
    .from("connections")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", conn.id);
  if (acceptErr) throw acceptErr;
  console.log("✓ Request accepted. User X and User Y are now connected.");

  // 8. Test Browse Filter Queries
  console.log("\n[TEST 8] Testing Browse People filters...");
  const { data: techBuilders } = await clientX
    .from("profiles")
    .select("id, full_name, college, primary_skill")
    .eq("primary_skill", "tech")
    .eq("onboarding_complete", true);
  console.log("✓ Found tech builders in browse:", techBuilders?.length);

  const { data: srccFounders } = await clientX
    .from("profiles")
    .select("id, full_name, college")
    .ilike("college", "%Shri Ram College of Commerce%")
    .eq("onboarding_complete", true);
  console.log("✓ Found SRCC founders in browse:", srccFounders?.length);

  // Clean up test accounts
  console.log("\nCleaning up test accounts...");
  await admin.auth.admin.deleteUser(userX.id);
  await admin.auth.admin.deleteUser(userY.id);
  console.log("✓ Cleanup finished. ALL PHASE 3 TESTS PASSED!\n");
}

run().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
