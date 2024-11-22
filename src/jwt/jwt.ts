import { Context } from 'hono';
import { decode as JWTDecode, sign } from 'hono/jwt';
import { JWTPayload } from 'hono/utils/jwt/types';

export const decode = JWTDecode;

export const encode = (payload: JWTPayload, c: Context) => {
  return sign(payload, c.env.JWT_SECRET);
};
