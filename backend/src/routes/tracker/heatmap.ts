import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { computeMonthlyHeatmap } from '../../services/tracker';

type Env = { DATABASE_URL: string };
type Variables = { userId: string };

const heatmapRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard
heatmapRoute.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
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
    console.error('Error computing heatmap:', error);
    return c.json({
      success: false,
      error: { code: 'HEATMAP_ERROR', message: 'Failed to compute heatmap', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

export default heatmapRoute;
