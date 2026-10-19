'use strict';
// Vercel entry point for Launchpad. Everything interesting lives in ./_lp (files starting with _ are not routes).
//
// Environment variables (set in Vercel):
//   SUPABASE_SERVICE_ROLE_KEY   required. Server-side key for the Supabase project. Never ship it to the browser.
//   SUPABASE_URL                optional, defaults to the TFC project
//   GOOGLE_CLIENT_ID            optional, defaults to the TFC Google client used for sign-in
//   LP_ADMIN_EMAILS             comma-separated Google emails allowed into /launchpad/admin
//   ANTHROPIC_API_KEY           optional. Without it, submissions wait for a human to review them
//   LP_SCORING_MODEL            optional, model for milestone reviews (default claude-haiku-5-5)
//   LP_RANKING_MODEL            optional, model for Demo Day ranking (default claude-sonnet-5-5)

const { createHandler } = require('./_lp/handler');
const { makeRestDb } = require('./_lp/db');
const { makeVerifier } = require('./_lp/auth');
const { makeAi } = require('./_lp/ai');

const url = process.env.SUPABASE_URL || 'https://fwwbybbjvchrhozzzigp.supabase.co';
const clientId = process.env.GOOGLE_CLIENT_ID || '771578038478-ijuecu880e8a7o76n9emga64ejo7uoep.apps.googleusercontent.com';

let handler;
function build() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createHandler({
    db: makeRestDb({ url, key }),
    verifyToken: makeVerifier({ clientId }),
    ai: makeAi({
      apiKey: process.env.ANTHROPIC_API_KEY,
      scoringModel: process.env.LP_SCORING_MODEL || 'claude-haiku-5-5',
      rankingModel: process.env.LP_RANKING_MODEL || 'claude-sonnet-5-5'
    }),
    cfg: { adminEmails: (process.env.LP_ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean) }
  });
}

module.exports = async (req, res) => {
  handler = handler || build();
  if (!handler) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(503).send(JSON.stringify({ error: 'Launchpad is not switched on yet.', setup: 'missing SUPABASE_SERVICE_ROLE_KEY' }));
  }
  return handler(req, res);
};
