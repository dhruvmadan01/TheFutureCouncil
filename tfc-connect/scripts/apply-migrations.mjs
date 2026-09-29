import pg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pg;

async function run() {
  const client = new Client({
    host: "db.fwwbybbjvchrhozzzigp.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "Thefuturecouncil0101@#&",
    ssl: { rejectUnauthorized: false },
  });

  console.log("Connecting to Postgres at db.fwwbybbjvchrhozzzigp.supabase.co...");
  await client.connect();
  console.log("✓ Connected successfully.");

  // Check if legacy empty startups table exists and drop it safely
  const checkStartups = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'startups' AND table_schema = 'public';");
  if (parseInt(checkStartups.rows[0].count) > 0) {
    const rowCount = await client.query("SELECT count(*) FROM startups;");
    if (parseInt(rowCount.rows[0].count) === 0) {
      console.log("Dropping empty legacy 'startups' table to allow 0001_init.sql schema...");
      await client.query("DROP TABLE public.startups CASCADE;");
      console.log("✓ Dropped empty legacy startups table.");
    }
  }

  const migrationDir = path.resolve("./supabase/migrations");
  const initSql = fs.readFileSync(path.join(migrationDir, "0001_init.sql"), "utf8");
  const storageSql = fs.readFileSync(path.join(migrationDir, "0002_storage_and_cron.sql"), "utf8");
  const seedSql = fs.readFileSync(path.resolve("./supabase/seed.sql"), "utf8");

  // 1. Run 0001_init.sql
  console.log("Running 0001_init.sql...");
  await client.query(initSql);
  console.log("✓ 0001_init.sql applied successfully.");

  // 2. Run 0002_storage_and_cron.sql
  console.log("Running 0002_storage_and_cron.sql...");
  try {
    await client.query("select cron.unschedule('tfc-daily-matches');");
    await client.query("select cron.unschedule('tfc-expire-requests');");
  } catch (e) {
    // Ignore if not scheduled yet
  }
  await client.query(storageSql);
  console.log("✓ 0002_storage_and_cron.sql applied successfully.");

  // 3. Run seed.sql
  console.log("Running seed.sql...");
  await client.query(seedSql);
  console.log("✓ seed.sql applied successfully.");

  // 4. Reload PostgREST schema cache so REST API sees the new tables immediately
  console.log("Notifying PostgREST to reload schema cache...");
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log("✓ PostgREST schema cache reloaded.");

  await client.end();
  console.log("🎉 All migrations and seed data applied successfully!");
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
