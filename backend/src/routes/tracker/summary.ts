import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { computeRoutineSummary } from '../../services/tracker';

type Env = { DATABASE_URL: string };
type Variables = { userId: string };

const summaryRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard
summaryRoute.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// GET /api/tracker/summary
summaryRoute.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const summary = await computeRoutineSummary(db, userId);

    if (!summary) {
      return c.json({
        success: false,
        error: { code: 'NO_ROUTINE', message: 'No routine found for this user' },
      }, 404);
    }

    return c.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error computing routine summary:', error);
    return c.json({
      success: false,
      error: { code: 'SUMMARY_ERROR', message: 'Failed to compute routine summary', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

export default summaryRoute;
