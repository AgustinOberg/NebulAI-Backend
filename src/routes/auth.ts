import { authWithGoogleValidation } from '../validations/auth/auth-with-google.validation';
import { zValidator } from '@hono/zod-validator';
import { getGoogleInfo } from '../middlewares/auth/get-google-info';
import { authWithGoogle } from '@/services/auth.service';
import { getDb } from '@/db/db';
import { authenticate } from '@/middlewares/common/authenticate';
import { encode } from '@/jwt/jwt';
import { getRouter } from '@/utils/router.utils';

export const authRouter = getRouter();

authRouter.post(
  '/google',
  zValidator('json', authWithGoogleValidation),
  getGoogleInfo,
  async (c) => {
    const db = await getDb(c);
    const user = await authWithGoogle(db, c.get('google-user'));
    const token = await encode({ id: user.id }, c);
    return c.json({ token });
  },
);

authRouter.get('/refresh-session', authenticate, async (c) => {
  const user = c.get('user');
  const token = await encode({ id: user.id }, c);
  return c.json({ token });
});

authRouter.get('/profile', authenticate, async (c) => {
  const user = c.get('user');
  return c.json(user);
});

// TODO:Push notif
