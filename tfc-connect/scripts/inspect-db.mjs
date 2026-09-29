import pg from "pg";

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
  await client.connect();
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  console.log("Existing tables:", tables.rows.map(r => r.table_name));

  const types = await client.query("SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');");
  console.log("Existing types:", types.rows.map(r => r.typname));

  await client.end();
}

run().catch(console.error);
