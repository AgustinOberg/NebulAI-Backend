import { Hono } from 'hono';
import { router } from './routes';

const app = new Hono().route('/api', router);

export default app;
