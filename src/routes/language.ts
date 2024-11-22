import { Language } from '@/constants/language.constants';
import { getDb } from '@/db/db';
import { authenticate } from '@/middlewares/common/authenticate';
import authService from '@/services/auth.service';
import { getRouter } from '@/utils/router.utils';
import { availableLanguageValidation } from '@/validations/language/available-language.validation';
import { zValidator } from '@hono/zod-validator';

export const languageRouter = getRouter();

languageRouter.put(
  '/',
  authenticate,
  zValidator('json', availableLanguageValidation),
  async (c) => {
    const { locale } = c.req.valid('json');
    const db = await getDb(c);
    const response = await authService.changeLanguage(
      db,
      c.get('user').id,
      locale as Language,
    );
    return c.json({ ok: response.success });
  },
);
