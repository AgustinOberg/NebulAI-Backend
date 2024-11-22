import { getDb } from '@/db/db';
import { authenticate } from '@/middlewares/common/authenticate';
import { createAttempt, getAttemptsById } from '@/services/attempt.service';
import { getRouter } from '@/utils/router.utils';
import { createAttemptValidation } from '@/validations/attempt/create-attempt.validation';
import { zValidator } from '@hono/zod-validator';

export const attemptRouter = getRouter();

attemptRouter.post(
  '/',
  authenticate,
  zValidator('json', createAttemptValidation),
  async (c) => {
    const db = await getDb(c);
    const user = c.get('user');
    const attempt = c.req.valid('json');
    const data = await createAttempt(db, user, attempt);
    return c.json(data, 201);
  },
);

attemptRouter.get('/challenge/:challengeId', authenticate, async (c) => {
  const challengeId = c.req.param('challengeId')!;
  const db = await getDb(c);
  const user = c.get('user');
  const attempts = await getAttemptsById(db, user, challengeId);
  return c.json(attempts);
});
