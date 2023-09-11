import { setupApp } from '@/api/routes';

const port = Bun.env.HTTP_PORT || 8080;
const app = setupApp();

app.listen(port);

// eslint-disable-next-line no-console
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
