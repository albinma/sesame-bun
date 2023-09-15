import { setupApp } from '@/global/app';
import { APP_CONFIGURATION } from '@/shared/configs/config';
import { logger } from '@/shared/initializers/logger';
import { AddressInfo } from 'ws';

const { port } = APP_CONFIGURATION.http;
const app = setupApp();
const server = app.listen(port, () => {
  logger.info('sesame-bun started');
});

const address = server.address() as AddressInfo;
logger.info(`sesame-bun starting on http://${address.address}:${port}`);
