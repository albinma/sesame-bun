import { logger } from '@bogeychan/elysia-logger';
import { Elysia } from 'elysia';
import { helmet } from 'elysia-helmet';

const port = Bun.env.HTTP_PORT || 8080;
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
  .get('/', (ctx) => {
    ctx.log.error(ctx, 'Context');
    ctx.log.info(ctx.request, 'Request'); // noop
    return 'Hello Elysia';
  })
  .listen(port);

// eslint-disable-next-line no-console
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
