import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { feedback } from '../db/schema';
import { desc } from 'drizzle-orm';
import { log } from '../lib/logger';

type Env = {
  DATABASE_URL: string;
};

type Variables = {
  userId: string;
};

const feedbackRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to extract userId
feedbackRoutes.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ error: 'User ID is required' }, 401);
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

    return c.json({ success: true, data: entry });
  } catch (error) {
    log.error('feedback submit failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({ success: false, error: { code: 'FEEDBACK_ERROR', message: 'Failed to submit feedback' } }, 500);
  }
});

// Get all feedback (for admin use)
feedbackRoutes.get('/', async (c) => {
  try {
    const entries = await createDrizzleConnection(c.env.DATABASE_URL)
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt));

    return c.json({ success: true, data: entries });
  } catch (error) {
    log.error('feedback fetch failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({ success: false, error: { code: 'FEEDBACK_ERROR', message: 'Failed to fetch feedback' } }, 500);
  }
});

export default feedbackRoutes;
