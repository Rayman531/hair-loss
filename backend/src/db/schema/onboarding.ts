import { pgTable, bigint, text, integer, timestamp, unique, index } from 'drizzle-orm/pg-core';

export const onboardingQuestions = pgTable('onboarding_questions', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  questionText: text('question_text').notNull(),
  questionOrder: integer('question_order').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const onboardingOptions = pgTable('onboarding_options', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  questionId: bigint('question_id', { mode: 'number' })
    .notNull()
    .references(() => onboardingQuestions.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(),
  optionOrder: integer('option_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueQuestionOption: unique().on(table.questionId, table.optionOrder),
  questionIdx: index('onboarding_option_question_id_idx').on(table.questionId),
}));

export const onboardingResponses = pgTable('onboarding_responses', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  userId: text('user_id'),
  sessionId: text('session_id'),
  questionId: bigint('question_id', { mode: 'number' })
    .notNull()
    .references(() => onboardingQuestions.id, { onDelete: 'cascade' }),
  optionId: bigint('option_id', { mode: 'number' })
    .notNull()
    .references(() => onboardingOptions.id, { onDelete: 'cascade' }),
  answeredAt: timestamp('answered_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  questionIdx: index('onboarding_response_question_id_idx').on(table.questionId),
  optionIdx: index('onboarding_response_option_id_idx').on(table.optionId),
}));
