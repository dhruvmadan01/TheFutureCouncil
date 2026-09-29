import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const artifactDir = "C:\\Users\\Dhruv Madan\\.gemini\\antigravity-ide\\brain\\033d9506-24bf-42de-83f7-0773f4f37381";
const localDir = "C:\\Users\\Dhruv Madan\\Desktop\\The future council\\tfc-connect\\public\\screenshots";

if (!fs.existsSync(localDir)) {
  fs.mkdirSync(localDir, { recursive: true });
}

async function run() {
  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  // 1. Desktop Viewport (1280x950)
  console.log("1. Capturing Desktop Landing Hero (1280px)...");
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });
  const startT = Date.now();
  await page.goto("http://localhost:3001/", { waitUntil: "networkidle0" });
  const loadT = Date.now() - startT;
  console.log(`✓ Desktop page loaded in ${loadT}ms`);

  await page.screenshot({
    path: path.join(artifactDir, "landing_desktop_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "landing_desktop_1280px.png"),
    fullPage: false,
  });

  // Desktop Full Page
  console.log("2. Capturing Desktop Landing Full Page (1280px)...");
  await page.screenshot({
    path: path.join(artifactDir, "landing_desktop_full_1280px.png"),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(localDir, "landing_desktop_full_1280px.png"),
    fullPage: true,
  });

  // 3. Mobile Viewport (390x844)
  console.log("3. Capturing Mobile Landing Hero (390px)...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto("http://localhost:3001/", { waitUntil: "networkidle0" });

  await page.screenshot({
    path: path.join(artifactDir, "landing_mobile_390px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "landing_mobile_390px.png"),
    fullPage: false,
  });

  // Mobile Full Page
  console.log("4. Capturing Mobile Landing Full Page (390px)...");
  await page.screenshot({
    path: path.join(artifactDir, "landing_mobile_full_390px.png"),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(localDir, "landing_mobile_full_390px.png"),
    fullPage: true,
  });

  // Performance metrics
  const perfMetrics = await page.evaluate(() => {
    const timing = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");
    const fcp = paint.find((p) => p.name === "first-contentful-paint");
    return {
      domContentLoaded: timing ? Math.round(timing.domContentLoadedEventEnd - timing.startTime) : null,
      loadComplete: timing ? Math.round(timing.loadEventEnd - timing.startTime) : null,
      fcp: fcp ? Math.round(fcp.startTime) : null,
    };
  });
  console.log("✓ Web Vitals Performance Metrics:", perfMetrics);

  await browser.close();
  console.log("\n✓ All Landing Page screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
