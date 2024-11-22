import { Hono } from 'hono';
import { authRouter } from './auth';
import { checkRouter } from './check';
import { languageRouter } from './language';
import { challengeRouter } from './challenge';
import { documentRouter } from './document';
import { attemptRouter } from './attempt';
import { configRouter } from './config';

export const router = new Hono()
  .route('/auth', authRouter)
  .route('/check', checkRouter)
  .route('/language', languageRouter)
  .route('/challenge', challengeRouter)
  .route('/document', documentRouter)
  .route('/attempt', attemptRouter)
  .route('/configs', configRouter);
