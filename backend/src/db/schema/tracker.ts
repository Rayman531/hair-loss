import {
  pgTable,
  bigint,
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
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  userId: text('user_id').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const routinesRelations = relations(routines, ({ many }) => ({
  treatments: many(treatments),
}));

// ─── Treatments ──────────────────────────────────────────────
// Individual treatments within a routine.
export const treatments = pgTable('treatments', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  routineId: bigint('routine_id', { mode: 'number' })
    .notNull()
    .references(() => routines.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  daysOfWeek: text('days_of_week').array().notNull().default([]),
  frequencyPerWeek: integer('frequency_per_week').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
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
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  treatmentId: bigint('treatment_id', { mode: 'number' })
    .notNull()
    .references(() => treatments.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
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
