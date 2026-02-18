import { eq, and, gte, lte, inArray } from 'drizzle-orm';
import { routines, treatments, treatmentLogs, userRoutines } from '../db/schema';
import type { DrizzleDB } from '../db/drizzle';

// ─── Treatment label mapping ────────────────────────────────

const TREATMENT_LABELS: Record<string, string> = {
  minoxidil: 'Minoxidil 5%',
  finasteride: 'Finasteride 1mg',
  microneedling: 'Microneedling',
  ketoconazole: 'Ketoconazole Shampoo',
  hair_oils: 'Hair Oils',
};

// ─── Types ──────────────────────────────────────────────────

interface TreatmentConsistency {
  treatment_id: string;
  name: string;
  completed_days: number;
  expected_days: number;
  percentage: number;
}

interface RoutineSummary {
  journey_day: number;
  routine_created_at: string;
  weekly_consistency: TreatmentConsistency[];
}

interface HeatmapDay {
  date: string;
  completion_ratio: number;
}

interface HeatmapResult {
  month: string;
  days: HeatmapDay[];
}

// ─── Helpers ────────────────────────────────────────────────

/** Get Monday of the current week (Monday–Sunday standard). */
function getCurrentWeekMonday(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  return formatDate(monday);
}

/** Get Sunday of the current week. */
function getCurrentWeekSunday(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 0 : 7 - day;
  const sunday = new Date(now);
  sunday.setUTCDate(now.getUTCDate() + diff);
  return formatDate(sunday);
}

