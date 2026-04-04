import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { routines, treatments } from '../../db/schema';
import { eq, and, asc, isNull } from 'drizzle-orm';
import { log } from '../../lib/logger';
import { createPostHogClient, type PostHogEnv } from '../../lib/posthog';

type Env = { DATABASE_URL: string } & PostHogEnv;
type Variables = { userId: string };

const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type DayOfWeek = typeof VALID_DAYS[number];

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
    .where(and(eq(routines.userId, userId), isNull(routines.deletedAt)))
    .limit(1);
  return routine ?? null;
}

// GET /api/tracker/treatments — list treatments for the user's routine
// Pass ?day=monday (or any weekday) to filter to only that day's treatments.
// If omitted, all treatments are returned.
treatmentsRoute.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const dayParam = c.req.query('day');

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({ success: true, data: [] });
    }

    let query = db
      .select()
      .from(treatments)
      .where(and(eq(treatments.routineId, routine.id), isNull(treatments.deletedAt)))
      .orderBy(asc(treatments.createdAt));

    const result = await query;

    // Filter server-side by day if provided.
    // Treatments with an empty daysOfWeek (saved before this field existed) are
    // treated as "all days" so existing data isn't broken.
    if (dayParam && VALID_DAYS.includes(dayParam as DayOfWeek)) {
      const filtered = result.filter(
        (t) => t.daysOfWeek.length === 0 || t.daysOfWeek.includes(dayParam),
      );
      return c.json({ success: true, data: filtered });
    }

    return c.json({ success: true, data: result });
  } catch (error) {
    log.error('treatments fetch failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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

    const body = await c.req.json<{ name: string; daysOfWeek: string[] }>();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return c.json({
        success: false,
        error: { code: 'INVALID_NAME', message: 'name is required and must be a non-empty string' },
      }, 400);
    }

    if (
      !Array.isArray(body.daysOfWeek) ||
      body.daysOfWeek.length === 0 ||
      body.daysOfWeek.length > 7 ||
      !body.daysOfWeek.every((d) => VALID_DAYS.includes(d as DayOfWeek))
    ) {
      return c.json({
        success: false,
        error: { code: 'INVALID_DAYS', message: 'daysOfWeek must be a non-empty array of valid weekday names' },
      }, 400);
    }

    const daysOfWeek = [...new Set(body.daysOfWeek)] as string[];

    const [treatment] = await db
      .insert(treatments)
      .values({
        routineId: routine.id,
        name: body.name.trim(),
        daysOfWeek,
        frequencyPerWeek: daysOfWeek.length,
      })
      .returning();

    const posthog = createPostHogClient(c.env)
    posthog.capture({
      distinctId: userId,
      event: 'treatment_added',
      properties: { treatment_id: treatment.id, treatment_name: treatment.name, frequency_per_week: treatment.frequencyPerWeek, days_of_week: treatment.daysOfWeek },
    })
    await posthog.shutdown()

    return c.json({ success: true, data: treatment }, 201);
  } catch (error) {
    log.error('treatment create failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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
    const treatmentId = Number(c.req.param('id'));

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({ success: false, error: { code: 'NO_ROUTINE', message: 'No routine found' } }, 404);
    }

    const body = await c.req.json<{ name?: string; daysOfWeek?: string[] }>();
    const updates: Partial<{ name: string; daysOfWeek: string[]; frequencyPerWeek: number; updatedAt: Date }> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return c.json({
          success: false,
          error: { code: 'INVALID_NAME', message: 'name must be a non-empty string' },
        }, 400);
      }
      updates.name = body.name.trim();
    }

    if (body.daysOfWeek !== undefined) {
      if (
        !Array.isArray(body.daysOfWeek) ||
        body.daysOfWeek.length === 0 ||
        body.daysOfWeek.length > 7 ||
        !body.daysOfWeek.every((d) => VALID_DAYS.includes(d as DayOfWeek))
      ) {
        return c.json({
          success: false,
          error: { code: 'INVALID_DAYS', message: 'daysOfWeek must be a non-empty array of valid weekday names' },
        }, 400);
      }
      updates.daysOfWeek = [...new Set(body.daysOfWeek)] as string[];
      updates.frequencyPerWeek = updates.daysOfWeek.length;
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
      .where(and(eq(treatments.id, treatmentId), eq(treatments.routineId, routine.id), isNull(treatments.deletedAt)))
      .returning();

    if (!updated) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Treatment not found' } }, 404);
    }

    const posthog = createPostHogClient(c.env)
    posthog.capture({
      distinctId: userId,
      event: 'treatment_updated',
      properties: { treatment_id: updated.id, treatment_name: updated.name, frequency_per_week: updated.frequencyPerWeek, days_of_week: updated.daysOfWeek },
    })
    await posthog.shutdown()

    return c.json({ success: true, data: updated });
  } catch (error) {
    log.error('treatment update failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'UPDATE_TREATMENT_ERROR', message: 'Failed to update treatment', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

// DELETE /api/tracker/treatments/:id — soft-delete a treatment
treatmentsRoute.delete('/:id', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const treatmentId = Number(c.req.param('id'));

    const routine = await getUserRoutine(db, userId);
    if (!routine) {
      return c.json({ success: false, error: { code: 'NO_ROUTINE', message: 'No routine found' } }, 404);
    }

    const [deleted] = await db
      .update(treatments)
      .set({ deletedAt: new Date() })
      .where(and(eq(treatments.id, treatmentId), eq(treatments.routineId, routine.id), isNull(treatments.deletedAt)))
      .returning({ id: treatments.id });

    if (!deleted) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Treatment not found' } }, 404);
    }

    const posthog = createPostHogClient(c.env)
    posthog.capture({ distinctId: userId, event: 'treatment_deleted', properties: { treatment_id: deleted.id } })
    await posthog.shutdown()

    return c.json({ success: true, data: { id: deleted.id } });
  } catch (error) {
    log.error('treatment delete failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'DELETE_TREATMENT_ERROR', message: 'Failed to delete treatment', details: error instanceof Error ? error.message : 'Unknown error' },
    }, 500);
  }
});

export default treatmentsRoute;
