import { Language } from '@/constants/language.constants';
import { User, users } from '@/db/schema';
import { GoogleUser } from '@/middlewares/auth/get-google-info';
import { getUUID } from '@/utils/string.utils';
import { eq } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export const findById = async (db: DrizzleD1Database, id: string) => {
  const user = await db.select().from(users).where(eq(users.id, id));
  if (user.length === 0) return undefined;
  return user[0] as User;
};

export const findByEmail = async (db: DrizzleD1Database, email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  if (user.length === 0) return undefined;
  return user[0] as User;
};

export const authWithGoogle = async (
  db: DrizzleD1Database,
  payload: GoogleUser,
) => {
  const existingUser = await findByEmail(db, payload.email);
  if (existingUser) return { id: existingUser.id };
  return await db
    .insert(users)
    .values({
      thirdPartyAuthId: payload.sub,
      email: payload.email,
      emailVerified: payload.emailVerified,
      name: payload.name,
      picture: payload.avatar,
      locale: payload.language,
      id: getUUID(),
    })
    .returning({ id: users.id })
    .then((res) => res[0] ?? null);
};

export const changeLanguage = async (
  db: DrizzleD1Database,
  userId: string,
  language: Language,
) => {
  return await db
    .update(users)
    .set({ locale: language })
    .where(eq(users.id, userId));
};

export default {
  findById,
  findByEmail,
  authWithGoogle,
  changeLanguage,
};
