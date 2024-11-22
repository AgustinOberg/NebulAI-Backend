import { getDb } from '@/db/db';
import { User } from '@/db/schema';
import challengeService from '@/services/challenge.service';
import { FullChallenge } from '@/types/challenge.type';
import { MiddlewareContext } from '@/types/context.type';
import { createMiddleware } from 'hono/factory';

type Variables = { user: User; challenge: FullChallenge };

export const getChallengeById = createMiddleware(
  async (c: MiddlewareContext<undefined, Variables>, next) => {
    const db = await getDb(c);
    const user = c.get('user');
    const fullChallenge = await challengeService.getChallengeById(
      db,
      user,
      c.req.param('id')!,
    );
    c.set('challenge', fullChallenge);
    return next();
  },
);
