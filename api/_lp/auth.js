'use strict';
// Verifies a Google OAuth access token on the server, so a caller cannot simply claim an email address.
// The token must have been issued to TFC's own Google client, and the account's email must be verified.

function makeVerifier({ clientId, fetchImpl, nowMs }) {
  const f = fetchImpl || fetch;
  const clock = nowMs || (() => Date.now());
  const cache = new Map(); // token -> { user, until }

  return async function verifyToken(token) {
    if (!token || typeof token !== 'string' || token.length < 20 || token.length > 4096) return null;
    const hit = cache.get(token);
    if (hit && hit.until > clock()) return hit.user;

    const info = await f('https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(token));
    if (!info.ok) return null;
    const meta = await info.json();
    const audience = meta.aud || meta.azp;
    if (!audience || audience !== clientId) return null;
    if (Number(meta.expires_in) <= 0) return null;

    const prof = await f('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + token } });
    if (!prof.ok) return null;
    const p = await prof.json();
    if (!p.email || p.email_verified === false || p.email_verified === 'false') return null;

    const user = { email: String(p.email).toLowerCase(), name: p.name || String(p.email).split('@')[0] };
    cache.set(token, { user, until: clock() + Math.min(300, Number(meta.expires_in) || 300) * 1000 });
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    return user;
  };
}

module.exports = { makeVerifier };
