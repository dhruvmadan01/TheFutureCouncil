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
  console.log("Authenticating demo founder (admin)...");
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

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setCookie(...cookiesToSet);

  // 1. Admin Overview (Desktop 1280px)
  console.log("1. Capturing Admin Overview Desktop (1280px)...");
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3001/admin", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "admin_overview_desktop_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "admin_overview_desktop_1280px.png"),
    fullPage: false,
  });

  // 2. Admin Verification Queue (Desktop 1280px)
  console.log("2. Capturing Admin Verification Queue Desktop (1280px)...");
  // Click on Verification tab
  const buttons = await page.$$("aside nav button");
  if (buttons[1]) {
    await buttons[1].click();
    await new Promise((r) => setTimeout(r, 600));
  }
  await page.screenshot({
    path: path.join(artifactDir, "admin_verification_desktop_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "admin_verification_desktop_1280px.png"),
    fullPage: false,
  });

  // 3. Admin Collections Editor (Desktop 1280px)
  console.log("3. Capturing Admin Collections Editor Desktop (1280px)...");
  if (buttons[3]) {
    await buttons[3].click();
    await new Promise((r) => setTimeout(r, 600));
  }
  await page.screenshot({
    path: path.join(artifactDir, "admin_collections_desktop_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "admin_collections_desktop_1280px.png"),
    fullPage: false,
  });

  // 4. Admin Overview Mobile (390px)
  console.log("4. Capturing Admin Overview Mobile (390px)...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto("http://localhost:3001/admin", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "admin_overview_mobile_390px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "admin_overview_mobile_390px.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("\n✓ All Admin screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
