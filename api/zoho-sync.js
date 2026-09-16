require('dotenv').config();
const https = require('https');

let cachedAccessToken = null;
let tokenExpiresAt = 0;

// Zoho Accounts & API Domains
const ZOHO_ACCOUNTS_HOST = (process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in').replace(/^https?:\/\//, '');
const ZOHO_API_HOST = (process.env.ZOHO_API_URL || 'https://www.zohoapis.in').replace(/^https?:\/\//, '');

// Fetch or reuse active Zoho access token
async function getZohoAccessToken() {
  const now = Date.now();
  if (cachedAccessToken && tokenExpiresAt > now + 60000) {
    return cachedAccessToken;
  }

  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Zoho credentials not configured. Check ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN.');
  }

  const postData = 'grant_type=refresh_token'
    + '&client_id=' + encodeURIComponent(clientId)
    + '&client_secret=' + encodeURIComponent(clientSecret)
    + '&refresh_token=' + encodeURIComponent(refreshToken);

  const resData = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: ZOHO_ACCOUNTS_HOST,
      path: '/oauth/v2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse Zoho token response: ' + body));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  if (!resData.access_token) {
    throw new Error('Failed to refresh Zoho access token: ' + JSON.stringify(resData));
  }

  cachedAccessToken = resData.access_token;
  tokenExpiresAt = now + ((resData.expires_in || 3600) * 1000);
  return cachedAccessToken;
}

