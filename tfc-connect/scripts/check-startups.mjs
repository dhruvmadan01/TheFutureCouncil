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

  const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'startups';");
  console.log("Startups columns:", cols.rows);

  const count = await client.query("SELECT count(*) FROM startups;");
  console.log("Startups count:", count.rows[0].count);

  if (parseInt(count.rows[0].count) > 0) {
    const sample = await client.query("SELECT * FROM startups LIMIT 3;");
    console.log("Startups sample:", sample.rows);
  }

  await client.end();
}

run().catch(console.error);