/** Format a Date as YYYY-MM-DD. */
function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get month boundaries. Returns { startDate, endDate, lastDay }. */
function getMonthBounds(month: string): { startDate: string; endDate: string; lastDay: number } {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr);
  const mon = parseInt(monthStr);
  const lastDay = new Date(year, mon, 0).getDate();
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, '0')}`,
    lastDay,
  };
}

// ─── Service Functions ──────────────────────────────────────

/**
 * Auto-seed the tracker tables from legacy userRoutines data.
 * Creates a `routines` row and corresponding `treatments` rows.
 * Returns the newly created routine or null if no legacy data exists.
 */
async function seedTrackerFromLegacy(db: DrizzleDB, userId: string) {
  const legacyRoutines = await db
    .select()
    .from(userRoutines)
    .where(eq(userRoutines.userId, userId));

  if (legacyRoutines.length === 0) return null;

  // Create the tracker routine
  const [routine] = await db
    .insert(routines)
    .values({ userId })
    .returning();

  // Create a treatment for each legacy routine entry
  for (const lr of legacyRoutines) {
    const name = TREATMENT_LABELS[lr.treatmentType] ?? lr.treatmentType;
    const frequencyPerWeek = lr.daysOfWeek.includes('daily') ? 7 : lr.daysOfWeek.length;

    await db.insert(treatments).values({
      routineId: routine.id,
      name,
      frequencyPerWeek,
    });
  }

  return routine;
}

/**
 * Compute routine summary: journey day + weekly consistency per treatment.
 * Returns null if user has no routine.
 */
export async function computeRoutineSummary(
  db: DrizzleDB,
  userId: string,
): Promise<RoutineSummary | null> {
  // 1. Fetch routine
  let [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.userId, userId))
    .limit(1);

  // Auto-seed from legacy userRoutines if tracker routine doesn't exist
  if (!routine) {
    const seeded = await seedTrackerFromLegacy(db, userId);
    if (!seeded) return null;
    routine = seeded;
  }

  // 2. Journey day (day 1 = creation day)
  const now = new Date();
  const created = new Date(routine.createdAt);
  const diffMs = now.getTime() - created.getTime();
  const journeyDay = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  // 3. Fetch all treatments for this routine
  const userTreatments = await db
    .select()
    .from(treatments)
    .where(eq(treatments.routineId, routine.id));

  if (userTreatments.length === 0) {
    return {
      journey_day: journeyDay,
      routine_created_at: routine.createdAt.toISOString(),
      weekly_consistency: [],
    };
  }

  // 4. Batch fetch completed logs for current week across all treatments
  const weekStart = getCurrentWeekMonday();
  const weekEnd = getCurrentWeekSunday();
  const treatmentIds = userTreatments.map((t) => t.id);

  const weekLogs = await db
    .select({
      treatmentId: treatmentLogs.treatmentId,
      completed: treatmentLogs.completed,
    })
    .from(treatmentLogs)
    .where(
      and(
        inArray(treatmentLogs.treatmentId, treatmentIds),
        gte(treatmentLogs.date, weekStart),
        lte(treatmentLogs.date, weekEnd),
        eq(treatmentLogs.completed, true),
      ),
    );

  // 5. Count completed days per treatment
  const completedCounts = new Map<string, number>();
  for (const log of weekLogs) {
    completedCounts.set(log.treatmentId, (completedCounts.get(log.treatmentId) ?? 0) + 1);
  }

  // 6. Build consistency array
  const weeklyConsistency: TreatmentConsistency[] = userTreatments.map((t) => {
    const completedDays = completedCounts.get(t.id) ?? 0;
    const expectedDays = t.frequencyPerWeek;
    const percentage = expectedDays > 0 ? Math.round((completedDays / expectedDays) * 100) : 0;

    return {
      treatment_id: t.id,
      name: t.name,
      completed_days: completedDays,
      expected_days: expectedDays,
      percentage: Math.min(percentage, 100),
    };
  });

  return {
    journey_day: journeyDay,
    routine_created_at: routine.createdAt.toISOString(),
    weekly_consistency: weeklyConsistency,
  };
}

/**
 * Compute monthly heatmap: completion ratio per day for a given month.
 * Returns null if user has no routine.
 */
export async function computeMonthlyHeatmap(
  db: DrizzleDB,
  userId: string,
  month: string,
): Promise<HeatmapResult | null> {
  // 1. Fetch routine (auto-seed handled by computeRoutineSummary if called first)
  let [routine] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(eq(routines.userId, userId))
    .limit(1);

  if (!routine) {
    const seeded = await seedTrackerFromLegacy(db, userId);
    if (!seeded) return null;
    routine = { id: seeded.id };
  }

  // 2. Fetch all active treatments
  const userTreatments = await db
    .select({ id: treatments.id })
    .from(treatments)
    .where(eq(treatments.routineId, routine.id));

  const totalTreatments = userTreatments.length;
  const { startDate, endDate, lastDay } = getMonthBounds(month);

  // No treatments → all days have 0 ratio
  if (totalTreatments === 0) {
    const days: HeatmapDay[] = [];
    for (let d = 1; d <= lastDay; d++) {
      days.push({
        date: `${month}-${String(d).padStart(2, '0')}`,
        completion_ratio: 0,
      });
    }
    return { month, days };
  }

  // 3. Batch fetch all completed logs for the month in one query
  const treatmentIds = userTreatments.map((t) => t.id);

  const monthLogs = await db
    .select({
      date: treatmentLogs.date,
      treatmentId: treatmentLogs.treatmentId,
    })
    .from(treatmentLogs)
    .where(
      and(
        inArray(treatmentLogs.treatmentId, treatmentIds),
        gte(treatmentLogs.date, startDate),
        lte(treatmentLogs.date, endDate),
        eq(treatmentLogs.completed, true),
      ),
    );

  // 4. Group completed treatments by date (use Set to avoid double-counting)
  const completedByDate = new Map<string, Set<string>>();
  for (const log of monthLogs) {
    if (!completedByDate.has(log.date)) {
      completedByDate.set(log.date, new Set());
    }
    completedByDate.get(log.date)!.add(log.treatmentId);
  }

  // 5. Build heatmap days
  const days: HeatmapDay[] = [];
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${month}-${String(d).padStart(2, '0')}`;
    const completedSet = completedByDate.get(dateStr);
    const completedCount = completedSet ? completedSet.size : 0;
    const ratio = Math.round((completedCount / totalTreatments) * 100) / 100;

    days.push({
      date: dateStr,
      completion_ratio: ratio,
    });
  }

  return { month, days };
}
