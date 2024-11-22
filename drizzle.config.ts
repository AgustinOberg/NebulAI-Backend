import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
config();
export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: process.env.DATABASE_ID!,
    accountId: process.env.DATABASE_USER_ID!,
    token: process.env.DATABASE_TOKEN!,
  },
  tablesFilter: ['/^(?!.*_cf_KV).*$/'],
});
