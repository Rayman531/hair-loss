import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import {
  progressSessions,
  onboardingResponses,
  routines,
  pushTokens,
  notificationPreferences,
  feedback,
} from '../db/schema';
import { eq, isNull } from 'drizzle-orm';
import { deleteFromR2, extractR2Key, validateR2Env, type R2Env } from '../lib/r2';
import { log } from '../lib/logger';
import { createPostHogClient, type PostHogEnv } from '../lib/posthog';

type Env = {
  DATABASE_URL: string;
} & R2Env & PostHogEnv;

const account = new Hono<{ Bindings: Env }>();

// Auth guard
account.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  await next();
});

// DELETE /api/account — permanently delete all user data
account.delete('/', async (c) => {
  const userId = c.req.header('X-User-Id')!;

  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);

    // 1. Fetch all progress sessions to delete R2 photos
    const sessions = await db
      .select()
      .from(progressSessions)
      .where(eq(progressSessions.userId, userId));

    // 2. Delete all R2 photos (best-effort)
    const r2Check = validateR2Env(c.env);
    if (r2Check.valid && sessions.length > 0) {
      const imageUrls = sessions.flatMap((s) => [
        s.frontImageUrl,
        s.topImageUrl,
        s.rightImageUrl,
        s.leftImageUrl,
      ]);

      const r2PublicUrl = c.env.R2_PUBLIC_URL;
      const deleteResults = await Promise.allSettled(
        imageUrls.map((url) => {
          const key = extractR2Key(url, r2PublicUrl);
          return deleteFromR2(c.env, key);
        }),
      );

      const failed = deleteResults.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        log.warn('account deletion: some R2 photos failed to delete', {
          userId,
          failedCount: failed.length,
        });
      }
    }

    // 3. Delete all database records (order matters for FK constraints)
    await Promise.all([
      db.delete(progressSessions).where(eq(progressSessions.userId, userId)),
      db.delete(onboardingResponses).where(eq(onboardingResponses.userId, userId)),
      db.delete(routines).where(eq(routines.userId, userId)), // cascades to treatments + treatment_logs
      db.delete(pushTokens).where(eq(pushTokens.userId, userId)),
      db.delete(notificationPreferences).where(eq(notificationPreferences.userId, userId)),
      db.delete(feedback).where(eq(feedback.userId, userId)),
    ]);

    log.info('account deleted', { userId });

    const posthog = createPostHogClient(c.env)
    posthog.capture({
      distinctId: userId,
      event: 'account_deleted',
      properties: { progress_sessions_deleted: sessions.length },
    })
    await posthog.shutdown()

    return c.json({ success: true });
  } catch (error) {
    log.error('account deletion failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return c.json({
      success: false,
      error: { code: 'DELETE_ERROR', message: 'Failed to delete account' },
    }, 500);
  }
});

export default account;
