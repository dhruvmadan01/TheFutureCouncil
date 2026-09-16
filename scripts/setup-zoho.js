require('dotenv').config();
const handler = require('../api/zoho-sync.js');

const cmd = process.argv[2] || 'status';

function runAction(action, body = {}) {
  const req = {
    method: 'POST',
    query: { action },
    body: body,
    headers: {}
  };

  const res = {
    setHeader: () => {},
    status: (code) => ({
      json: (data) => {
        console.log(`[HTTP ${code}]`, JSON.stringify(data, null, 2));
      },
      end: () => console.log(`[HTTP ${code} END]`)
    })
  };

  handler(req, res);
}

if (cmd === 'status') {
  console.log('Testing Zoho CRM Connection Status...');
  runAction('status');
} else if (cmd === 'sync') {
  console.log('Starting full database sync from Supabase to Zoho CRM...');
  runAction('sync_all');
} else if (cmd === 'test') {
  console.log('Sending test lead to Zoho CRM...');
  runAction('upsert_lead', {
    name: 'CLI Test Founder',
    email: 'clitest@thefuturecouncil.in',
    phone: '+919876543210',
    college: 'IIT Delhi, 4th Year',
    tier: 'Founder',
    source: 'CLI Test',
    details: { note: 'Zoho CRM integration verification' }
  });
} else {
  console.log('Usage: node scripts/setup-zoho.js [status|sync|test]');
}
