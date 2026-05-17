import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries >= 10) {
        console.error('[Redis] Max retries reached. Stopping reconnect.');
        return false;
      }
      return Math.min(retries * 200, 3000); // exponential back-off up to 3 s
    },
  },
});

redisClient.on('error',  (err) => console.error('[Redis] Error:', err.message));
redisClient.on('connect', ()  => console.log('[Redis] Connected'));
redisClient.on('ready',   ()  => console.log('[Redis] Ready'));
redisClient.on('reconnecting', () => console.log('[Redis] Reconnecting...'));

/**
 * Call ONCE at app startup (app.ts).
 * The client keeps itself connected via reconnectStrategy after that.
 */
export async function connectRedis(): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err: any) {
    console.error('[Redis] Startup connection failed:', err.message);
    // Do NOT re-throw — let the app run; cart endpoints will error gracefully
  }
}

export default redisClient;
