import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { computeMonthlyHeatmap } from '../../services/tracker';
import { log } from '../../lib/logger';
import { extractUserId } from '../../lib/auth';

type Env = { DATABASE_URL: string; CLERK_SECRET_KEY: string };
type Variables = { userId: string };

const heatmapRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

heatmapRoute.use('*', async (c, next) => {
  const userId = await extractUserId(c.req.header('Authorization'), c.env.CLERK_SECRET_KEY);
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// GET /api/tracker/heatmap?month=YYYY-MM
heatmapRoute.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const month = c.req.query('month');

    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_MONTH', message: 'month query param required in YYYY-MM format' },
      }, 400);
    }

    const heatmap = await computeMonthlyHeatmap(db, userId, month);

    if (!heatmap) {
      return c.json({
        success: false,
        error: { code: 'NO_ROUTINE', message: 'No routine found for this user' },
      }, 404);
    }

    return c.json({ success: true, data: heatmap });
  } catch (error) {
    log.error('heatmap compute failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'HEATMAP_ERROR', message: 'Failed to compute heatmap' },
    }, 500);
  }
});

export default heatmapRoute;
