import { pgTable, serial, text, integer, timestamp, uuid, unique } from 'drizzle-orm/pg-core';

export const onboardingQuestions = pgTable('onboarding_questions', {
  id: serial('id').primaryKey(),
  questionText: text('question_text').notNull(),
  questionOrder: integer('question_order').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const onboardingOptions = pgTable('onboarding_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id')
    .notNull()
    .references(() => onboardingQuestions.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(),
  optionOrder: integer('option_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueQuestionOption: unique().on(table.questionId, table.optionOrder),
}));

export const onboardingResponses = pgTable('onboarding_responses', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  sessionId: text('session_id'),
  questionId: integer('question_id')
    .notNull()
    .references(() => onboardingQuestions.id),
  optionId: integer('option_id')
    .notNull()
    .references(() => onboardingOptions.id),
  answeredAt: timestamp('answered_at').defaultNow().notNull(),
});
