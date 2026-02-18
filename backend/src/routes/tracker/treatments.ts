import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { routines, treatments } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';

type Env = { DATABASE_URL: string };
type Variables = { userId: string };

const treatmentsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard
treatmentsRoute.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// Helper: get the user's routine or return 404
async function getUserRoutine(db: ReturnType<typeof createDrizzleConnection>, userId: string) {
  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.userId, userId))
    .limit(1);
  return routine ?? null;
}

// GET /api/tracker/treatments — list all treatments for the user's routine
treatmentsRoute.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({ success: true, data: [] });
    }

    const result = await db
      .select()
      .from(treatments)
      .where(eq(treatments.routineId, routine.id))
      .orderBy(asc(treatments.createdAt));

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_TREATMENTS_ERROR', message: 'Failed to fetch treatments', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// POST /api/tracker/treatments — add a treatment to the user's routine
treatmentsRoute.post('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({
        success: false,
        error: { code: 'NO_ROUTINE', message: 'Create a routine first before adding treatments' },
      }, 400);
    }

    const body = await c.req.json<{ name: string; frequencyPerWeek: number }>();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return c.json({
        success: false,
        error: { code: 'INVALID_NAME', message: 'name is required and must be a non-empty string' },
      }, 400);
    }

    if (
      body.frequencyPerWeek == null ||
      typeof body.frequencyPerWeek !== 'number' ||
      !Number.isInteger(body.frequencyPerWeek) ||
      body.frequencyPerWeek < 1 ||
      body.frequencyPerWeek > 7
    ) {
      return c.json({
        success: false,
        error: { code: 'INVALID_FREQUENCY', message: 'frequencyPerWeek must be an integer between 1 and 7' },
      }, 400);
    }

    const [treatment] = await db
      .insert(treatments)
      .values({
        routineId: routine.id,
        name: body.name.trim(),
        frequencyPerWeek: body.frequencyPerWeek,
      })
      .returning();

    return c.json({ success: true, data: treatment }, 201);
  } catch (error) {
    console.error('Error creating treatment:', error);
    return c.json({
      success: false,
      error: { code: 'CREATE_TREATMENT_ERROR', message: 'Failed to create treatment', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// PATCH /api/tracker/treatments/:id — update a treatment
treatmentsRoute.patch('/:id', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const treatmentId = c.req.param('id');

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({ success: false, error: { code: 'NO_ROUTINE', message: 'No routine found' } }, 404);
    }

    const body = await c.req.json<{ name?: string; frequencyPerWeek?: number }>();
    const updates: Partial<{ name: string; frequencyPerWeek: number; updatedAt: Date }> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return c.json({
          success: false,
          error: { code: 'INVALID_NAME', message: 'name must be a non-empty string' },
        }, 400);
      }
      updates.name = body.name.trim();
    }

    if (body.frequencyPerWeek !== undefined) {
      if (
        typeof body.frequencyPerWeek !== 'number' ||
        !Number.isInteger(body.frequencyPerWeek) ||
        body.frequencyPerWeek < 1 ||
        body.frequencyPerWeek > 7
      ) {
        return c.json({
          success: false,
          error: { code: 'INVALID_FREQUENCY', message: 'frequencyPerWeek must be an integer between 1 and 7' },
        }, 400);
      }
      updates.frequencyPerWeek = body.frequencyPerWeek;
    }

    if (Object.keys(updates).length === 0) {
      return c.json({
        success: false,
        error: { code: 'NO_UPDATES', message: 'No valid fields to update' },
      }, 400);
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(treatments)
      .set(updates)
      .where(and(eq(treatments.id, treatmentId), eq(treatments.routineId, routine.id)))
      .returning();

    if (!updated) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Treatment not found' } }, 404);
    }

    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating treatment:', error);
    return c.json({
      success: false,
      error: { code: 'UPDATE_TREATMENT_ERROR', message: 'Failed to update treatment', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// DELETE /api/tracker/treatments/:id — delete a treatment (cascades to logs)
treatmentsRoute.delete('/:id', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const treatmentId = c.req.param('id');

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({ success: false, error: { code: 'NO_ROUTINE', message: 'No routine found' } }, 404);
    }

    const [deleted] = await db
      .delete(treatments)
      .where(and(eq(treatments.id, treatmentId), eq(treatments.routineId, routine.id)))
      .returning({ id: treatments.id });

    if (!deleted) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Treatment not found' } }, 404);
    }

    return c.json({ success: true, data: { id: deleted.id } });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    return c.json({
      success: false,
      error: { code: 'DELETE_TREATMENT_ERROR', message: 'Failed to delete treatment', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

export default treatmentsRoute;
