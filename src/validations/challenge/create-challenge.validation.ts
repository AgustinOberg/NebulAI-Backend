import { z } from 'zod';

export const createChallengeValidation = z.object({
  content: z.string(),
  difficulty: z.number().min(1).max(5),
});

export type CreateChallengePayload = z.infer<typeof createChallengeValidation>;
