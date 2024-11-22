import {
  User,
  options,
  questions,
  attempts,
  attemptAnswers,
  users,
  challenges,
} from '@/db/schema';
import { getUUID } from '@/utils/string.utils';
import { CreateAttemptPayload } from '@/validations/attempt/create-attempt.validation';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export const createAttempt = async (
  db: DrizzleD1Database,
  user: User,
  attempt: CreateAttemptPayload,
) => {
  const challengeExists = await db
    .select()
    .from(challenges)
    .where(eq(challenges.id, attempt.challenge))
    .limit(1);

  if (challengeExists.length === 0) {
    throw new Error('Challenge not found');
  }
  const validOptions = await db
    .select({
      optionId: options.id,
      questionId: options.questionId,
    })
    .from(options)
    .innerJoin(questions, eq(questions.id, options.questionId))
    .where(eq(questions.challengeId, attempt.challenge));

  const validOptionIds = validOptions.map((opt) => opt.optionId);
  const invalidOptions = attempt.answers.filter(
    (optionId) => !validOptionIds.includes(optionId),
  );

  if (invalidOptions.length > 0) {
    throw new Error(`Invalid options: ${invalidOptions.join(', ')}`);
  }
  const attemptId = getUUID();
  await db.insert(attempts).values({
    id: attemptId,
    userId: user.id,
    challengeId: attempt.challenge,
    score: attempt.score,
  });
  const answers = attempt.answers.map((optionId) => {
    const question = validOptions.find((opt) => opt.optionId === optionId);
    return {
      attemptId,
      questionId: question?.questionId || '',
      optionId,
    };
  });

  await db.insert(attemptAnswers).values(answers);
  await db
    .update(users)
    .set({ attemptsMade: sql`${users.attemptsMade} + 1` })
    .where(eq(users.id, user.id));

  return {
    id: attemptId,
    ...attempt,
  };
};

export const getAttemptsById = async (
  db: DrizzleD1Database,
  user: User,
  challengeId: string,
) => {
  const challengeAttempts = await db
    .select({
      id: attempts.id,
      score: attempts.score,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .where(
      and(eq(attempts.challengeId, challengeId), eq(attempts.userId, user.id)),
    )
    .execute();
  if (challengeAttempts.length === 0) {
    return [];
  }
  const attemptIds = challengeAttempts.map((attempt) => attempt.id);

  const selectedAnswers = await db
    .select({
      option: attemptAnswers.optionId,
      attemptId: attemptAnswers.attemptId,
    })
    .from(attemptAnswers)
    .where(inArray(attemptAnswers.attemptId, attemptIds))
    .execute();

  const answersByAttempt = selectedAnswers.reduce(
    (acc, answer) => {
      if (!acc[answer.attemptId]) {
        acc[answer.attemptId] = [];
      }
      acc[answer.attemptId].push(answer.option);
      return acc;
    },
    {} as Record<string, string[]>,
  );
  return challengeAttempts.map((eachAttempt) => ({
    ...eachAttempt,
    answers: answersByAttempt[eachAttempt.id] || [],
  }));
};
