import { pgTable, pgEnum, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const treatmentTypeEnum = pgEnum('treatment_type', [
  'minoxidil',
  'finasteride',
  'microneedling',
  'ketoconazole',
  'hair_oils',
]);

export const userRoutines = pgTable('user_routines', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  treatmentType: treatmentTypeEnum('treatment_type').notNull(),
  timeOfDay: text('time_of_day').notNull(),
  daysOfWeek: text('days_of_week').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserTreatment: unique().on(table.userId, table.treatmentType),
}));
