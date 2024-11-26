import { Hono } from 'hono';

export type Env = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  GEMINI_DOCUMENT_CLIENT_EMAIL: string;
  GEMINI_DOCUMENT_PRIVATE_KEY: string;
  GEMINI_DOCUMENT_PRIVATE_KEY_ID: string;
  PROMPTS: KVNamespace;
};

export const getRouter = () => new Hono<{ Bindings: Env }>();
