import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { routines, sideEffectLogs } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';

type Env = { DATABASE_URL: string };
type Variables = { userId: string };

const sideEffectsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard
sideEffectsRoute.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// Helper: get the user's routine
async function getUserRoutine(db: ReturnType<typeof createDrizzleConnection>, userId: string) {
  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.userId, userId))
    .limit(1);
  return routine ?? null;
}

// GET /api/tracker/side-effects — list all side effect logs for the user's routine
sideEffectsRoute.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({ success: true, data: [] });
    }

    const logs = await db
      .select()
      .from(sideEffectLogs)
      .where(eq(sideEffectLogs.routineId, routine.id))
      .orderBy(desc(sideEffectLogs.weekStartDate));

    return c.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching side effects:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_SIDE_EFFECTS_ERROR', message: 'Failed to fetch side effects', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// POST /api/tracker/side-effects
// Body: { weekStartDate (YYYY-MM-DD, must be a Monday), notes }
// Upserts a side effect log for the given week.
sideEffectsRoute.post('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({
        success: false,
        error: { code: 'NO_ROUTINE', message: 'Create a routine first' },
      }, 400);
    }

    const body = await c.req.json<{ weekStartDate: string; notes: string }>();

    // Validate weekStartDate format
    if (!body.weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.weekStartDate)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_DATE', message: 'weekStartDate must be in YYYY-MM-DD format' },
      }, 400);
    }

    // Validate it's a Monday
    const dateObj = new Date(body.weekStartDate + 'T00:00:00Z');
    if (dateObj.getUTCDay() !== 1) {
      return c.json({
        success: false,
        error: { code: 'INVALID_WEEK_START', message: 'weekStartDate must be a Monday' },
      }, 400);
    }

    if (!body.notes || typeof body.notes !== 'string' || body.notes.trim().length === 0) {
      return c.json({
        success: false,
        error: { code: 'INVALID_NOTES', message: 'notes is required and must be a non-empty string' },
      }, 400);
    }

    // Upsert
    const [log] = await db
      .insert(sideEffectLogs)
      .values({
        routineId: routine.id,
        weekStartDate: body.weekStartDate,
        notes: body.notes.trim(),
      })
      .onConflictDoUpdate({
        target: [sideEffectLogs.routineId, sideEffectLogs.weekStartDate],
        set: { notes: body.notes.trim() },
      })
      .returning();

    return c.json({ success: true, data: log }, 201);
  } catch (error) {
    console.error('Error creating side effect log:', error);
    return c.json({
      success: false,
      error: { code: 'CREATE_SIDE_EFFECT_ERROR', message: 'Failed to create side effect log', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

export default sideEffectsRoute;
