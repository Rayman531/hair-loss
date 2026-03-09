import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { feedback } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

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
});

// Get all feedback (for admin use)
feedbackRoutes.get('/', async (c) => {
  const entries = await createDrizzleConnection(c.env.DATABASE_URL)
    .select()
    .from(feedback)
    .orderBy(desc(feedback.createdAt));

  return c.json({ success: true, data: entries });
});

export default feedbackRoutes;
