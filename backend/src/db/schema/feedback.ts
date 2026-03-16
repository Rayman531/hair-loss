import { pgTable, bigint, text, timestamp } from 'drizzle-orm/pg-core';

export const feedback = pgTable('feedback', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  userId: text('user_id').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
