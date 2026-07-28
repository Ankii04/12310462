import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/email_scheduler?schema=public',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
  MIN_DELAY_BETWEEN_EMAILS_MS: parseInt(process.env.MIN_DELAY_BETWEEN_EMAILS_MS || '2000', 10),
  MAX_EMAILS_PER_HOUR_PER_SENDER: parseInt(process.env.MAX_EMAILS_PER_HOUR_PER_SENDER || '100', 10),
  PORT: parseInt(process.env.PORT || '5000', 10),
  SENDER_1_USER: process.env.SENDER_1_USER || '',
  SENDER_1_PASS: process.env.SENDER_1_PASS || '',
  SENDER_2_USER: process.env.SENDER_2_USER || '',
  SENDER_2_PASS: process.env.SENDER_2_PASS || '',
};
