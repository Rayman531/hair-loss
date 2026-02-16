import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const progressSessions = pgTable('progress_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  note: text('note'),
  frontImageUrl: text('front_image_url').notNull(),
  topImageUrl: text('top_image_url').notNull(),
  rightImageUrl: text('right_image_url').notNull(),
  leftImageUrl: text('left_image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
