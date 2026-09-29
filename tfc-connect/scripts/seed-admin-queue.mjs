import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: admin } = await s.from("profiles").select("id").eq("is_admin", true).limit(1).single();
  const { data: startups } = await s.from("startups").select("id, name, slug");
  const { data: profiles } = await s.from("profiles").select("id, full_name");

  const greenbin = startups?.find((st) => st.slug.includes("greenbin")) || startups?.[0];
  const feeflow = startups?.find((st) => st.slug.includes("feeflow")) || startups?.[1];
  const kabir = profiles?.find((p) => p.full_name?.includes("Kabir")) || profiles?.[2];

  if (greenbin && admin) {
    await s.from("verification_requests").insert({
      kind: "startup",
      target_id: greenbin.id,
      submitted_by: admin.id,
      evidence: "Live on greenbin.in · DU canteen waste collection pilot.",
      status: "pending",
      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    });
  }

  if (kabir && admin) {
    await s.from("verification_requests").insert({
      kind: "profile",
      target_id: kabir.id,
      submitted_by: kabir.id,
      evidence: "Chapter code TFC-AMITY-02 · Amity University.",
      status: "pending",
      created_at: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
    });
  }

  if (feeflow && admin) {
    await s.from("verification_requests").insert({
      kind: "startup",
      target_id: feeflow.id,
      submitted_by: admin.id,
      evidence: "No working link yet · UPI collection gateway for offline coaching.",
      status: "pending",
      created_at: new Date(Date.now() - 31 * 3600 * 1000).toISOString(),
    });
  }

  if (admin && startups?.[0]) {
    await s.from("reports").insert([
      {
        reporter_id: admin.id,
        target_type: "profile",
        target_id: profiles?.[3]?.id || admin.id,
        reason: "spam",
        details: "User sending the same note to 40 people across different universities without customizing.",
        status: "pending",
      },
      {
        reporter_id: admin.id,
        target_type: "startup",
        target_id: startups[0].id,
        reason: "fake",
        details: "Startup link is a cloned template site with placeholder stock photos.",
        status: "pending",
      },
    ]);
  }

  console.log("✓ Illustrative admin items seeded successfully.");
}

run().catch(console.error);
