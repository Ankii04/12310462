import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { emailQueue } from '../queue/emailQueue.js';
import { getSenders } from '../lib/ethereal.js';

export const emailRouter = Router();

const ScheduleSchema = z.object({
  userEmail: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  recipients: z.array(z.string().email()).min(1),
  startTime: z.string().or(z.date()),
  delayMs: z.number().nonnegative().default(2000),
  hourlyLimit: z.number().positive().default(100),
});

// POST /api/emails/schedule
emailRouter.post('/schedule', async (req: Request, res: Response) => {
  try {
    const parseResult = ScheduleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid request payload',
        details: parseResult.error.flatten(),
      });
    }

    const { userEmail, subject, body, recipients, startTime, delayMs, hourlyLimit } = parseResult.data;
    const startTimestamp = new Date(startTime).getTime();
    const senders = getSenders();

    if (senders.length === 0) {
      return res.status(500).json({ error: 'No active email senders configured.' });
    }

    // 1. Create EmailBatch in Prisma
    const batch = await prisma.emailBatch.create({
      data: {
        userEmail,
        subject,
        body,
        startTime: new Date(startTimestamp),
        delayMs,
        hourlyLimit,
      },
    });

    // 2. Prepare ScheduledEmail DB records
    const scheduledEmailInputs = recipients.map((recipient, index) => {
      const scheduledForTime = new Date(startTimestamp + index * delayMs);
      const senderAccount = senders[index % senders.length];
      return {
        batchId: batch.id,
        recipient: recipient.trim(),
        senderEmail: senderAccount.user,
        scheduledFor: scheduledForTime,
        status: 'SCHEDULED' as const,
      };
    });

    // Batch insert DB records
    await prisma.scheduledEmail.createMany({
      data: scheduledEmailInputs,
    });

    // Fetch created records to obtain generated IDs
    const createdEmails = await prisma.scheduledEmail.findMany({
      where: { batchId: batch.id },
    });

    // 3. Prepare BullMQ bulk delayed jobs
    const now = Date.now();
    const jobs = createdEmails.map((email) => {
      const scheduledTimeMs = email.scheduledFor.getTime();
      const delay = Math.max(0, scheduledTimeMs - now);

      return {
        name: `email-send-${email.id}`,
        data: {
          scheduledEmailId: email.id,
          senderEmail: email.senderEmail,
          recipient: email.recipient,
          subject,
          body,
          userEmail,
          hourlyLimit,
        },
        opts: {
          jobId: `email-${email.id}`, // Deterministic jobId for idempotency
          delay,
        },
      };
    });

    // Add jobs in bulk to BullMQ
    const addedJobs = await emailQueue.addBulk(jobs);

    // Update scheduled emails with their bullJobId
    const updatePromises = createdEmails.map((email, idx) => {
      const bullJob = addedJobs[idx];
      return prisma.scheduledEmail.update({
        where: { id: email.id },
        data: { bullJobId: bullJob?.id || `email-${email.id}` },
      });
    });

    await Promise.all(updatePromises);

    return res.status(201).json({
      message: 'Batch scheduled successfully',
      batchId: batch.id,
      emailCount: createdEmails.length,
      scheduledEmails: createdEmails,
    });
  } catch (error: any) {
    console.error('Error scheduling emails:', error);
    return res.status(500).json({ error: 'Failed to schedule email batch', details: error.message });
  }
});

// GET /api/emails/scheduled?userEmail=...
emailRouter.get('/scheduled', async (req: Request, res: Response) => {
  try {
    const userEmail = req.query.userEmail as string;
    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail query parameter is required' });
    }

    const scheduledEmails = await prisma.scheduledEmail.findMany({
      where: {
        batch: { userEmail },
        status: { in: ['SCHEDULED', 'PROCESSING'] },
      },
      orderBy: { scheduledFor: 'asc' },
      include: {
        batch: {
          select: { subject: true, body: true },
        },
      },
    });

    return res.json({ emails: scheduledEmails });
  } catch (error: any) {
    console.error('Error fetching scheduled emails:', error);
    return res.status(500).json({ error: 'Failed to fetch scheduled emails' });
  }
});

// GET /api/emails/sent?userEmail=...
emailRouter.get('/sent', async (req: Request, res: Response) => {
  try {
    const userEmail = req.query.userEmail as string;
    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail query parameter is required' });
    }

    const sentEmails = await prisma.scheduledEmail.findMany({
      where: {
        batch: { userEmail },
        status: { in: ['SENT', 'FAILED'] },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        batch: {
          select: { subject: true, body: true },
        },
      },
    });

    return res.json({ emails: sentEmails });
  } catch (error: any) {
    console.error('Error fetching sent emails:', error);
    return res.status(500).json({ error: 'Failed to fetch sent emails' });
  }
});

// GET /api/emails/senders
emailRouter.get('/senders', async (_req: Request, res: Response) => {
  const senders = getSenders().map((s) => s.user);
  return res.json({ senders });
});
