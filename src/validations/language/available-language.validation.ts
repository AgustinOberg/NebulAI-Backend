import { AVAILABLE_LANGUAGES, Language } from '@/constants/language.constants';
import { z } from 'zod';

export const availableLanguageValidation = z.object({
  locale: z
    .string()
    .refine((value) => AVAILABLE_LANGUAGES.includes(value as Language), {
      message: 'Invalid language',
    }),
});

export type LanguagePayload = z.infer<typeof availableLanguageValidation>;
