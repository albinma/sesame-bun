import { prisma } from '@/shared/initializers/database';
import { logger } from '@/shared/initializers/logger';
import { redis } from '@/shared/initializers/redis';
import { afterAll } from 'bun:test';

afterAll(async () => {
  logger.info('Disconnecting from database and redis');
  redis.disconnect();

  while (redis.status !== 'end') {
    logger.info('Waiting for redis to disconnect');
    await new Promise((r) => setTimeout(r, 200));
  }

  await prisma.$disconnect();
  await redis.quit();
});
