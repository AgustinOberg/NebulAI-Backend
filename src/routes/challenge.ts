import {
  createChallenge,
  getAllChallenges,
  getChallengeById,
} from '@/middlewares/challenge';
import { authenticate } from '@/middlewares/common/authenticate';
import { getRouter } from '@/utils/router.utils';
import { createChallengeValidation } from '@/validations/challenge/create-challenge.validation';
import { zValidator } from '@hono/zod-validator';

export const challengeRouter = getRouter();

challengeRouter.post(
  '/',
  authenticate,
  zValidator('json', createChallengeValidation),
  createChallenge,
  async (c) => {
    return c.json(c.get('challenge'));
  },
);

challengeRouter.get('/all', authenticate, getAllChallenges, async (c) => {
  return c.json({ data: c.get('challenges') });
});

challengeRouter.get('/:id', authenticate, getChallengeById, async (c) => {
  return c.json(c.get('challenge'));
});
