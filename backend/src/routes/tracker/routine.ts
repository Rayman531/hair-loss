import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { routines } from '../../db/schema';
import { eq } from 'drizzle-orm';

type Env = { DATABASE_URL: string };
type Variables = { userId: string };

const routineTracker = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard
routineTracker.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// GET /api/tracker/routine — get the user's active routine
routineTracker.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const [routine] = await db
      .select()
      .from(routines)
      .where(eq(routines.userId, userId))
      .limit(1);

    if (!routine) {
      return c.json({ success: true, data: null });
    }

    return c.json({ success: true, data: routine });
  } catch (error) {
    console.error('Error fetching routine:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_ROUTINE_ERROR', message: 'Failed to fetch routine', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// POST /api/tracker/routine — create a routine (one per user)
routineTracker.post('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    // Check if user already has a routine
    const [existing] = await db
      .select({ id: routines.id })
      .from(routines)
      .where(eq(routines.userId, userId))
      .limit(1);

    if (existing) {
      return c.json({
        success: false,
        error: { code: 'ROUTINE_EXISTS', message: 'User already has an active routine' },
      }, 409);
    }

    const [routine] = await db
      .insert(routines)
      .values({ userId })
      .returning();

    return c.json({ success: true, data: routine }, 201);
  } catch (error) {
    console.error('Error creating routine:', error);
    return c.json({
      success: false,
      error: { code: 'CREATE_ROUTINE_ERROR', message: 'Failed to create routine', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

export default routineTracker;
