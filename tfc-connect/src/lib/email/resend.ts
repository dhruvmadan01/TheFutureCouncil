import { Resend } from "resend";
import * as React from "react";
import DailyMatchesEmail from "@/emails/templates/DailyMatchesEmail";
import NewRequestEmail from "@/emails/templates/NewRequestEmail";
import RequestAcceptedEmail from "@/emails/templates/RequestAcceptedEmail";
import NewMessageEmail from "@/emails/templates/NewMessageEmail";
import TeamedUpEmail from "@/emails/templates/TeamedUpEmail";
import QuietNudgeEmail from "@/emails/templates/QuietNudgeEmail";
import StillLookingEmail from "@/emails/templates/StillLookingEmail";
import ListingReminderEmail from "@/emails/templates/ListingReminderEmail";

const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "TFC Connect <connect@thefuturecouncil.in>";

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

async function sendMail(
  to: string,
  subject: string,
  reactElement: React.ReactElement
): Promise<SendEmailResult> {
  if (!resend) {
    console.info(`[Resend Mock] To: ${to} | Subject: "${subject}"`);
    return { success: true, id: `mock_${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject,
      react: reactElement,
    });

    if (error) {
      console.error("[Resend Error]", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("[Resend Exception]", message);
    return { success: false, error: message };
  }
}

/**
 * 1. Daily matches ready (opt-in)
 */
export async function sendDailyMatchesEmail(params: {
  to: string;
  recipientName: string;
  matchCount?: number;
  matchUrl?: string;
}): Promise<SendEmailResult> {
  return sendMail(
    params.to,
    `Your ${params.matchCount || 5} co-founder matches for today are ready`,
    React.createElement(DailyMatchesEmail, {
      recipientName: params.recipientName,
      matchCount: params.matchCount,
      matchUrl: params.matchUrl,
    })
  );
}

/**
 * 2. New connection request
 */
export async function sendNewRequestEmail(params: {
  to: string;
  recipientName: string;
  senderName: string;
  senderHeadline?: string;
  matchScore?: number;
  noteSnippet?: string;
  requestUrl?: string;
}): Promise<SendEmailResult> {
  return sendMail(
    params.to,
    `${params.senderName} sent you a connection request on TFC Connect`,
    React.createElement(NewRequestEmail, {
      recipientName: params.recipientName,
      senderName: params.senderName,
      senderHeadline: params.senderHeadline,
      matchScore: params.matchScore,
      noteSnippet: params.noteSnippet,
      requestUrl: params.requestUrl,
    })
  );
}

/**
 * 3. Connection request accepted
 */
export async function sendRequestAcceptedEmail(params: {
  to: string;
  recipientName: string;
  partnerName: string;
  partnerCollege?: string;
  chatUrl?: string;
}): Promise<SendEmailResult> {
  return sendMail(
    params.to,
    `${params.partnerName} accepted your connection request on TFC Connect!`,
    React.createElement(RequestAcceptedEmail, {
      recipientName: params.recipientName,
      partnerName: params.partnerName,
      partnerCollege: params.partnerCollege,
      chatUrl: params.chatUrl,
    })
  );
}

/**
 * 4. New chat message (batched, at most 1 an hour)
 */
export async function sendNewMessageEmail(params: {
  to: string;
  recipientName: string;
  senderName: string;
  messageSnippet?: string;
  chatUrl?: string;
}): Promise<SendEmailResult> {
  return sendMail(
    params.to,
    `New message from ${params.senderName} on TFC Connect`,
    React.createElement(NewMessageEmail, {
      recipientName: params.recipientName,
      senderName: params.senderName,
      messageSnippet: params.messageSnippet,
      chatUrl: params.chatUrl,
    })
  );
}

/**
 * 5. "We teamed up" confirmation (both-sides celebration)
 */
export async function sendTeamedUpEmail(params: {
  to: string;
  recipientName: string;
  partnerName: string;
  createStartupUrl?: string;
}): Promise<SendEmailResult> {
  return sendMail(
    params.to,
    `🎉 Congratulations! You and ${params.partnerName} teamed up on TFC Connect`,
    React.createElement(TeamedUpEmail, {
      recipientName: params.recipientName,
      partnerName: params.partnerName,
      createStartupUrl: params.createStartupUrl,
    })
  );
}

/**
 * 6. 5-day quiet nudge
 */
export async function sendQuietNudgeEmail(params: {
  to: string;
  recipientName: string;
  partnerName: string;
  chatUrl?: string;
}): Promise<SendEmailResult> {
  return sendMail(
    params.to,
    `Quiet for 5 days: Reconnect with ${params.partnerName} on TFC Connect`,
    React.createElement(QuietNudgeEmail, {
      recipientName: params.recipientName,
      partnerName: params.partnerName,
      chatUrl: params.chatUrl,
    })
  );
}

/**
 * 7. 30-day "Still looking?" check (updates still_looking_at)
 */
export async function sendStillLookingEmail(params: {
  to: string;
  recipientName: string;
  refreshUrl?: string;
  browseUrl?: string;
}): Promise<SendEmailResult> {
  return sendMail(
    params.to,
    "Still looking for a co-founder? Keep your profile active on TFC Connect",
    React.createElement(StillLookingEmail, {
      recipientName: params.recipientName,
      refreshUrl: params.refreshUrl,
      browseUrl: params.browseUrl,
    })
  );
}

/**
 * 8. 60-day listing reminder
 */
export async function sendStartupUpdateReminderEmail(params: {
  to: string;
  recipientName: string;
  startupName: string;
  startupSlug: string;
  lastUpdateDays?: number;
  updateUrl?: string;
}): Promise<SendEmailResult> {
  return sendMail(
    params.to,
    `${params.startupName} hasn't posted an update in ${params.lastUpdateDays || 60} days`,
    React.createElement(ListingReminderEmail, {
      recipientName: params.recipientName,
      startupName: params.startupName,
      startupSlug: params.startupSlug,
      lastUpdateDays: params.lastUpdateDays,
      updateUrl: params.updateUrl,
    })
  );
}
