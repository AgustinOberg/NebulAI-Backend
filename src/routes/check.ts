import { getDb } from '@/db/db';
import { getRouter } from '@/utils/router.utils';

export const checkRouter = getRouter();

checkRouter.get('/', async (c) => {
  const db = await getDb(c);
  return c.json({ api: true, db: !!db });
});
