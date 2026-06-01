import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { computeRoutineSummary } from '../../services/tracker';
import { log } from '../../lib/logger';
import { extractUserId } from '../../lib/auth';

type Env = { DATABASE_URL: string; CLERK_SECRET_KEY: string };
type Variables = { userId: string };

const summaryRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

summaryRoute.use('*', async (c, next) => {
  const userId = await extractUserId(c.req.header('Authorization'), c.env.CLERK_SECRET_KEY);
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
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
    log.error('routine summary compute failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'SUMMARY_ERROR', message: 'Failed to compute routine summary' },
    }, 500);
  }
});

export default summaryRoute;
