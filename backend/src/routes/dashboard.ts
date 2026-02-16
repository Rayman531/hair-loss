import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { userRoutines } from '../db/schema';
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
  'Consistency is the key to results. Keep going!',
  'Every treatment brings you one step closer to your goal.',
  'Small daily actions lead to big transformations.',
  'Your future self will thank you for showing up today.',
  'Progress takes patience — trust the process.',
  'You are doing something great for yourself. Stay committed.',
  'One day at a time. You have got this!',
  'Healthy habits today, visible results tomorrow.',
  'Showing up is half the battle — and you are here.',
  'Your dedication is your superpower. Keep it up!',
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

    const routines = await db
      .select()
      .from(userRoutines)
      .where(eq(userRoutines.userId, userId))
      .orderBy(asc(userRoutines.createdAt));

    const todaysTreatments = getTodaysTreatments(routines);

    const motivationalMessage = getMotivationalMessage();

    return c.json({ success: true, data: { routines, todaysTreatments, motivationalMessage } });
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
