import { authenticate } from '@/middlewares/common/authenticate';
import { extractContent } from '@/middlewares/document/extract-content';
import { getRouter } from '@/utils/router.utils';
import {
  documentValidation,
  validateDocument,
} from '@/validations/document/document.validation';
import { zValidator } from '@hono/zod-validator';

export const documentRouter = getRouter();

documentRouter.post(
  '/process',
  authenticate,
  zValidator('form', documentValidation),
  validateDocument,
  extractContent,
  async (c) => {
    return c.json({ content: c.get('content') });
  },
);
