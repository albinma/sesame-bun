import { setupApp } from '@/global/app';
import { logger } from '@/shared/initializers/logger';
import { AddressInfo } from 'ws';

const port = Number(Bun.env.HTTP_PORT) || 8080;
const app = setupApp();
const server = app.listen(port, () => {
  logger.info('sesame-bun started');
});

const address = server.address() as AddressInfo;
logger.info(`sesame-bun starting on http://${address.address}:${port}`);
