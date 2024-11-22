import { z } from 'zod';

export const createAttemptValidation = z.object({
  score: z.number().min(0).max(100),
  answers: z.array(z.string()),
  challenge: z.string(),
});

export type CreateAttemptPayload = z.infer<typeof createAttemptValidation>;
