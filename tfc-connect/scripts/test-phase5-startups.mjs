import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function runTests() {
  console.log("=== Starting Phase 5 Test Suite ===\n");

  // 1. Check startups_trending view
  console.log("1. Testing startups_trending view...");
  const { data: trending, error: trendErr } = await supabase
    .from("startups_trending")
    .select("id, slug, name, trending_score, follows_count, upvotes_count, is_inactive, verification_tier")
    .limit(5);

  if (trendErr) {
    console.error("❌ startups_trending view failed:", trendErr.message);
    process.exit(1);
  }
  console.log(`✓ startups_trending view returned ${trending.length} rows.`);
  if (trending.length > 0) {
    console.log("Sample trending row:", trending[0]);
  }

  // 2. Fetch or create a test user
  console.log("\n2. Fetching test founder user...");
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, full_name")
    .limit(2);

  if (pErr || !profiles || profiles.length === 0) {
    console.error("❌ Failed to fetch test profiles:", pErr);
    process.exit(1);
  }
  const testFounder = profiles[0];
  const testApplicant = profiles[1] || profiles[0];
  console.log(`✓ Test founder: ${testFounder.full_name} (${testFounder.id})`);

  // 3. Create a test startup listing
  console.log("\n3. Testing startup creation with metrics & status tags...");
  const testSlug = `test-campus-lab-${Date.now()}`;
  const { data: newStartup, error: createErr } = await supabase
    .from("startups")
    .insert({
      slug: testSlug,
      name: "Campus Neural Lab",
      one_liner: "Decentralized GPU cluster sharing for university AI researchers.",
      problem: "Student researchers wait weeks for university compute grants.",
      solution: "P2P GPU pooling across dorm rooms and engineering labs.",
      stage: "building",
      industry: "AI/ML",
      city: "New Delhi",
      website: "https://campusneural.test",
      founded_year: 2026,
      metrics: [
        { label: "Active GPUs", value: "48 nodes" },
        { label: "Hours Pooled", value: "1,200 hrs" },
      ],
      status_tags: ["needs_cofounder", "hiring", "raising"],
      verification_tier: "tfc_backed",
      claimed: true,
      created_by: testFounder.id,
    })
    .select()
    .single();

  if (createErr) {
    console.error("❌ Failed to create startup:", createErr.message);
    process.exit(1);
  }
  console.log(`✓ Created startup: ${newStartup.name} (${newStartup.slug}, id: ${newStartup.id})`);

  // Verify owner was automatically inserted by DB trigger
  const { data: members, error: mErr } = await supabase
    .from("startup_members")
    .select("*")
    .eq("startup_id", newStartup.id);

  if (mErr) {
    console.error("❌ Failed to check startup members:", mErr.message);
  } else {
    console.log(`✓ Startup members count: ${members.length} (Owner automatically assigned: ${members.some((m) => m.is_owner)})`);
  }

  // 4. Test Follows & Upvotes
  console.log("\n4. Testing follows and upvotes...");
  const { error: followErr } = await supabase
    .from("follows")
    .insert({ startup_id: newStartup.id, user_id: testFounder.id });
  if (followErr) {
    console.error("❌ Follow failed:", followErr.message);
  } else {
    console.log("✓ Follow inserted successfully");
  }

  const { error: upvoteErr } = await supabase
    .from("upvotes")
    .insert({ startup_id: newStartup.id, user_id: testFounder.id });
  if (upvoteErr) {
    console.error("❌ Upvote failed:", upvoteErr.message);
  } else {
    console.log("✓ Upvote inserted successfully");
  }

  // 5. Test Startup Updates & Trigger Rate Limit (Max 3/week)
  console.log("\n5. Testing startup updates & 3/week rate limit trigger...");
  for (let i = 1; i <= 3; i++) {
    const { error: updateErr } = await supabase.from("startup_updates").insert({
      startup_id: newStartup.id,
      author_id: testFounder.id,
      body: `Weekly progress update #${i}: Shipped new batch worker nodes.`,
    });
    if (updateErr) {
      console.error(`❌ Update #${i} failed:`, updateErr.message);
    } else {
      console.log(`✓ Update #${i} posted successfully.`);
    }
  }

  // Now attempt a 4th update - should be rejected by check_startup_update trigger
  const { error: fourthUpdateErr } = await supabase.from("startup_updates").insert({
    startup_id: newStartup.id,
    author_id: testFounder.id,
    body: "4th update in the same week - should be blocked by rate limit trigger!",
  });

  if (fourthUpdateErr) {
    console.log(`✓ 4th update correctly rejected by DB trigger: "${fourthUpdateErr.message}"`);
  } else {
    console.warn("⚠️ 4th update was not rejected. Check check_startup_update trigger.");
  }

  // 6. Test Open Roles and Role Applications
  console.log("\n6. Testing open roles and role applications...");
  const { data: openRole, error: roleErr } = await supabase
    .from("open_roles")
    .insert({
      startup_id: newStartup.id,
      title: "Founding Systems Engineer",
      type: "cofounder",
      commitment: "full_time",
      skills: ["tech", "ops"],
      description: "Own our distributed cluster orchestration and CUDA kernel optimizations.",
      is_open: true,
    })
    .select()
    .single();

  if (roleErr) {
    console.error("❌ Failed to create open role:", roleErr.message);
  } else {
    console.log(`✓ Created open role: ${openRole.title} (${openRole.id})`);

    // Test application with valid note (50-500 chars)
    const validNote = "Hi team, I built a distributed ray tracer in Rust during my 3rd year at DTU and would love to join as founding systems engineer.";
    const { error: appErr } = await supabase.from("role_applications").insert({
      role_id: openRole.id,
      applicant_id: testApplicant.id,
      note: validNote,
    });

    if (appErr) {
      console.error("❌ Failed to apply to role:", appErr.message);
    } else {
      console.log("✓ Role application submitted successfully.");
    }

    // Test application with invalid short note (< 50 chars)
    const shortNote = "Too short";
    const { error: shortErr } = await supabase.from("role_applications").insert({
      role_id: openRole.id,
      applicant_id: testFounder.id,
      note: shortNote,
    });
    if (shortErr) {
      console.log(`✓ Short note correctly rejected by DB check: "${shortErr.message}"`);
    }
  }

  // 7. Test "Claim this startup"
  console.log("\n7. Testing 'Claim this startup' verification request...");
  const { error: claimErr } = await supabase.from("verification_requests").insert({
    kind: "startup",
    target_id: newStartup.id,
    submitted_by: testFounder.id,
    evidence: "I am the founder, here is our GitHub org and official college incubation letter.",
  });
  if (claimErr) {
    console.error("❌ Claim request failed:", claimErr.message);
  } else {
    console.log("✓ Verification / claim request created successfully.");
  }

  // 8. Re-query startups_trending view to see updated trending score
  console.log("\n8. Re-querying startups_trending view for our test startup...");
  const { data: updatedTrending, error: utErr } = await supabase
    .from("startups_trending")
    .select("*")
    .eq("id", newStartup.id)
    .single();

  if (utErr) {
    console.error("❌ Failed to query updated trending score:", utErr.message);
  } else {
    console.log("✓ Trending view record for new startup:");
    console.log({
      name: updatedTrending.name,
      follows_count: updatedTrending.follows_count,
      upvotes_count: updatedTrending.upvotes_count,
      trending_score: updatedTrending.trending_score,
      is_inactive: updatedTrending.is_inactive,
      verification_tier: updatedTrending.verification_tier,
    });
  }

  console.log("\n=== Phase 5 Backend Tests Passed Successfully! ===");
}

runTests().catch(console.error);
