import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { redisClient } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import { getTransporterForSender } from '../lib/ethereal.js';
import { EMAIL_QUEUE_NAME, EmailJobData } from './emailQueue.js';
import { ENV } from '../config/env.js';

export function startWorker() {
  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobData>, token?: string) => {
      const { scheduledEmailId, senderEmail, recipient, subject, body, hourlyLimit } = job.data;

      try {
        // 1. Idempotency Check: Fetch DB row
        const emailRecord = await prisma.scheduledEmail.findUnique({
          where: { id: scheduledEmailId },
        });

        if (!emailRecord) {
          console.log(`[Worker] Job ${job.id}: ScheduledEmail ${scheduledEmailId} not found in DB. Skipping.`);
          return;
        }

        if (emailRecord.status === 'SENT') {
          console.log(`[Worker] Job ${job.id}: ScheduledEmail ${scheduledEmailId} already SENT. No-op.`);
          return;
        }

        // 2. Hourly Rate Limit Check (per-sender)
        const effectiveLimit = Math.min(hourlyLimit || ENV.MAX_EMAILS_PER_HOUR_PER_SENDER, ENV.MAX_EMAILS_PER_HOUR_PER_SENDER);
        const currentHourBucket = Math.floor(Date.now() / 3600000);
        const rateLimitKey = `rate:${senderEmail}:${currentHourBucket}`;

        const currentCountStr = await redisClient.get(rateLimitKey);
        const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

        if (currentCount >= effectiveLimit) {
          // Cap hit! Calculate delay until start of next hour
          const nextHourStartMs = (currentHourBucket + 1) * 3600000;
          const delayMs = Math.max(1000, nextHourStartMs - Date.now());

          console.warn(
            `[Worker] Sender ${senderEmail} hit hourly cap (${currentCount}/${effectiveLimit}). Re-delaying job ${job.id} for ${Math.round(delayMs / 1000)}s`
          );

          // Update DB scheduledFor to reflect the postponed time
          await prisma.scheduledEmail.update({
            where: { id: scheduledEmailId },
            data: { scheduledFor: new Date(nextHourStartMs) },
          });

          // Re-delay job in BullMQ
          if (token && typeof job.moveToDelayed === 'function') {
            await job.moveToDelayed(Date.now() + delayMs, token);
          }
          return;
        }

        // Increment rate counter atomically
        const newCount = await redisClient.incr(rateLimitKey);
        if (newCount === 1) {
          await redisClient.expire(rateLimitKey, 3600);
        }

        // Update status to PROCESSING
        await prisma.scheduledEmail.update({
          where: { id: scheduledEmailId },
          data: { status: 'PROCESSING' },
        });

        // 3. Send Email via Nodemailer Ethereal Transporter
        const transporter = getTransporterForSender(senderEmail);
        if (!transporter) {
          throw new Error(`Transporter for sender ${senderEmail} not found`);
        }

        const info = await transporter.sendMail({
          from: `"Outbox Reach" <${senderEmail}>`,
          to: recipient,
          subject: subject,
          text: body,
          html: `<div style="font-family: sans-serif; line-height: 1.5;">${body.replace(/\n/g, '<br/>')}</div>`,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`[Worker] Sent email ${scheduledEmailId} to ${recipient}. Preview URL: ${previewUrl}`);
        }

        // 4. Update DB to SENT
        await prisma.scheduledEmail.update({
          where: { id: scheduledEmailId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            error: null,
          },
        });
      } catch (error: any) {
        console.error(`[Worker] Error processing job ${job.id} for ${scheduledEmailId}:`, error);

        // Fail gracefully, mark DB row FAILED
        await prisma.scheduledEmail.update({
          where: { id: scheduledEmailId },
          data: {
            status: 'FAILED',
            error: error.message || 'Unknown error occurred while sending email',
          },
        }).catch((dbErr) => {
          console.error(`[Worker] Failed to update email status to FAILED in DB:`, dbErr);
        });
      }
    },
    {
      connection: redisClient,
      concurrency: ENV.WORKER_CONCURRENCY,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
  });

  console.log(`[Worker] BullMQ Worker started with concurrency: ${ENV.WORKER_CONCURRENCY}`);
  return worker;
}
