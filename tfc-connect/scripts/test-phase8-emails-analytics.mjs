import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DailyMatchesEmail from "../src/emails/templates/DailyMatchesEmail.tsx";
import NewRequestEmail from "../src/emails/templates/NewRequestEmail.tsx";
import RequestAcceptedEmail from "../src/emails/templates/RequestAcceptedEmail.tsx";
import NewMessageEmail from "../src/emails/templates/NewMessageEmail.tsx";
import TeamedUpEmail from "../src/emails/templates/TeamedUpEmail.tsx";
import QuietNudgeEmail from "../src/emails/templates/QuietNudgeEmail.tsx";
import StillLookingEmail from "../src/emails/templates/StillLookingEmail.tsx";
import ListingReminderEmail from "../src/emails/templates/ListingReminderEmail.tsx";

import {
  sendDailyMatchesEmail,
  sendNewRequestEmail,
  sendRequestAcceptedEmail,
  sendNewMessageEmail,
  sendTeamedUpEmail,
  sendQuietNudgeEmail,
  sendStillLookingEmail,
  sendStartupUpdateReminderEmail,
} from "../src/lib/email/resend.ts";

import { trackEvent, trackServerEvent } from "../src/lib/analytics/posthog.ts";

async function runTests() {
  console.log("=== PHASE 8: EMAILS & ANALYTICS TEST SUITE ===\n");

  const getComponent = (c) => (c && c.default ? c.default : c);

  // 1. Test React Email Templates Rendering
  const templates = [
    { name: "DailyMatchesEmail", component: getComponent(DailyMatchesEmail) },
    { name: "NewRequestEmail", component: getComponent(NewRequestEmail) },
    { name: "RequestAcceptedEmail", component: getComponent(RequestAcceptedEmail) },
    { name: "NewMessageEmail", component: getComponent(NewMessageEmail) },
    { name: "TeamedUpEmail", component: getComponent(TeamedUpEmail) },
    { name: "QuietNudgeEmail", component: getComponent(QuietNudgeEmail) },
    { name: "StillLookingEmail", component: getComponent(StillLookingEmail) },
    { name: "ListingReminderEmail", component: getComponent(ListingReminderEmail) },
  ];

  console.log("1. Validating 8 React Email Templates (HTML generation):");
  for (const t of templates) {
    try {
      const html = renderToStaticMarkup(React.createElement(t.component, {}));
      if (!html || !html.includes("TFC Connect")) {
        throw new Error("HTML output did not contain expected TFC Connect branding");
      }
      console.log(`   ✓ ${t.name}: Rendered ${html.length} bytes of valid HTML`);
    } catch (err) {
      console.error(`   ✗ ${t.name} failed:`, err.message);
      process.exit(1);
    }
  }

  // 2. Test Resend Email Helpers (Mock Mode)
  console.log("\n2. Validating Resend Mail Helpers (Safe Mock Execution):");
  const helperResults = await Promise.all([
    sendDailyMatchesEmail({ to: "test@example.com", recipientName: "Test Founder" }),
    sendNewRequestEmail({ to: "test@example.com", recipientName: "Founder A", senderName: "Founder B" }),
    sendRequestAcceptedEmail({ to: "test@example.com", recipientName: "Founder B", partnerName: "Founder A" }),
    sendNewMessageEmail({ to: "test@example.com", recipientName: "Founder A", senderName: "Founder B" }),
    sendTeamedUpEmail({ to: "test@example.com", recipientName: "Founder A", partnerName: "Founder B" }),
    sendQuietNudgeEmail({ to: "test@example.com", recipientName: "Founder A", partnerName: "Founder B" }),
    sendStillLookingEmail({ to: "test@example.com", recipientName: "Founder A" }),
    sendStartupUpdateReminderEmail({ to: "test@example.com", recipientName: "Founder A", startupName: "TestCo", startupSlug: "testco" }),
  ]);

  for (let i = 0; i < helperResults.length; i++) {
    const res = helperResults[i];
    if (!res.success) {
      console.error(`   ✗ Helper ${i + 1} failed:`, res.error);
      process.exit(1);
    }
  }
  console.log(`   ✓ All 8 Resend email helpers succeeded (returned mock IDs)`);

  // 3. Test PostHog Events Tracking
  console.log("\n3. Validating PostHog Analytics Helpers:");
  try {
    trackEvent("onboarding_step_completed", { step: 1 });
    trackEvent("match_viewed", { count: 5 });
    await trackServerEvent("user_123", "connect_sent", { target_id: "target_456" });
    await trackServerEvent("user_123", "teamed_up", { connection_id: "conn_789" });
    console.log("   ✓ PostHog client & server event dispatch succeeded without errors");
  } catch (err) {
    console.error("   ✗ PostHog event tracking failed:", err.message);
    process.exit(1);
  }

  console.log("\n=== ALL PHASE 8 TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
