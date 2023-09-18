import { APP_CONFIGURATION } from '@/shared/configs/config';
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
    secret: APP_CONFIGURATION.http.sessionCookieSecret,
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
