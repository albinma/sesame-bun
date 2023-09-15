import { setupApp } from '@/global/app';

const port = Number(Bun.env.HTTP_PORT) || 8080;
const app = setupApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`sesame-bun listening on port ${port}`);
});
