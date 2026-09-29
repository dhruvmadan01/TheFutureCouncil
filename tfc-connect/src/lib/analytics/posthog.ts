import posthog from "posthog-js";

export type PostHogEvent =
  | "onboarding_step_completed"
  | "match_viewed"
  | "connect_sent"
  | "request_accepted"
  | "message_sent"
  | "teamed_up"
  | "startup_listed"
  | "startup_followed"
  | "role_applied";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let isInitialized = false;

/**
 * Initialize PostHog client in browser
 */
export function initPostHog(): void {
  if (typeof window === "undefined" || isInitialized) return;

  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // Managed manually
      autocapture: false,
    });
    isInitialized = true;
  } else {
    // Development/demo mode fallback
    isInitialized = true;
  }
}

/**
 * Capture an analytics event (Client-side)
 */
export function trackEvent(
  event: PostHogEvent,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  if (POSTHOG_KEY) {
    posthog.capture(event, properties);
  } else {
    // Structured console logging in dev/preview
    console.debug(`[PostHog Track] ${event}`, properties);
  }
}

/**
 * Identify authenticated founder (Client-side)
 */
export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  if (POSTHOG_KEY) {
    posthog.identify(userId, traits);
  } else {
    console.debug(`[PostHog Identify] ${userId}`, traits);
  }
}

/**
 * Reset user session on logout (Client-side)
 */
export function resetUser(): void {
  if (typeof window === "undefined") return;

  if (POSTHOG_KEY) {
    posthog.reset();
  }
}

/**
 * Track an analytics event from Server Actions / API Routes
 */
export async function trackServerEvent(
  distinctId: string,
  event: PostHogEvent,
  properties?: Record<string, unknown>
): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_KEY;
  if (!apiKey) {
    console.info(`[PostHog Server Track] ${event} (User: ${distinctId})`, properties);
    return;
  }

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        properties: {
          distinct_id: distinctId,
          ...properties,
          $lib: "tfc-connect-server",
        },
      }),
    });
  } catch (err) {
    console.error("[PostHog Server Error]", err);
  }
}
