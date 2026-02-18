import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Routines ────────────────────────────────────────────────
// One active routine per user.
export const routines = pgTable('routines', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const routinesRelations = relations(routines, ({ many }) => ({
  treatments: many(treatments),
  sideEffectLogs: many(sideEffectLogs),
}));

// ─── Treatments ──────────────────────────────────────────────
// Individual treatments within a routine.
export const treatments = pgTable('treatments', {
  id: uuid('id').defaultRandom().primaryKey(),
  routineId: uuid('routine_id')
    .notNull()
    .references(() => routines.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  frequencyPerWeek: integer('frequency_per_week').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  routineIdx: index('treatments_routine_id_idx').on(table.routineId),
}));

export const treatmentsRelations = relations(treatments, ({ one, many }) => ({
  routine: one(routines, {
    fields: [treatments.routineId],
    references: [routines.id],
  }),
  treatmentLogs: many(treatmentLogs),
}));

// ─── Treatment Logs (Adherence) ─────────────────────────────
// One log per treatment per date.
export const treatmentLogs = pgTable('treatment_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  treatmentId: uuid('treatment_id')
    .notNull()
    .references(() => treatments.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueTreatmentDate: unique('treatment_logs_treatment_date_unq').on(
    table.treatmentId,
    table.date,
  ),
  treatmentIdx: index('treatment_logs_treatment_id_idx').on(table.treatmentId),
  dateIdx: index('treatment_logs_date_idx').on(table.date),
}));

export const treatmentLogsRelations = relations(treatmentLogs, ({ one }) => ({
  treatment: one(treatments, {
    fields: [treatmentLogs.treatmentId],
    references: [treatments.id],
  }),
}));

// ─── Side Effect Logs ───────────────────────────────────────
// One entry per routine per week.
export const sideEffectLogs = pgTable('side_effect_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  routineId: uuid('routine_id')
    .notNull()
    .references(() => routines.id, { onDelete: 'cascade' }),
  weekStartDate: date('week_start_date').notNull(),
  notes: text('notes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueRoutineWeek: unique('side_effect_logs_routine_week_unq').on(
    table.routineId,
    table.weekStartDate,
  ),
  routineIdx: index('side_effect_logs_routine_id_idx').on(table.routineId),
  weekStartIdx: index('side_effect_logs_week_start_idx').on(table.weekStartDate),
}));

export const sideEffectLogsRelations = relations(sideEffectLogs, ({ one }) => ({
  routine: one(routines, {
    fields: [sideEffectLogs.routineId],
    references: [routines.id],
  }),
}));
