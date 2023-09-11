import { logger } from '@bogeychan/elysia-logger';
import Elysia from 'elysia';
import { helmet } from 'elysia-helmet';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function setupApp() {
  const app = new Elysia()
    .use(
      helmet({
        // Disable CSP because the server does not server any static files.
        contentSecurityPolicy: false,
      }),
    )
    .use(
      logger({
        level: 'debug',
      }),
    )
    .get('/', () => 'ok');

  return app;
}
