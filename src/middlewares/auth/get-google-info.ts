import { createMiddleware } from 'hono/factory';

import { decode } from 'hono/jwt';
import { MiddlewareContext } from '@/types/context.type';
import { GoogleAuthPayload } from '@/validations/auth/auth-with-google.validation';

export type GoogleUser = {
  name: string;
  email: string;
  avatar: string;
  firstName: string;
  lastName: string;
  language: string;
  sub: string;
  emailVerified?: boolean;
};

type Variables = {
  'google-user': GoogleUser;
};

export const getGoogleInfo = createMiddleware(
  (c: MiddlewareContext<GoogleAuthPayload, Variables>, next) => {
    const { idToken } = c.req.valid('json');
    const data = decode(idToken).payload as any;
    const googleUser: GoogleUser = {
      name: data.name,
      email: data.email,
      avatar: data.picture,
      firstName: data?.name?.split(' ')[0],
      lastName: data?.name?.split(' ')[1],
      //TODO: change lang
      language: 'es',
      sub: data?.sub,
      emailVerified: data.email_verified,
    };
    c.set('google-user', googleUser);
    return next();
  },
);
