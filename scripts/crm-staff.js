#!/usr/bin/env node
/**
 * Create a staff entry for the CRM login (data.html).
 *
 *   node scripts/crm-staff.js <id> <role> "<Display name>" "<password>"
 *
 * role: admin | manager | intern
 * Paste the printed line into the STAFF list in data.html.
 *
 * IMPORTANT: this login only hides the CRM screens in the browser. The Supabase key in the page can
 * still read the `members` table, so real protection needs Supabase Auth + row-level security.
 * Change the admin password (it was previously public in this repo's history) by generating a new hash.
 */
const crypto = require('crypto');
const [id, role, name, password] = process.argv.slice(2);
if (!id || !['admin', 'manager', 'intern'].includes(role) || !name || !password) {
  console.error('Usage: node scripts/crm-staff.js <id> <admin|manager|intern> "<Display name>" "<password>"');
  process.exit(1);
}
const u = id.trim().toLowerCase();
const hash = crypto.createHash('sha256').update('tfc-crm-v2:' + u + ':' + password).digest('hex');
console.log(`    { u: '${u}', role: '${role}', name: ${JSON.stringify(name)}, hash: '${hash}' },`);
