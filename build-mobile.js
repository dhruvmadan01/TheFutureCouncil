const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

// List of files to copy into www
const filesToCopy = [
  'style.css',
  'script.js',
  'TFC.png',
  'dhruv.jpeg',
  'aryaveer.jpeg',
  'dugate.png',
  'office.jpg',
  'join now.png',
  'tfc-logo.svg',
  'join.html',
  'partners.html',
  'fellowship.html',
  'branches.html',
  'admin.html',
  'marketing.html',
  'ambassador.html',
  'join-ambassador.html',
  'data.html',
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

// Copy index.html as the primary Capacitor app entrypoint
const indexHtmlSrc = path.join(__dirname, 'index.html');
const indexHtmlDest = path.join(wwwDir, 'index.html');
fs.copyFileSync(indexHtmlSrc, indexHtmlDest);
console.log('Set index.html as www/index.html (app entrypoint)');
console.log('Mobile assets preparation complete!');
