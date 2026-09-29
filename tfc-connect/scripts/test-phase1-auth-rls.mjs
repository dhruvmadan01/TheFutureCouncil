import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Load from environment or fall back to .env.local
function getEnv(key) {
  if (process.env[key]) return process.env[key];
  const envFile = new URL("../.env.local", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
  if (fs.existsSync(envFile)) {
    const match = fs.readFileSync(envFile, "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
    if (match) return match[1].trim();
  }
  throw new Error(`Missing env var: ${key}. Set it in .env.local or your shell.`);
}

const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

const adminSupabase = createClient(url, serviceRoleKey);

async function runTest() {
  console.log("=== PHASE 1 TEST: 2 ACCOUNTS, PROFILES TRIGGER & CONTACT PRIVACY RLS ===");

  const emailA = `test_founder_a_${Date.now()}@du.ac.in`;
  const emailB = `test_builder_b_${Date.now()}@iitm.ac.in`;
  const password = "TestPassword123!@#";

  // 1. Create Account A
  console.log(`\n1. Creating Account A: ${emailA}...`);
  const { data: userAData, error: errA } = await adminSupabase.auth.admin.createUser({
    email: emailA,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: "Rohan Mehta", college: "University of Delhi" },
  });
  if (errA) throw new Error("Failed to create User A: " + errA.message);
  const userA = userAData.user;
  console.log(`✓ User A created (ID: ${userA.id})`);

  // 2. Create Account B
  console.log(`\n2. Creating Account B: ${emailB}...`);
  const { data: userBData, error: errB } = await adminSupabase.auth.admin.createUser({
    email: emailB,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: "Ananya Kapoor", college: "IIT Madras" },
  });
  if (errB) throw new Error("Failed to create User B: " + errB.message);
  const userB = userBData.user;
  console.log(`✓ User B created (ID: ${userB.id})`);

  // 3. Verify profiles row auto-created by trigger
  console.log("\n3. Verifying profiles rows auto-created by database trigger...");
  const { data: profileA } = await adminSupabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", userA.id)
    .single();

  const { data: profileB } = await adminSupabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", userB.id)
    .single();

  console.log("Profile A in database:", profileA);
  console.log("Profile B in database:", profileB);

  if (!profileA || !profileB) {
    throw new Error("Trigger on_auth_user_created failed to create profiles rows!");
  }
  console.log("✓ Both accounts successfully have matching profiles rows.");

  // 4. Test RLS boundary on profile_contacts
  console.log("\n4. Testing RLS Privacy: Sign in as User A and verify contact isolation...");
  const clientA = createClient(url, anonKey);
  const { data: sessionA, error: loginErr } = await clientA.auth.signInWithPassword({
    email: emailA,
    password: password,
  });
  if (loginErr) throw new Error("Login as User A failed: " + loginErr.message);

  // User A reads their own contacts
  const { data: ownContacts, error: ownErr } = await clientA
    .from("profile_contacts")
    .select("email, phone, linkedin_url")
    .eq("user_id", userA.id);

  console.log("User A reading OWN profile_contacts:", ownContacts, ownErr ? "Error: " + ownErr.message : "✓ Success");

  // User A attempts to read User B's contacts
  const { data: foreignContacts, error: foreignErr } = await clientA
    .from("profile_contacts")
    .select("email, phone, linkedin_url")
    .eq("user_id", userB.id);

  console.log("User A attempting to read USER B's profile_contacts:", foreignContacts);

  if (foreignContacts && foreignContacts.length === 0) {
    console.log("🔒 RLS ENFORCED: User A received 0 rows when attempting to read User B's private contacts!");
  } else {
    throw new Error("SECURITY FAILURE: User A was able to read User B's contacts!");
  }

  // 5. Cleanup test users
  console.log("\n5. Cleaning up test users...");
  await adminSupabase.auth.admin.deleteUser(userA.id);
  await adminSupabase.auth.admin.deleteUser(userB.id);
  console.log("✓ Test users cleaned up.");

  console.log("\n🎉 ALL PHASE 1 TESTS PASSED SUCCESSFULLY!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
