import { pgTable, bigint, text, timestamp, index } from 'drizzle-orm/pg-core';

export const progressSessions = pgTable('progress_sessions', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  userId: text('user_id').notNull(),
  note: text('note'),
  frontImageUrl: text('front_image_url').notNull(),
  topImageUrl: text('top_image_url').notNull(),
  rightImageUrl: text('right_image_url').notNull(),
  leftImageUrl: text('left_image_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  userIdx: index('progress_session_user_id_idx').on(table.userId),
}));
