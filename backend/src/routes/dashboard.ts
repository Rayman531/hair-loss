import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { routines, treatments, progressSessions } from '../db/schema';
import { eq, and, asc, isNull } from 'drizzle-orm';
import { log } from '../lib/logger';

type Env = {
  DATABASE_URL: string;
};

type Variables = {
  userId: string;
};

type Treatment = typeof treatments.$inferSelect;

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getTodaysTreatments(allTreatments: Treatment[]): Treatment[] {
  const today = DAYS[new Date().getDay()];
  return allTreatments.filter((t) =>
    t.daysOfWeek.length === 0 || t.daysOfWeek.includes(today)
  );
}

const MOTIVATIONAL_MESSAGES = [
  'Male pattern baldness is extremely common, by age 50, ~50% of men are affected, so you\'re not alone in this.',
  'Minoxidil can regrow and thicken miniaturized hairs in many users, consistency is key.',
  'The "Big 4" (finasteride, minoxidil, ketoconazole, microneedling) covers the major mechanisms behind AGA.',
  'Early intervention dramatically improves outcomes, starting now is scientifically smarter than waiting.',
  'Hair follicles in AGA shrink (miniaturize) before they die, meaning many are still recoverable.',
  'Progress pics show real reversals when you stay consistent.',
  'Research on next-gen treatments (e.g., pyrilutamide, GT20029) is ongoing, innovation hasn\'t stopped!',
  'Most hair loss is genetic and hormonal, not your fault, not from wearing hats or shampoo.',
  'A simple daily routine (5 minutes morning and night) can biologically change your hair\'s trajectory over months.',
] as const;

function getMotivationalMessage(): string {
  const dayIndex = new Date().getDate() % MOTIVATIONAL_MESSAGES.length;
  return MOTIVATIONAL_MESSAGES[dayIndex];
}

const dashboard = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard: extract userId from X-User-Id header
dashboard.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  c.set('userId', userId);
  await next();
});

// GET /api/dashboard — return dashboard data for the authenticated user
dashboard.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    // Get the user's active routine
    const [routine] = await db
      .select()
      .from(routines)
      .where(and(eq(routines.userId, userId), isNull(routines.deletedAt)))
      .limit(1);

    const [userTreatments, progressPhotos] = await Promise.all([
      routine
        ? db
            .select()
            .from(treatments)
            .where(and(eq(treatments.routineId, routine.id), isNull(treatments.deletedAt)))
            .orderBy(asc(treatments.createdAt))
        : Promise.resolve([]),
      db
        .select({ id: progressSessions.id })
        .from(progressSessions)
        .where(and(eq(progressSessions.userId, userId), isNull(progressSessions.deletedAt)))
        .limit(1),
    ]);

    const todaysTreatments = getTodaysTreatments(userTreatments);

    const motivationalMessage = getMotivationalMessage();

    const progressTrackerInitialized = progressPhotos.length > 0;

    return c.json({ success: true, data: { treatments: userTreatments, todaysTreatments, motivationalMessage, progressTrackerInitialized } });
  } catch (error) {
    log.error('dashboard fetch failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: {
        code: 'FETCH_DASHBOARD_ERROR',
        message: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});

export default dashboard;