// Helper: Make authenticated HTTPS request to Zoho CRM API
function zohoApiRequest(token, method, path, data = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Authorization': 'Zoho-oauthtoken ' + token,
      'Content-Type': 'application/json'
    };

    let payload = null;
    if (data) {
      payload = typeof data === 'string' ? data : JSON.stringify(data);
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request({
      hostname: ZOHO_API_HOST,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Helper to normalize and map member data into Zoho CRM Lead structure
function formatLeadPayload(member) {
  const rawName = (member.name || '').trim();
  const nameParts = rawName.split(/\s+/);
  let firstName = '';
  let lastName = '';

  if (nameParts.length > 1) {
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ');
  } else if (nameParts.length === 1 && nameParts[0]) {
    firstName = nameParts[0];
    lastName = '(TFC)';
  } else {
    firstName = 'TFC';
    lastName = 'Member';
  }

  // Parse college / phone / metadata if formatted with pipe delimiter
  let collegeName = '';
  let phone = (member.phone || '').trim();
  let metadataLines = [];

  if (member.college && typeof member.college === 'string') {
    const parts = member.college.split(' | ');
    collegeName = parts[0] ? parts[0].trim() : '';

    parts.forEach(part => {
      const trimmed = part.trim();
      if (/^phone:\s*/i.test(trimmed)) {
        if (!phone) phone = trimmed.replace(/^phone:\s*/i, '').trim();
      } else if (!trimmed.startsWith(parts[0])) {
        metadataLines.push(trimmed);
      }
    });
  }

  if (!collegeName || collegeName === 'Ecosystem Member' || collegeName === 'Not Specified') {
    collegeName = member.tier ? `The Future Council (${member.tier})` : 'The Future Council Ecosystem';
  }

  // Build description with full profile telemetry
  const descParts = [];
  if (member.member_id) descParts.push(`Member ID: ${member.member_id}`);
  if (member.tier) descParts.push(`Tier: ${member.tier}`);
  if (member.college) descParts.push(`College / Bio: ${member.college}`);
  if (member.source) descParts.push(`Source Page: ${member.source}`);
  if (member.details) {
    descParts.push(`Additional Details: ${typeof member.details === 'object' ? JSON.stringify(member.details, null, 2) : member.details}`);
  }
  if (metadataLines.length > 0) {
    descParts.push(`Form Metadata: ${metadataLines.join(' | ')}`);
  }
  if (member.created_at) descParts.push(`Registered At: ${member.created_at}`);

  const leadRecord = {
    First_Name: firstName,
    Last_Name: lastName,
    Email: (member.email || '').trim().toLowerCase(),
    Company: collegeName.substring(0, 100),
    Lead_Source: member.source ? `Website - ${member.source}` : 'Website Registration',
    Description: descParts.join('\n\n')
  };

  if (phone) {
    leadRecord.Phone = phone.substring(0, 30);
  }
  if (member.tier) {
    leadRecord.Designation = member.tier;
  }

  return leadRecord;
}

// Main Vercel serverless handler
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = await getZohoAccessToken();
    const action = req.query.action || (req.body && req.body.action) || 'upsert_lead';

    // ACTION 1: Check status
    if (action === 'status') {
      return res.status(200).json({
        status: 'connected',
        accounts_host: ZOHO_ACCOUNTS_HOST,
        api_host: ZOHO_API_HOST,
        token_active: true
      });
    }

    // ACTION 2: Upsert single lead (e.g. from frontend form submit / Google Auth)
    if (action === 'upsert_lead') {
      const member = req.body || {};
      if (!member.email) {
        return res.status(400).json({ error: 'Email is required for Zoho CRM lead upsert.' });
      }

      const leadData = formatLeadPayload(member);

      const zohoRes = await zohoApiRequest(token, 'POST', '/crm/v6/Leads/upsert', {
        data: [leadData],
        duplicate_check_fields: ['Email']
      });

      return res.status(zohoRes.status || 200).json({
        success: zohoRes.status >= 200 && zohoRes.status < 300,
        result: zohoRes.data || zohoRes.raw
      });
    }

    // ACTION 3: Bulk sync all members from Supabase to Zoho CRM
    if (action === 'sync_all') {
      const supabaseUrl = 'https://fwwbybbjvchrhozzzigp.supabase.co';
      const supabaseKey = 'sb_publishable_f5qK_eS6qXGm5I7Em59aPQ_HvEH45h5';

      // 1. Fetch all members from Supabase
      const members = await new Promise((resolve, reject) => {
        const fetchReq = https.request(supabaseUrl + '/rest/v1/members?select=*', {
          headers: {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey
          }
        }, (res) => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(err);
            }
          });
        });
        fetchReq.on('error', reject);
        fetchReq.end();
      });

      if (!Array.isArray(members)) {
        return res.status(500).json({ error: 'Failed to fetch members from Supabase', details: members });
      }

      // Filter valid email records
      const validMembers = members.filter(m => m.email && m.email.includes('@'));

      // Chunk into batches of 100 for Zoho CRM API limit
      const BATCH_SIZE = 100;
      const batches = [];
      for (let i = 0; i < validMembers.length; i += BATCH_SIZE) {
        batches.push(validMembers.slice(i, i + BATCH_SIZE));
      }

      const syncSummary = {
        total: validMembers.length,
        batches: batches.length,
        inserted: 0,
        updated: 0,
        errors: []
      };

      for (const batch of batches) {
        const leadBatch = batch.map(m => formatLeadPayload(m));

        const batchRes = await zohoApiRequest(token, 'POST', '/crm/v6/Leads/upsert', {
          data: leadBatch,
          duplicate_check_fields: ['Email']
        });

        if (batchRes.data && Array.isArray(batchRes.data.data)) {
          batchRes.data.data.forEach((item, idx) => {
            if (item.action === 'insert') syncSummary.inserted++;
            else if (item.action === 'update') syncSummary.updated++;
            else if (item.status === 'error') {
              syncSummary.errors.push({
                email: leadBatch[idx] ? leadBatch[idx].Email : 'unknown',
                error: item.message || item.code
              });
            }
          });
        } else {
          syncSummary.errors.push({ batch_error: batchRes.data || batchRes.raw });
        }
      }

      return res.status(200).json({
        success: true,
        summary: syncSummary
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (err) {
    console.error('[ZohoSync] Error:', err);
    return res.status(500).json({
      error: err.message || 'Internal Zoho Sync Error'
    });
  }
};
