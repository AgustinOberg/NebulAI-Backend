import { z } from 'zod';

export const authWithGoogleValidation = z.object({
  idToken: z.string(),
});

export type GoogleAuthPayload = z.infer<typeof authWithGoogleValidation>;
