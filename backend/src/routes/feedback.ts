import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { feedback } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { log } from '../lib/logger';
import { createPostHogClient, type PostHogEnv } from '../lib/posthog';
import { extractUserId } from '../lib/auth';

type Env = {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
} & PostHogEnv;

type Variables = {
  userId: string;
};

const feedbackRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

feedbackRoutes.use('*', async (c, next) => {
  const userId = await extractUserId(c.req.header('Authorization'), c.env.CLERK_SECRET_KEY);
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// Submit feedback
feedbackRoutes.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { message } = await c.req.json<{ message: string }>();

    if (!message || !message.trim()) {
      return c.json({ error: 'Feedback message is required' }, 400);
    }

    const [entry] = await createDrizzleConnection(c.env.DATABASE_URL)
      .insert(feedback)
      .values({ userId, message: message.trim() })
      .returning();

    const posthog = createPostHogClient(c.env)
    posthog.capture({ distinctId: userId, event: 'feedback_submitted', properties: { feedback_id: entry.id } })
    await posthog.shutdown()

    return c.json({ success: true, data: entry });
  } catch (error) {
    log.error('feedback submit failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({ success: false, error: { code: 'FEEDBACK_ERROR', message: 'Failed to submit feedback' } }, 500);
  }
});

// Get current user's own feedback
feedbackRoutes.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const entries = await createDrizzleConnection(c.env.DATABASE_URL)
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));

    return c.json({ success: true, data: entries });
  } catch (error) {
    log.error('feedback fetch failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({ success: false, error: { code: 'FEEDBACK_ERROR', message: 'Failed to fetch feedback' } }, 500);
  }
});

export default feedbackRoutes;
