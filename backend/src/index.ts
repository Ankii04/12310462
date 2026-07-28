import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { initSenders } from './lib/ethereal.js';
import { startWorker } from './queue/emailWorker.js';
import { emailRouter } from './routes/emailRoutes.js';
import { prisma } from './lib/prisma.js';

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/emails', emailRouter);

async function main() {
  try {
    console.log('--- Email Job Scheduler Backend Starting ---');

    // Test Database connection
    await prisma.$connect();
    console.log('[PostgreSQL] Connected successfully via Prisma.');

    // Initialize Ethereal Senders
    const senders = await initSenders();
    console.log(`[Nodemailer] Ethereal Senders active: ${senders.map((s) => s.user).join(', ')}`);

    // Start Worker
    startWorker();

    app.listen(ENV.PORT, () => {
      console.log(`[Express] Server running on http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
}

main();
