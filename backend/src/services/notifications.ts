import { eq } from 'drizzle-orm';
import { pushTokens, notificationPreferences } from '../db/schema';
import { log } from '../lib/logger';
import type { DrizzleDB } from '../db/drizzle';

const NOTIFICATION_MESSAGES = [
  'Quick check-in, staying consistent today?',
  'Don\'t break the streak, takes 10 seconds ',
  'Time for your daily check-in.',
  'You\'re building momentum, keep it going.',
  'Friendly reminder to log today\'s routine.',
];

export function getRandomMessage(): string {
  const index = Math.floor(Math.random() * NOTIFICATION_MESSAGES.length);
  return NOTIFICATION_MESSAGES[index];
}

export type ExpoPushMessage = {
  to: string;
  title?: string;
  body: string;
  sound?: 'default' | null;
  data?: Record<string, unknown>;
};

export type ExpoPushTicket =
  | { status: 'ok'; id: string }
  | { status: 'error'; message: string; details?: { error: string } };

/**
 * Send push notifications via Expo's push notification service.
 * https://docs.expo.dev/push-notifications/sending-notifications/
 */
export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[],
): Promise<ExpoPushTicket[]> {
  if (messages.length === 0) return [];

  // Expo recommends batching in chunks of 100
  const CHUNK_SIZE = 100;
  const tickets: ExpoPushTicket[] = [];

  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json() as { data: ExpoPushTicket[] };
      tickets.push(...result.data);
    } catch (error) {
      log.error('expo push send failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        chunkIndex: i,
      });
    }
  }

  return tickets;
}

/**
 * Build notification messages for a list of push tokens.
 */
export function buildReminderMessages(tokens: string[]): ExpoPushMessage[] {
  return tokens.map((token) => ({
    to: token,
    title: 'Hair Loss Tracker',
    body: getRandomMessage(),
    sound: 'default' as const,
    data: { type: 'routine_reminder' },
  }));
}

/**
 * Core logic for sending scheduled reminders.
 * Checks each user's timezone preference to determine if their reminder hour matches now.
 * Users without preferences default to 9 AM UTC.
 */
export async function processScheduledReminders(db: DrizzleDB): Promise<number> {
  const now = new Date();
  const utcHour = now.getUTCHours();

  const allTokenRows = await db
    .select({ token: pushTokens.token, userId: pushTokens.userId })
    .from(pushTokens);

  if (allTokenRows.length === 0) return 0;

  // Get all preferences
  const enabledPrefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.enabled, true));

  const disabledPrefs = await db
    .select({ userId: notificationPreferences.userId })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.enabled, false));

  const disabledUserIds = new Set(disabledPrefs.map((p) => p.userId));

  // Check which users' local hour matches their preferred reminder hour right now
  const eligibleByPrefs = new Set<string>();
  for (const pref of enabledPrefs) {
    try {
      const localTime = new Date(now.toLocaleString('en-US', { timeZone: pref.timezone }));
      if (localTime.getHours() === pref.reminderHour) {
        eligibleByPrefs.set(pref.userId);
      }
    } catch {
      // Invalid timezone, skip
    }
  }

  const allPrefsUserIds = new Set([
    ...enabledPrefs.map((p) => p.userId),
    ...disabledUserIds,
  ]);

  // Collect eligible tokens
  const eligibleTokens: string[] = [];
  for (const row of allTokenRows) {
    if (disabledUserIds.has(row.userId)) continue;

    if (eligibleByPrefs.has(row.userId)) {
      eligibleTokens.push(row.token);
    } else if (!allPrefsUserIds.has(row.userId) && utcHour === 9) {
      // No preferences set — default to 9 AM UTC
      eligibleTokens.push(row.token);
    }
  }

  if (eligibleTokens.length === 0) return 0;

  const messages = buildReminderMessages(eligibleTokens);
  const tickets = await sendExpoPushNotifications(messages);

  log.info('reminders sent', { eligible: eligibleTokens.length, tickets: tickets.length });
  return tickets.length;
}
