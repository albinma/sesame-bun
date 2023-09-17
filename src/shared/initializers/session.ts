import { RequestHandler } from 'express';
import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    nonce: string;
  }
}

export const MemoryStore = new session.MemoryStore();

export function createSession(): RequestHandler {
  return session({
    store: MemoryStore,
    name: 'sesame-bun',
    secret: 'siwe-quickstart-secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: false,
      sameSite: true,
    },
  });
}
