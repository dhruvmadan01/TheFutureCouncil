import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const artifactDir = "C:\\Users\\Dhruv Madan\\.gemini\\antigravity-ide\\brain\\033d9506-24bf-42de-83f7-0773f4f37381";
const localDir = "C:\\Users\\Dhruv Madan\\Desktop\\The future council\\tfc-connect\\public\\screenshots";

if (!fs.existsSync(localDir)) {
  fs.mkdirSync(localDir, { recursive: true });
}

async function run() {
  console.log("Authenticating demo founder...");
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: "demo_founder@tfc.internal",
    password: "DemoFounderPass123!#",
  });

  if (authErr) {
    console.error("Auth error:", authErr);
    process.exit(1);
  }

  const session = authData.session;
  const projectRef = "fwwbybbjvchrhozzzigp";
  const cookieName = `sb-${projectRef}-auth-token`;
  const rawSession = JSON.stringify(session);
  const b64Session = "base64-" + Buffer.from(rawSession).toString("base64");

  const chunkSize = 3180;
  const cookiesToSet = [];

  if (b64Session.length <= chunkSize) {
    cookiesToSet.push({
      name: cookieName,
      value: b64Session,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
    });
  } else {
    let index = 0;
    for (let i = 0; i < b64Session.length; i += chunkSize) {
      cookiesToSet.push({
        name: `${cookieName}.${index}`,
        value: b64Session.substring(i, i + chunkSize),
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
      });
      index++;
    }
  }

  // Get a startup slug to view
  const { data: startups } = await supabase
    .from("startups")
    .select("slug")
    .order("created_at", { ascending: false })
    .limit(1);

  const sampleSlug = startups?.[0]?.slug || "kisanlink";
  console.log(`Using sample startup slug: ${sampleSlug}`);

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setCookie(...cookiesToSet);

  // 1. Directory Desktop (1280px)
  console.log("Capturing 1. Startups Directory Desktop (1280px)...");
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3001/startups", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "startups_directory_desktop_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "startups_directory_desktop_1280px.png"),
    fullPage: false,
  });

  // 2. Directory Mobile (390px)
  console.log("Capturing 2. Startups Directory Mobile (390px)...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto("http://localhost:3001/startups", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "startups_directory_mobile_390px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "startups_directory_mobile_390px.png"),
    fullPage: false,
  });

  // 3. Startup Detail Desktop (1280px)
  console.log(`Capturing 3. Startup Detail Desktop (1280px) for /startups/${sampleSlug}...`);
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2, isMobile: false });
  await page.goto(`http://localhost:3001/startups/${sampleSlug}`, { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "startup_detail_desktop_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "startup_detail_desktop_1280px.png"),
    fullPage: false,
  });

  // 4. Startup Detail Mobile (390px)
  console.log(`Capturing 4. Startup Detail Mobile (390px) for /startups/${sampleSlug}...`);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto(`http://localhost:3001/startups/${sampleSlug}`, { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "startup_detail_mobile_390px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "startup_detail_mobile_390px.png"),
    fullPage: false,
  });

  // 5. List Your Startup Wizard Desktop (1280px)
  console.log("Capturing 5. List Your Startup Wizard Desktop (1280px)...");
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2, isMobile: false });
  await page.goto("http://localhost:3001/startups/new", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "startup_wizard_desktop_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "startup_wizard_desktop_1280px.png"),
    fullPage: false,
  });

  // 6. List Your Startup Wizard Mobile (390px)
  console.log("Capturing 6. List Your Startup Wizard Mobile (390px)...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto("http://localhost:3001/startups/new", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "startup_wizard_mobile_390px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "startup_wizard_mobile_390px.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("\n✓ All Phase 5 screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
