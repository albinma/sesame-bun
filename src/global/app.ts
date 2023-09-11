import { authRoutes } from '@/domains/identity/routes';
import { setup } from '@/global/setup';
import Elysia from 'elysia';
import { helmet } from 'elysia-helmet';

// Disabling require return type rule for this because of the nature of chaining API derived types.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const setupApp = () => {
  const app = new Elysia()
    .use(setup)
    .use(
      helmet({
        // Disable CSP because the server does not server any static files.
        contentSecurityPolicy: false,
      }),
    )
    .onRequest((context) => {
      const { method, url, referrer, referrerPolicy, headers } =
        context.request;
      context
        .getLogger()
        .info({ method, url, referrer, referrerPolicy, headers }, 'request');
    })
    .get('/', () => 'ok')
    .group('/auth', (app) => app.use(authRoutes));

  return app;
};
