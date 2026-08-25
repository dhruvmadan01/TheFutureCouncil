const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

// List of files to copy into www
const filesToCopy = [
  'app.html',
  'app.css',
  'app.js',
  'style.css',
  'script.js',
  'TFC.png',
  'dhruv.jpeg',
  'aryaveer.jpeg',
  'dugate.png',
  'office.jpg',
  'join now.png',
  'tfc-logo.svg',
  'membership.html',
  'startups.html',
  'join.html',
  'partners.html',
  'admin.html',
  'marketing.html',
  'sales.html',
  'version.json',
  'TheFutureCouncil.apk',
  'download.html'
];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(wwwDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to www/`);
  }
}

// Copy app.html as index.html so the Android app boots directly to the Member App!
const appHtmlSrc = path.join(__dirname, 'app.html');
const indexHtmlDest = path.join(wwwDir, 'index.html');
fs.copyFileSync(appHtmlSrc, indexHtmlDest);
console.log('Set app.html as www/index.html (app entrypoint)');

// Also preserve original index.html as hub.html
const origIndexSrc = path.join(__dirname, 'index.html');
const hubHtmlDest = path.join(wwwDir, 'hub.html');
if (fs.existsSync(origIndexSrc)) {
  fs.copyFileSync(origIndexSrc, hubHtmlDest);
}
console.log('Mobile assets preparation complete!');
