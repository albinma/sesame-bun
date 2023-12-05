import { redis } from '@/shared/initializers/redis';
import { faker } from '@faker-js/faker';
import { describe, expect, it } from 'bun:test';

describe('Redis', () => {
  it('should be able to connect', async () => {
    expect(redis).toBeDefined();
    const ping = await redis.ping();
    expect(ping).toBe('PONG');
    const key = faker.string.uuid();
    const value = faker.string.uuid();
    await redis.set(key, value);
    const result = await redis.get(key);
    expect(result).toBe(value);
    await redis.del(key);
    const deleted = await redis.get(key);
    expect(deleted).toBeNull();
  });
});
