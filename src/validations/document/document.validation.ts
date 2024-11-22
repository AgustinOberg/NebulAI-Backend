import {
  AVAILABLE_FILE_TYPES,
  FILE_MAX_SIZE,
} from '@/constants/file.constants';
import { MiddlewareFormContext } from '@/types/context.type';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';

export const documentValidation = z.object({
  file: z.instanceof(File),
});

export type DocumentValidation = z.infer<typeof documentValidation>;
export const validateDocument = createMiddleware(
  (c: MiddlewareFormContext<DocumentValidation>, next) => {
    const { file } = c.req.valid('form');
    if (file.size > FILE_MAX_SIZE) throw new Error('File too large');
    if (!AVAILABLE_FILE_TYPES.some((type) => file.type === type.mimeType))
      throw new Error('Invalid file type');
    return next();
  },
);
