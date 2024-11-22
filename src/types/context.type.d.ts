/* eslint-disable @typescript-eslint/ban-types */
import { Env } from '@/utils/router.utils';
import { Context } from 'hono';
import { z } from 'zod';

export type ValidationContext<
  T extends z.ZodType<any, any>,
  V extends Record<string, unknown> = {},
> = Context<
  { Variables: V; Bindings: Env },
  string,
  {
    in: {
      json: z.infer<T>;
    };
    out: {
      json: z.infer<T>;
    };
  }
>;

export type MiddlewareContext<
  T = unknown,
  V extends Record<string, unknown> = {},
> = Context<
  { Variables: V; Bindings: Env },
  string,
  {
    in: {
      json: T;
    };
    out: {
      json: T;
    };
  }
>;

export type MiddlewareFormContext<
  T = unknown,
  V extends Record<string, unknown> = {},
> = Context<
  { Variables: V; Bindings: Env },
  string,
  {
    in: {
      form: T;
    };
    out: {
      form: T;
    };
  }
>;

export type ContextWithVariable<T = unknown> = Context<
  { Variables: T },
  string,
  {
    in: {
      json: T;
    };
    out: {
      json: T;
    };
  }
>;
