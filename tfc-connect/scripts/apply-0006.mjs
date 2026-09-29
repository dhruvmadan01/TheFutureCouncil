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

  const sqlPath = path.resolve("./supabase/migrations/0006_startups_trending.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("Applying 0006_startups_trending.sql...");
  await client.query(sql);
  console.log("Applied successfully.");

  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log("Schema reloaded.");

  await client.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
