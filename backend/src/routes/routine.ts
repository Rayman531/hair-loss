import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { userRoutines, treatmentTypeEnum } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

type Env = {
  DATABASE_URL: string;
};

type Variables = {
  userId: string;
};

const routine = new Hono<{ Bindings: Env; Variables: Variables }>();

const VALID_DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const;

const VALID_TREATMENTS = treatmentTypeEnum.enumValues;

// Auth guard: extract userId from X-User-Id header
routine.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// POST /api/routine — save one treatment configuration
routine.post('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const body = await c.req.json<{
      treatmentType: string;
      timeOfDay: string;
      daysOfWeek: string[];
    }>();

    // Validate treatmentType
    if (!body.treatmentType || !VALID_TREATMENTS.includes(body.treatmentType as any)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TREATMENT',
          message: `treatmentType must be one of: ${VALID_TREATMENTS.join(', ')}`,
        },
      }, 400);
    }

    // Validate timeOfDay format (HH:MM)
    if (!body.timeOfDay || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.timeOfDay)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TIME',
          message: 'timeOfDay must be in HH:MM format (00:00–23:59)',
        },
      }, 400);
    }

    // Validate daysOfWeek
    if (!Array.isArray(body.daysOfWeek) || body.daysOfWeek.length === 0) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_DAYS',
          message: 'daysOfWeek must be a non-empty array',
        },
      }, 400);
    }

    for (const day of body.daysOfWeek) {
      if (!VALID_DAYS.includes(day as any)) {
        return c.json({
          success: false,
          error: {
            code: 'INVALID_DAY',
            message: `Invalid day: "${day}". Must be one of: ${VALID_DAYS.join(', ')}`,
          },
        }, 400);
      }
    }

    // Upsert: insert or update if same user+treatment already exists
    const [result] = await db
      .insert(userRoutines)
      .values({
        userId,
        treatmentType: body.treatmentType as (typeof VALID_TREATMENTS)[number],
        timeOfDay: body.timeOfDay,
        daysOfWeek: body.daysOfWeek,
      })
      .onConflictDoUpdate({
        target: [userRoutines.userId, userRoutines.treatmentType],
        set: {
          timeOfDay: body.timeOfDay,
          daysOfWeek: body.daysOfWeek,
        },
      })
      .returning();

    return c.json({ success: true, data: result }, 201);
  } catch (error) {
    console.error('Error saving routine:', error);
    return c.json({
      success: false,
      error: {
        code: 'SAVE_ROUTINE_ERROR',
        message: 'Failed to save routine',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});

// GET /api/routine — return all routine treatments for the authenticated user
routine.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const routines = await db
      .select()
      .from(userRoutines)
      .where(eq(userRoutines.userId, userId))
      .orderBy(asc(userRoutines.createdAt));

    return c.json({ success: true, data: routines });
  } catch (error) {
    console.error('Error fetching routines:', error);
    return c.json({
      success: false,
      error: {
        code: 'FETCH_ROUTINES_ERROR',
        message: 'Failed to fetch routines',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});

// GET /api/routine/exists — check if the user has any routines
routine.get('/exists', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const rows = await db
      .select({ id: userRoutines.id })
      .from(userRoutines)
      .where(eq(userRoutines.userId, userId))
      .limit(1);

    return c.json({ hasRoutine: rows.length > 0 });
  } catch (error) {
    console.error('Error checking routine existence:', error);
    return c.json({
      success: false,
      error: {
        code: 'CHECK_ROUTINE_ERROR',
        message: 'Failed to check routine existence',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});

export default routine;
