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

  // Chunking if needed
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

  console.log(`Setting ${cookiesToSet.length} session cookie(s)...`);

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setCookie(...cookiesToSet);

  // 1. Template: Trial sprint (Desktop)
  console.log("Capturing template: trial project sprint...");
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3001/templates/trial-project-sprint.html", {
    waitUntil: "networkidle0",
  });
  await page.screenshot({
    path: path.join(artifactDir, "template_trial_sprint_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "template_trial_sprint_1280px.png"),
    fullPage: false,
  });

  // 2. Template: Co-founder agreement (Desktop)
  console.log("Capturing template: co-founder agreement...");
  await page.goto("http://localhost:3001/templates/cofounder-agreement.html", {
    waitUntil: "networkidle0",
  });
  await page.screenshot({
    path: path.join(artifactDir, "template_cofounder_agreement_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "template_cofounder_agreement_1280px.png"),
    fullPage: false,
  });

  // 3. /messages thread (Desktop 1280px)
  console.log("Capturing /messages on desktop 1280px...");
  await page.goto("http://localhost:3001/messages", {
    waitUntil: "networkidle0",
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(artifactDir, "messages_desktop_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "messages_desktop_1280px.png"),
    fullPage: false,
  });

  // 4. /messages thread (Mobile 390px - Chat tab)
  console.log("Capturing /messages on mobile 390px (Chat tab)...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(artifactDir, "messages_mobile_chat_390px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "messages_mobile_chat_390px.png"),
    fullPage: false,
  });

  // 5. /messages mobile - Click Fit Kit tab
  console.log("Switching to Fit Kit tab on mobile...");
  const fitkitTabButton = await page.$("button::-p-text(Fit Kit)");
  if (fitkitTabButton) {
    await fitkitTabButton.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(artifactDir, "messages_mobile_fitkit_390px.png"),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(localDir, "messages_mobile_fitkit_390px.png"),
      fullPage: false,
    });
  }

  await browser.close();
  console.log("✓ All screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
