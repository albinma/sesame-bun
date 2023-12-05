import { APP_CONFIGURATION } from '@/shared/configs';
import { logger } from '@/shared/initializers/logger';
import Redis from 'ioredis';

export const createRedis = (): Redis => {
  const { host, password, port } = APP_CONFIGURATION.redis;

  const redis = new Redis({
    host,
    port,
    username: 'default',
    password,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  redis.on('error', (error) => {
    logger.error(error, 'Redis error');
  });

  redis.on('close', () => {
    logger.info('Redis closed');
  });

  return redis;
};

export const redis = createRedis();
