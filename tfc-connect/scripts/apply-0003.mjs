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

  console.log("Connecting to Postgres...");
  await client.connect();
  console.log("Connected.");

  const sqlPath = path.resolve("./supabase/migrations/0003_compute_user_matches.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("Applying 0003_compute_user_matches.sql...");
  await client.query(sql);
  console.log("Applied successfully.");

  console.log("Notifying PostgREST to reload schema cache...");
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log("Schema cache reloaded.");

  await client.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
