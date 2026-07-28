import { Queue } from 'bullmq';
import { redisClient } from '../lib/redis.js';

export interface EmailJobData {
  scheduledEmailId: string;
  senderEmail: string;
  recipient: string;
  subject: string;
  body: string;
  userEmail: string;
  hourlyLimit: number;
}

export const EMAIL_QUEUE_NAME = 'email-queue';

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
