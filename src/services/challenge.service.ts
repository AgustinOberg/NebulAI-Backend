import { getGeminiModel } from '@/config/gemini';
import { AI_INSTRUCTIONS } from '@/constants/ai.constants';
import { GEMINI_CHALLENGE_CONFIG } from '@/constants/gemini.constants';
import { Language } from '@/constants/language.constants';
import {
  challenges,
  questions as questionsTable,
  options as optionsTable,
  users,
  User,
  Challenge,
  options,
  questions,
} from '@/db/schema';
import { GeminiChallengeResponse } from '@/types/gemini.type';
import { createContent } from '@/utils/ai.utils';
import { getUUID } from '@/utils/string.utils';
import { CreateChallengePayload } from '@/validations/challenge/create-challenge.validation';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { sql, eq, and } from 'drizzle-orm';
import { FullChallenge } from '@/types/challenge.type';

type OptionData = {
  id: string;
  description: string;
  isCorrect: boolean;
};

type QuestionData = {
  question: string;
  options: OptionData[];
};

type ChallengeData = {
  questions: QuestionData[];
  response: GeminiChallengeResponse;
  totalTokens: number;
  difficulty: string;
};

const generateChallengeInfo = async (
  payload: CreateChallengePayload,
  language: Language = 'es',
  apiKey: string,
): Promise<{ response: GeminiChallengeResponse; totalTokens: number }> => {
  const geminiModel = getGeminiModel(apiKey);
  const contents = createContent(
    payload.content,
    AI_INSTRUCTIONS(payload.difficulty, language),
  );
  const { totalTokens } = await geminiModel.countTokens({ contents });

  const result = await geminiModel.generateContent({
    contents,
    generationConfig: {
      ...GEMINI_CHALLENGE_CONFIG,
    },
  });
  const responseText = await result.response.text();
  const response = JSON.parse(responseText) as GeminiChallengeResponse;
  return { response, totalTokens };
};

const generateChallenge = async (
  payload: CreateChallengePayload,
  user: User,
  apiKey: string,
): Promise<ChallengeData> => {
  const { response, totalTokens } = await generateChallengeInfo(
    payload,
    user.locale as Language,
    apiKey,
  );

  const questions: QuestionData[] =
    response.questions?.map((q) => {
      const options: OptionData[] = q.options.map(
        (optionText: string, index: number) => ({
          id: getUUID(),
          description: optionText,
          isCorrect: index === q.correctAnswerIndex,
        }),
      );
      return {
        question: q.question,
        options,
      };
    }) || [];

  return {
    questions,
    totalTokens,
    response,
    difficulty: payload.difficulty.toString(),
  };
};

const getAllChallenges = async (db: DrizzleD1Database, user: User) => {
  const challengesList = await db
    .select({
      title: challenges.title,
      description: challenges.description,
      difficulty: challenges.difficulty,
      createdAt: challenges.createdAt,
      id: challenges.id,
    })
    .from(challenges)
    .where(eq(challenges.ownerId, user.id));

  return challengesList as Challenge[];
};

//TODO: optimize this
const createChallenge = async (
  db: DrizzleD1Database,
  user: User,
  data: ChallengeData,
) => {
  const newChallengeId = getUUID();

  const newChallenge = {
    id: newChallengeId,
    title: data.response.title,
    description: data.response.description,
    provider: 'GEMINI',
    totalTokens: data.totalTokens,
    difficulty: data.difficulty,
    ownerId: user.id,
    language: user.locale,
  };
  await db.insert(challenges).values(newChallenge).execute();
  const questionsWithIds: any[] = [];
  for (const question of data.questions) {
    const newQuestionId = getUUID();
    const newQuestion = {
      id: newQuestionId,
      challengeId: newChallengeId,
      questionText: question.question,
    };
    await db.insert(questionsTable).values(newQuestion).run();

    const optionsWithIds: OptionData[] = [];

    for (const option of question.options) {
      const optionId = getUUID();

      const newOption = {
        id: optionId,
        questionId: newQuestionId,
        description: option.description,
        isCorrect: option.isCorrect,
      };

      await db.insert(optionsTable).values(newOption).run();

      optionsWithIds.push({
        id: optionId,
        description: option.description,
        isCorrect: option.isCorrect,
      });
    }

    questionsWithIds.push({
      id: newQuestionId,
      question: question.question,
      options: optionsWithIds,
    });
  }
  await db
    .update(users)
    .set({ challengesMade: sql`challenges_made + 1` })
    .where(eq(users.id, user.id))
    .run();

  const challengeWithDetails = {
    ...newChallenge,
    questions: questionsWithIds,
  };
  return challengeWithDetails;
};

const getChallengeById = async (
  db: DrizzleD1Database,
  user: User,
  challengeId: string,
) => {
  const [challenge] = await db
    .select()
    .from(challenges)
    .where(and(eq(challenges.id, challengeId), eq(challenges.ownerId, user.id)))
    .execute();

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  const rows = await db
    .select({
      questionId: questions.id,
      questionText: questions.questionText,
      optionId: options.id,
      optionDescription: options.description,
      isCorrect: options.isCorrect,
    })
    .from(questions)
    .leftJoin(options, eq(options.questionId, questions.id))
    .where(eq(questions.challengeId, challengeId))
    .execute();

  const questionMap = new Map<
    string,
    {
      id: string;
      question: string;
      options: Array<{
        id: string;
        description: string;
        isCorrect: boolean;
      }>;
    }
  >();

  rows.forEach((row) => {
    let question = questionMap.get(row.questionId);
    if (!question) {
      question = {
        id: row.questionId,
        question: row.questionText,
        options: [],
      };
      questionMap.set(row.questionId, question);
    }
    if (row.optionId) {
      question.options.push({
        id: row.optionId,
        description: row.optionDescription!,
        isCorrect: Boolean(row.isCorrect),
      });
    }
  });

  const questionsArray = Array.from(questionMap.values());

  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    provider: challenge.provider,
    totalTokens: challenge.totalTokens,
    difficulty: challenge.difficulty,
    ownerId: challenge.ownerId,
    language: challenge.language,
    createdAt: challenge.createdAt,
    questions: questionsArray,
  } as unknown as FullChallenge;
};

export default {
  generateChallenge,
  createChallenge,
  getAllChallenges,
  getChallengeById,
};
