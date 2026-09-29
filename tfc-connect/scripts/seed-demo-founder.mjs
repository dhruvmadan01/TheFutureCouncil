import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  const email = "demo_founder@tfc.internal";
  const password = "DemoFounderPass123!#";

  console.log("Checking if demo founder exists...");
  const { data: usersData } = await adminClient.auth.admin.listUsers();
  let user = usersData.users.find((u) => u.email === email);

  if (!user) {
    console.log("Creating demo founder auth user...");
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Ananya Kapoor" },
    });
    if (error) throw error;
    user = data.user;
    console.log("✓ Created demo user:", user.id);
  } else {
    console.log("Found existing demo user:", user.id);
  }

  // Get NSUT Chapter
  const { data: chapter } = await adminClient
    .from("chapters")
    .select("id")
    .eq("code", "TFC-NSUT-01")
    .maybeSingle();

  // Update profile
  const { error: profileErr } = await adminClient
    .from("profiles")
    .update({
      full_name: "Ananya Kapoor",
      headline: "Full-stack developer · NSUT '27 · TFC NSUT Chapter",
      college: "NSUT Delhi",
      city: "Delhi NCR",
      chapter_id: chapter?.id || null,
      chapter_verified: true,
      role: "join",
      primary_skill: "tech",
      secondary_skills: ["product", "growth"],
      looking_for_skills: ["growth", "sales"],
      industries: ["AgriTech", "EdTech"],
      commitment: "full_time",
      remote_ok: true,
      equity_pref: "equal",
      proof_links: [
        { url: "https://github.com/ananya/mandirates", title: "MandiRates: Crop price app", note: "4k MAU · Next.js & Python" },
        { url: "https://sih.gov.in", title: "SIH '25 Finalist", note: "Logistics track 2nd place" },
      ],
      bio: "I like building for Bharat. I've spent 2 years shipping side projects and want to go all in on one.",
      why_startup: "Software should transform unorganized supply chains for 100M+ rural users.",
      work_style: { speed: 85, risk: 70, hours: 80, decision: 40 },
      onboarding_complete: true,
      last_active_at: new Date().toISOString(),
      still_looking_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileErr) throw profileErr;

  // Update contacts
  await adminClient
    .from("profile_contacts")
    .upsert({
      user_id: user.id,
      email: "ananya.kapoor@nsut.ac.in",
      linkedin_url: "https://linkedin.com/in/ananya-kapoor-tech",
      phone: "+91 98112 34567",
    });

  console.log("✓ Profile and contacts updated for demo founder (ID:", user.id, ")");
  return user.id;
}

run().catch(console.error);
