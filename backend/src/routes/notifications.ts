import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { pushTokens, notificationPreferences } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { log } from '../lib/logger';
import { processScheduledReminders } from '../services/notifications';

type Env = { DATABASE_URL: string };
type Variables = { userId: string };

const notifications = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard
notifications.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// POST /api/notifications/push-token — register a device push token
notifications.post('/push-token', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const { token } = await c.req.json<{ token: string }>();

    if (!token) {
      return c.json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Push token is required' },
      }, 400);
    }

    // Upsert: if the token already exists for this user, update the timestamp
    const [existing] = await db
      .select({ id: pushTokens.id })
      .from(pushTokens)
      .where(and(eq(pushTokens.userId, userId), eq(pushTokens.token, token)))
      .limit(1);

    if (existing) {
      await db
        .update(pushTokens)
        .set({ updatedAt: new Date() })
        .where(eq(pushTokens.id, existing.id));

      return c.json({ success: true, data: { registered: true } });
    }

    await db.insert(pushTokens).values({ userId, token });

    log.info('push token registered', { userId });
    return c.json({ success: true, data: { registered: true } }, 201);
  } catch (error) {
    log.error('push token registration failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'REGISTER_TOKEN_ERROR', message: 'Failed to register push token', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// DELETE /api/notifications/push-token — unregister a device push token
notifications.delete('/push-token', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const { token } = await c.req.json<{ token: string }>();

    if (!token) {
      return c.json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Push token is required' },
      }, 400);
    }

    await db
      .delete(pushTokens)
      .where(and(eq(pushTokens.userId, userId), eq(pushTokens.token, token)));

    log.info('push token unregistered', { userId });
    return c.json({ success: true, data: { unregistered: true } });
  } catch (error) {
    log.error('push token unregistration failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'UNREGISTER_TOKEN_ERROR', message: 'Failed to unregister push token', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// GET /api/notifications/preferences — get user's notification preferences
notifications.get('/preferences', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    // Return defaults if no preferences exist yet
    return c.json({
      success: true,
      data: prefs ?? { enabled: true, reminderHour: 9, reminderMinute: 0, timezone: 'UTC' },
    });
  } catch (error) {
    log.error('preferences fetch failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'FETCH_PREFERENCES_ERROR', message: 'Failed to fetch notification preferences' },
    }, 500);
  }
});

// PUT /api/notifications/preferences — update user's notification preferences
notifications.put('/preferences', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const body = await c.req.json<{
      enabled?: boolean;
      reminderHour?: number;
      reminderMinute?: number;
      timezone?: string;
    }>();

    // Validate hour/minute ranges
    if (body.reminderHour !== undefined && (body.reminderHour < 0 || body.reminderHour > 23)) {
      return c.json({ success: false, error: { code: 'INVALID_HOUR', message: 'Hour must be 0-23' } }, 400);
    }
    if (body.reminderMinute !== undefined && (body.reminderMinute < 0 || body.reminderMinute > 59)) {
      return c.json({ success: false, error: { code: 'INVALID_MINUTE', message: 'Minute must be 0-59' } }, 400);
    }

    const [existing] = await db
      .select({ id: notificationPreferences.id })
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(notificationPreferences)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(notificationPreferences.id, existing.id))
        .returning();

      return c.json({ success: true, data: updated });
    }

    const [created] = await db
      .insert(notificationPreferences)
      .values({
        userId,
        enabled: body.enabled ?? true,
        reminderHour: body.reminderHour ?? 9,
        reminderMinute: body.reminderMinute ?? 0,
        timezone: body.timezone ?? 'UTC',
      })
      .returning();

    return c.json({ success: true, data: created }, 201);
  } catch (error) {
    log.error('preferences update failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'UPDATE_PREFERENCES_ERROR', message: 'Failed to update notification preferences' },
    }, 500);
  }
});

// POST /api/notifications/send-reminders — send routine reminders
// Called by Cloudflare Cron Trigger every hour. Sends to users whose preferred local hour matches now.
notifications.post('/send-reminders', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const sent = await processScheduledReminders(db);
    return c.json({ success: true, data: { sent } });
  } catch (error) {
    log.error('send reminders failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'SEND_REMINDERS_ERROR', message: 'Failed to send reminders', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

export default notifications;
