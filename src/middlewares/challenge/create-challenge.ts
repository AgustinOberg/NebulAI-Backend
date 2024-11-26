import { throwError } from '@/constants/error.constants';
import { Language } from '@/constants/language.constants';
import { getDb } from '@/db/db';
import { User } from '@/db/schema';
import challengeService from '@/services/challenge.service';
import { MiddlewareContext } from '@/types/context.type';
import { CreateChallengePayload } from '@/validations/challenge/create-challenge.validation';
import { createMiddleware } from 'hono/factory';

type Variables = {
  challenge: any;
} & { user: User };

export const createChallenge = createMiddleware(
  async (c: MiddlewareContext<CreateChallengePayload, Variables>, next) => {
    const db = await getDb(c);
    const user = c.get('user');
    const rawPrompt = await c.env.PROMPTS.get('ai_prompt');
    if (!rawPrompt) return throwError({ message: 'ERROR_PROMPT' });
    const prompt = challengeService.getAiInstructions(
      rawPrompt,
      c.req.valid('json').difficulty,
      user.locale as Language,
    );

    const challenge = (await challengeService.generateChallenge(
      c.req.valid('json'),
      { key: c.env.GEMINI_API_KEY, prompt },
    )) as any;

    const createdChallenge = await challengeService.createChallenge(
      db,
      user,
      challenge,
    );
    c.set('challenge', createdChallenge);
    return next();
  },
);
