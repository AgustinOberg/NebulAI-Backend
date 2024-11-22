import { drizzle } from 'drizzle-orm/d1';

export const getDb = async (c: any) => {
  const db = await drizzle(c.env.DB);
  return db;
};
