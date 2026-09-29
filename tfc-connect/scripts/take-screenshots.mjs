import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const artifactDir = "C:\\Users\\Dhruv Madan\\.gemini\\antigravity-ide\\brain\\033d9506-24bf-42de-83f7-0773f4f37381";
const localDir = "C:\\Users\\Dhruv Madan\\Desktop\\The future council\\tfc-connect\\public\\screenshots";

if (!fs.existsSync(localDir)) {
  fs.mkdirSync(localDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  // 1. Desktop 1280px
  console.log("Capturing 1280px desktop screenshot...");
  await page.setViewport({ width: 1280, height: 1200, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3001/styleguide", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "styleguide_1280px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "styleguide_1280px.png"),
    fullPage: false,
  });

  // 2. Mobile 390px
  console.log("Capturing 390px mobile screenshot...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3001/styleguide", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "styleguide_390px.png"),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(localDir, "styleguide_390px.png"),
    fullPage: false,
  });

  // 3. Mobile with Sheet Open
  console.log("Opening bottom sheet and capturing 390px sheet screenshot...");
  const sheetTrigger = await page.$("button[data-slot='sheet-trigger']");
  if (sheetTrigger) {
    await sheetTrigger.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(artifactDir, "styleguide_sheet_390px.png"),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(localDir, "styleguide_sheet_390px.png"),
      fullPage: false,
    });
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
