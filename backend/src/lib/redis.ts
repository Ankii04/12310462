import Redis from 'ioredis';
import { ENV } from '../config/env.js';

export const redisClient = new Redis(ENV.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
  console.error('Redis Connection Error:', err);
});
