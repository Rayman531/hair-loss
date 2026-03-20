import {
  pgTable,
  bigint,
  text,
  boolean,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';

// ─── Push Tokens ─────────────────────────────────────────────
// Stores Expo push tokens for each user/device pair.
export const pushTokens = pgTable('push_tokens', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueUserToken: unique('push_tokens_user_token_unq').on(table.userId, table.token),
  userIdx: index('push_tokens_user_id_idx').on(table.userId),
}));

// ─── Notification Preferences ────────────────────────────────
// Per-user notification settings.
export const notificationPreferences = pgTable('notification_preferences', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  userId: text('user_id').notNull().unique(),
  enabled: boolean('enabled').notNull().default(true),
  reminderHour: bigint('reminder_hour', { mode: 'number' }).notNull().default(9),   // 0-23
  reminderMinute: bigint('reminder_minute', { mode: 'number' }).notNull().default(0), // 0-59
  timezone: text('timezone').notNull().default('UTC'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
