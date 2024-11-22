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
    const challenge = (await challengeService.generateChallenge(
      c.req.valid('json'),
      user,
      c.env.GEMINI_API_KEY,
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
