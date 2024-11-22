import { throwError } from '@/constants/error.constants';
import { getDb } from '@/db/db';
import { User } from '@/db/schema';
import { decode } from '@/jwt/jwt';
import { findById } from '@/services/auth.service';
import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

type Variables = {
  user: User;
};

export const authenticate = createMiddleware(
  async (c: Context<{ Variables: Variables }>, next) => {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token || token.length === 0)
      return throwError({
        status: 'NOT_AUTHORIZED',
        message: 'NOT_AUTHORIZED',
      });
    const { payload } = decode(token);
    const userId = payload.id as string;
    if (!userId)
      return throwError({
        status: 'NOT_AUTHORIZED',
        message: 'NOT_AUTHORIZED',
      });
    const db = await getDb(c);
    const user = await findById(db, userId);
    if (!user)
      return throwError({
        status: 'NOT_AUTHORIZED',
        message: 'NOT_AUTHORIZED',
      });
    c.set('user', user);
    return next();
  },
);
