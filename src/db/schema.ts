import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  thirdPartyAuthId: text('third_party_auth_id').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  name: text('name').notNull(),
  picture: text('picture'),
  locale: text('locale').notNull().default('es'),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  attemptsMade: integer('attempts_made').notNull().default(0),
  challengesMade: integer('challenges_made').notNull().default(0),
});

export const userActions = sqliteTable('user_actions', {
  userId: text('user_id')
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ocr: integer('ocr').notNull().default(0),
  textExtraction: integer('text_extraction').notNull().default(0),
  geminiCredits: integer('gemini_credits').notNull().default(0),
});

export const userRoles = sqliteTable(
  'user_roles',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.role),
  }),
);

export const challenges = sqliteTable('challenges', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  provider: text('provider').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  difficulty: text('difficulty').notNull(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  language: text('language').notNull().default('es'),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey().notNull(),
  challengeId: text('challenge_id')
    .notNull()
    .references(() => challenges.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
});

export const options = sqliteTable('options', {
  id: text('id').primaryKey().notNull(),
  questionId: text('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
});

export const attempts = sqliteTable('attempts', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  challengeId: text('challenge_id')
    .notNull()
    .references(() => challenges.id, { onDelete: 'cascade' }),
  score: real('score').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const attemptAnswers = sqliteTable(
  'attempt_answers',
  {
    attemptId: text('attempt_id')
      .notNull()
      .references(() => attempts.id, { onDelete: 'cascade' }),
    questionId: text('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    optionId: text('option_id')
      .notNull()
      .references(() => options.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey(table.attemptId, table.questionId),
  }),
);
export type User = typeof users.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
