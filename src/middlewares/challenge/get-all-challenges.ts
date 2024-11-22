import { getDb } from '@/db/db';
import { Challenge, User } from '@/db/schema';
import challengeService from '@/services/challenge.service';
import { MiddlewareContext } from '@/types/context.type';
import { createMiddleware } from 'hono/factory';

type Variables = {
  user: User;
  challenges: Challenge[];
};

export const getAllChallenges = createMiddleware(
  async (c: MiddlewareContext<undefined, Variables>, next) => {
    const db = await getDb(c);
    const challenges = await challengeService.getAllChallenges(
      db,
      c.get('user'),
    );
    c.set('challenges', challenges);
    return next();
  },
);
