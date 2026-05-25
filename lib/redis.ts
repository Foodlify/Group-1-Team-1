import { createClient } from 'redis';
import { retry } from '../src/shared_infrastructure/retry/retry';

const redisClient = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
});

redisClient.on('error',        (err) => console.error('[Redis] Error:', err.message));
redisClient.on('connect',      ()    => console.log('[Redis] Connected'));
redisClient.on('ready',        ()    => console.log('[Redis] Ready'));
redisClient.on('reconnecting', ()    => console.log('[Redis] Reconnecting...'));

export async function healthCheckRedis(): Promise<void> {
  await retry(
    async () => await redisClient.ping(),
    5,
    2000,
    'Redis health check',
  );
}

export async function connectRedis(): Promise<void> {
  await retry(
    async () => {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
    },
    5,
    2000,
    'Redis connection',
  );
}

export default redisClient;
