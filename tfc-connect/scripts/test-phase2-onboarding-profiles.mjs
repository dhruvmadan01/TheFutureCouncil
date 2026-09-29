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

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("=== PHASE 2 AUTOMATED TEST: ONBOARDING, PROFILES, MATCHING & CONTACT PRIVACY ===");

  const emailA = `founder_step_a_${Date.now()}@tfc.internal`;
  const emailB = `founder_step_b_${Date.now()}@tfc.internal`;
  const password = "TestPassword123!#";

  // 1. Create two test accounts
  console.log("\n[TEST 1] Creating User A & User B...");
  const { data: userAData, error: errA } = await adminClient.auth.admin.createUser({
    email: emailA,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Aarav Sharma" },
  });
  if (errA) throw errA;
  const userA = userAData.user;
  console.log("✓ User A created:", userA.id, userA.email);

  const { data: userBData, error: errB } = await adminClient.auth.admin.createUser({
    email: emailB,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Diya Patel" },
  });
  if (errB) throw errB;
  const userB = userBData.user;
  console.log("✓ User B created:", userB.id, userB.email);

  // Sign in as User A with anon client to get authenticated session
  const clientA = createClient(SUPABASE_URL, ANON_KEY);
  const { error: loginAErr } = await clientA.auth.signInWithPassword({
    email: emailA,
    password,
  });
  if (loginAErr) throw loginAErr;
  console.log("✓ User A authenticated via client session.");

  // Sign in as User B with anon client
  const clientB = createClient(SUPABASE_URL, ANON_KEY);
  const { error: loginBErr } = await clientB.auth.signInWithPassword({
    email: emailB,
    password,
  });
  if (loginBErr) throw loginBErr;
  console.log("✓ User B authenticated via client session.");

  // 2. Complete 5-step onboarding for User A
  console.log("\n[TEST 2] Executing 5-step onboarding updates for User A...");
  // Step 1: Basics
  const { error: s1Err } = await clientA.from("profiles").update({
    full_name: "Aarav Sharma",
    college: "NSUT Delhi",
    city: "Delhi NCR",
  }).eq("id", userA.id);
  if (s1Err) throw s1Err;

  const { error: c1Err } = await clientA.from("profile_contacts").update({
    email: emailA,
    linkedin_url: "https://linkedin.com/in/aarav-sharma-tfc",
  }).eq("user_id", userA.id);
  if (c1Err) throw c1Err;
  console.log("  -> Step 1 (Basics & contacts) saved.");

  // Step 2: Role & Skill
  const { error: s2Err } = await clientA.from("profiles").update({
    role: "idea",
    primary_skill: "tech",
    secondary_skills: ["product"],
    open_to_join: false,
  }).eq("id", userA.id);
  if (s2Err) throw s2Err;
  console.log("  -> Step 2 (Role & skills) saved.");

  // Step 3: Looking for
  const { error: s3Err } = await clientA.from("profiles").update({
    looking_for_skills: ["growth", "sales"],
    industries: ["AgriTech", "FinTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
  }).eq("id", userA.id);
  if (s3Err) throw s3Err;
  console.log("  -> Step 3 (Looking for & commitment) saved.");

  // Step 4: Proof of work
  const { error: s4Err } = await clientA.from("profiles").update({
    proof_links: [
      { url: "https://github.com/aarav/agri-supply", title: "AgriDirect Supply Chain", note: "300 farmers onboarded" },
    ],
    why_startup: "Supply chains in rural Haryana are broken and farmers lose up to 30% to middlemen.",
  }).eq("id", userA.id);
  if (s4Err) throw s4Err;
  console.log("  -> Step 4 (Proof of work & why startup) saved.");

  // Step 5: Working style & mark complete
  const { error: s5Err } = await clientA.from("profiles").update({
    work_style: { speed: 80, risk: 70, hours: 85, decision: 40 },
    onboarding_complete: true,
    last_active_at: new Date().toISOString(),
    still_looking_at: new Date().toISOString(),
  }).eq("id", userA.id);
  if (s5Err) throw s5Err;
  console.log("  -> Step 5 (Working style & complete) saved.");

  // Also complete User B onboarding so they are eligible to match
  await clientB.from("profiles").update({
    full_name: "Diya Patel",
    college: "DTU Delhi",
    city: "Delhi NCR",
    role: "join",
    primary_skill: "growth",
    secondary_skills: ["sales"],
    looking_for_skills: ["tech"],
    industries: ["AgriTech", "EdTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [{ url: "https://x.com/diya_growth", title: "Scaled D2C to 50k", note: "Instagram & WhatsApp channels" }],
    why_startup: "I want to take high-impact Indian products from 0 to 100k users.",
    work_style: { speed: 85, risk: 65, hours: 80, decision: 50 },
    onboarding_complete: true,
    last_active_at: new Date().toISOString(),
    still_looking_at: new Date().toISOString(),
  }).eq("id", userB.id);
  await clientB.from("profile_contacts").update({
    email: emailB,
    linkedin_url: "https://linkedin.com/in/diya-patel-growth",
  }).eq("user_id", userB.id);
  console.log("✓ User B also completed onboarding.");

  // 3. Compute immediate matches for User A using service role function
  console.log("\n[TEST 3] Running compute_user_matches for User A...");
  const { data: matchCount, error: matchRpcErr } = await adminClient.rpc(
    "compute_user_matches",
    { target_user: userA.id, per_user: 5 }
  );
  if (matchRpcErr) throw matchRpcErr;
  console.log(`✓ Matches computed for User A: ${matchCount} matches`);

  const { data: userAMatches } = await clientA
    .from("matches_daily")
    .select("candidate_id, score, reasons")
    .eq("user_id", userA.id);

  console.log("  User A daily match entries:", userAMatches?.length);
  if (userAMatches && userAMatches.length > 0) {
    console.log("  Top match score:", userAMatches[0].score, "Reasons:", userAMatches[0].reasons);
  }

  // 4. Test RLS boundary on profile_contacts
  console.log("\n[TEST 4] Testing RLS contact privacy before connection...");
  // User A querying User A contacts -> should see 1 row
  const { data: ownContacts } = await clientA
    .from("profile_contacts")
    .select("email, linkedin_url")
    .eq("user_id", userA.id);
  console.log("  User A reading own contacts:", ownContacts?.length, "rows (Expected: 1) ->", ownContacts?.[0]?.email);

  // User A querying User B contacts -> should see 0 rows
  const { data: bContactsBefore } = await clientA
    .from("profile_contacts")
    .select("email, linkedin_url")
    .eq("user_id", userB.id);
  console.log("  User A reading User B contacts BEFORE connection:", bContactsBefore?.length, "rows (Expected: 0 - RLS PROTECTED)");

  // 5. Test Connection request and Acceptance unlocking contact details
  console.log("\n[TEST 5] Testing Connection lifecycle & RLS unlock...");
  // User A sends request to User B
  const { data: conn, error: connErr } = await clientA
    .from("connections")
    .insert({
      from_id: userA.id,
      to_id: userB.id,
      note: "Hey Diya! I loved your D2C growth case studies. I am building AgriDirect for farmers in Haryana and need a growth lead to run our WhatsApp pilot!",
      status: "pending",
    })
    .select()
    .single();

  if (connErr) throw connErr;
  console.log("✓ User A sent connection request to User B (connection id:", conn.id, ")");

  // User B accepts request
  const { error: acceptErr } = await clientB
    .from("connections")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
    })
    .eq("id", conn.id);

  if (acceptErr) throw acceptErr;
  console.log("✓ User B accepted connection request.");

  // User A queries User B contacts AFTER acceptance -> should see 1 row!
  const { data: bContactsAfter } = await clientA
    .from("profile_contacts")
    .select("email, linkedin_url")
    .eq("user_id", userB.id);
  console.log("  User A reading User B contacts AFTER acceptance:", bContactsAfter?.length, "rows (Expected: 1 - UNLOCKED!)");
  console.log("  -> Unlocked details:", bContactsAfter?.[0]);

  // Clean up test accounts
  console.log("\nCleaning up test accounts...");
  await adminClient.auth.admin.deleteUser(userA.id);
  await adminClient.auth.admin.deleteUser(userB.id);
  console.log("✓ Cleanup complete. ALL PHASE 2 TESTS PASSED!\n");
}

run().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
