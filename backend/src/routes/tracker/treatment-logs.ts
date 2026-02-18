import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { routines, treatments, treatmentLogs } from '../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

type Env = { DATABASE_URL: string };
type Variables = { userId: string };

const treatmentLogsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard
treatmentLogsRoute.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// GET /api/tracker/treatment-logs?month=YYYY-MM
// Returns all treatment logs for the user's routine in the given month.
treatmentLogsRoute.get('/', async (c) => {
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

    // Get user's routine
    const [routine] = await db
      .select({ id: routines.id })
      .from(routines)
      .where(eq(routines.userId, userId))
      .limit(1);

    if (!routine) {
      return c.json({ success: true, data: [] });
    }

    // Calculate month boundaries
    const startDate = `${month}-01`;
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const mon = parseInt(monthStr);
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    // Get all treatment logs for this routine's treatments in the month
    const logs = await db
      .select({
        id: treatmentLogs.id,
        treatmentId: treatmentLogs.treatmentId,
        date: treatmentLogs.date,
        completed: treatmentLogs.completed,
        createdAt: treatmentLogs.createdAt,
        treatmentName: treatments.name,
      })
      .from(treatmentLogs)
      .innerJoin(treatments, eq(treatmentLogs.treatmentId, treatments.id))
      .where(
        and(
          eq(treatments.routineId, routine.id),
          gte(treatmentLogs.date, startDate),
          lte(treatmentLogs.date, endDate),
        ),
      );

    return c.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching treatment logs:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_LOGS_ERROR', message: 'Failed to fetch treatment logs', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// POST /api/tracker/treatment-logs
// Body: { treatmentId, date (YYYY-MM-DD), completed }
// Upserts a log entry for the given treatment + date.
treatmentLogsRoute.post('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const body = await c.req.json<{
      treatmentId: string;
      date: string;
      completed: boolean;
    }>();

    // Validate date format
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_DATE', message: 'date must be in YYYY-MM-DD format' },
      }, 400);
    }

    if (!body.treatmentId) {
      return c.json({
        success: false,
        error: { code: 'INVALID_TREATMENT_ID', message: 'treatmentId is required' },
      }, 400);
    }

    if (typeof body.completed !== 'boolean') {
      return c.json({
        success: false,
        error: { code: 'INVALID_COMPLETED', message: 'completed must be a boolean' },
      }, 400);
    }

    // Verify the treatment belongs to the user's routine
    const [routine] = await db
      .select({ id: routines.id })
      .from(routines)
      .where(eq(routines.userId, userId))
      .limit(1);

    if (!routine) {
      return c.json({
        success: false,
        error: { code: 'NO_ROUTINE', message: 'No routine found' },
      }, 404);
    }

    const [treatment] = await db
      .select({ id: treatments.id })
      .from(treatments)
      .where(and(eq(treatments.id, body.treatmentId), eq(treatments.routineId, routine.id)))
      .limit(1);

    if (!treatment) {
      return c.json({
        success: false,
        error: { code: 'TREATMENT_NOT_FOUND', message: 'Treatment not found in your routine' },
      }, 404);
    }

    // Upsert: insert or update on conflict
    const [log] = await db
      .insert(treatmentLogs)
      .values({
        treatmentId: body.treatmentId,
        date: body.date,
        completed: body.completed,
      })
      .onConflictDoUpdate({
        target: [treatmentLogs.treatmentId, treatmentLogs.date],
        set: { completed: body.completed },
      })
      .returning();

    return c.json({ success: true, data: log }, 201);
  } catch (error) {
    console.error('Error creating treatment log:', error);
    return c.json({
      success: false,
      error: { code: 'CREATE_LOG_ERROR', message: 'Failed to create treatment log', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

export default treatmentLogsRoute;
