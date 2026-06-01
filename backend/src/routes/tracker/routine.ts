import { Hono } from 'hono';
import { createDrizzleConnection } from '../../db/drizzle';
import { routines } from '../../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { log } from '../../lib/logger';
import { createPostHogClient, type PostHogEnv } from '../../lib/posthog';
import { extractUserId } from '../../lib/auth';

type Env = { DATABASE_URL: string; CLERK_SECRET_KEY: string } & PostHogEnv;
type Variables = { userId: string };

const routineTracker = new Hono<{ Bindings: Env; Variables: Variables }>();

routineTracker.use('*', async (c, next) => {
  const userId = await extractUserId(c.req.header('Authorization'), c.env.CLERK_SECRET_KEY);
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
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
      .where(and(eq(routines.userId, userId), isNull(routines.deletedAt)))
      .limit(1);

    if (!routine) {
      return c.json({ success: true, data: null });
    }

    return c.json({ success: true, data: routine });
  } catch (error) {
    log.error('routine fetch failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'FETCH_ROUTINE_ERROR', message: 'Failed to fetch routine' },
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
      .where(and(eq(routines.userId, userId), isNull(routines.deletedAt)))
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

    const posthog = createPostHogClient(c.env)
    posthog.capture({ distinctId: userId, event: 'routine_created', properties: { routine_id: routine.id } })
    await posthog.shutdown()

    return c.json({ success: true, data: routine }, 201);
  } catch (error) {
    log.error('routine create failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: { code: 'CREATE_ROUTINE_ERROR', message: 'Failed to create routine' },
    }, 500);
  }
});

export default routineTracker;
