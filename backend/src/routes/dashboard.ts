import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { userRoutines, progressSessions } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

type Env = {
  DATABASE_URL: string;
};

type Variables = {
  userId: string;
};

type Routine = typeof userRoutines.$inferSelect;

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getTodaysTreatments(routines: Routine[]): Routine[] {
  const today = DAYS[new Date().getDay()];
  return routines.filter((r) =>
    r.daysOfWeek.includes(today) || r.daysOfWeek.includes('daily')
  );
}

const MOTIVATIONAL_MESSAGES = [
  'Male pattern baldness is extremely common — by age 50, ~50% of men are affected, so you\'re not alone in this.',
  'Minoxidil can regrow and thicken miniaturized hairs in many users — consistency is key.',
  'The "Big 4" (finasteride, minoxidil, ketoconazole, microneedling) covers the major mechanisms behind AGA.',
  'Early intervention dramatically improves outcomes — starting now is scientifically smarter than waiting.',
  'Hair follicles in AGA shrink (miniaturize) before they die, meaning many are still recoverable.',
  'Progress pics show real reversals when you stay consistent.',
  'Research on next-gen treatments (e.g., pyrilutamide, GT20029) is ongoing — innovation hasn\'t stopped!',
  'Most hair loss is genetic and hormonal — not your fault, not from wearing hats or shampoo.',
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

// GET /api/dashboard — return all routines for the authenticated user
dashboard.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const [routines, progressPhotos] = await Promise.all([
      db
        .select()
        .from(userRoutines)
        .where(eq(userRoutines.userId, userId))
        .orderBy(asc(userRoutines.createdAt)),
      db
        .select({ id: progressSessions.id })
        .from(progressSessions)
        .where(eq(progressSessions.userId, userId))
        .limit(1),
    ]);

    const todaysTreatments = getTodaysTreatments(routines);

    const motivationalMessage = getMotivationalMessage();

    const progressTrackerInitialized = progressPhotos.length > 0;

    return c.json({ success: true, data: { routines, todaysTreatments, motivationalMessage, progressTrackerInitialized } });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
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
