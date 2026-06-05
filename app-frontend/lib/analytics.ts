const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export type AnalyticsEvent =
  | '$screen'
  | 'sign_up_started'
  | 'sign_up_verified'
  | 'onboarding_complete'
  | 'disclaimer_acknowledged'
  | 'routine_setup_complete'
  | 'treatment_logged'
  | 'progress_photos_uploaded'
  | 'feedback_submitted'
  | 'sign_out'
  | 'account_deleted';

let distinctId: string | null = null;

function post(body: object) {
  if (!API_KEY) return;
  fetch(`${HOST}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: API_KEY, ...body }),
  }).catch(() => {});
}

export function identifyUser(userId: string, traits?: { email?: string; firstName?: string; lastName?: string }) {
  distinctId = userId;
  post({
    event: '$identify',
    distinct_id: userId,
    $set: traits,
    timestamp: new Date().toISOString(),
  });
}

export function resetIdentity() {
  distinctId = null;
}

export function capture(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (!distinctId) return;
  post({
    event,
    distinct_id: distinctId,
    properties: { $lib: 'follix-rn', ...properties },
    timestamp: new Date().toISOString(),
  });
}

export function screen(name: string) {
  capture('$screen', { $screen_name: name });
}
