'use strict';
// Local preview server for Launchpad. Static site with clean URLs + the real API handler on an in-memory database.
// Fake sign-in: any bearer token "dev:<email>:<name>" is accepted. Not for production.
// Run: node scripts/dev-launchpad.js [port]

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createHandler } = require('../api/_lp/handler');
const { makeMemoryDb } = require('../api/_lp/db');

const root = path.join(__dirname, '..');
const port = Number(process.argv[2]) || 8787;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

const db = makeMemoryDb();
const ai = {
  enabled: true,
  async scoreSubmission(m, a) {
    const weak = JSON.stringify(a).includes('WEAK');
    return { passed: !weak, checklist: m.checklist.map((item) => ({ item, met: !weak, note: weak ? 'Not shown.' : 'Good.' })), feedback: weak ? 'Add specifics and a number.' : 'Clear and specific. On to the next week.' };
  },
  async rankFounder() { return { scores: { demand: 20, execution: 20, pitch: 20, momentum: 20 }, total: 80, notes: 'Solid evidence of demand.' }; }
};
const handler = createHandler({
  db,
  ai,
  verifyToken: async (t) => { const p = String(t).split(':'); return p[0] === 'dev' ? { email: p[1], name: p[2] || 'Dev User' } : null; },
  cfg: { adminEmails: ['admin@x.in'] },
  nowMs: () => (fakeNow ? Date.parse(fakeNow) : Date.now())
});
let fakeNow = process.env.LP_NOW || null; // dev only: GET /__now?v=2026-11-09T10:00:00Z moves the clock

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__now') { fakeNow = u.searchParams.get('v') || null; return res.end('ok'); }
  if (u.pathname === '/api/lp') {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      req.body = raw ? JSON.parse(raw) : {};
      req.query = Object.fromEntries(u.searchParams);
      const out = { setHeader(k, v) { res.setHeader(k, v); }, status(c) { res.statusCode = c; return this; }, send(b) { res.end(b); } };
      handler(req, out);
    });
    return;
  }
  let p = decodeURIComponent(u.pathname);
  let file = path.join(root, p);
  if (!file.startsWith(root)) { res.statusCode = 403; return res.end(); }
  const tryFiles = [file, file + '.html', path.join(file, 'index.html')];
  const hit = tryFiles.find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
  if (!hit) { res.statusCode = 404; return res.end('not found'); }
  res.setHeader('Content-Type', types[path.extname(hit)] || 'application/octet-stream');
  fs.createReadStream(hit).pipe(res);
}).listen(port, () => console.log('Launchpad dev server on http://localhost:' + port));
