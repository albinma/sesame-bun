import { APP_CONFIGURATION } from '@/shared/configs';
import { redis } from '@/shared/initializers/redis';
import RedisStore from 'connect-redis';
import { RequestHandler } from 'express';
import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    nonce: string;
  }
}

export function createSession(): RequestHandler {
  return session({
    store: new RedisStore({
      client: redis,
    }),
    name: 'sesame-bun',
    secret: APP_CONFIGURATION.http.sessionCookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: false,
      sameSite: true,
    },
  });
}
