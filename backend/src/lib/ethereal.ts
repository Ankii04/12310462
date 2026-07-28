import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

export interface SenderAccount {
  user: string;
  pass: string;
  transporter: nodemailer.Transporter;
}

const senders: SenderAccount[] = [];

export async function initSenders(): Promise<SenderAccount[]> {
  if (senders.length > 0) return senders;

  const envSenders = [
    { user: ENV.SENDER_1_USER, pass: ENV.SENDER_1_PASS },
    { user: ENV.SENDER_2_USER, pass: ENV.SENDER_2_PASS },
  ].filter((s) => s.user && s.pass);

  if (envSenders.length > 0) {
    for (const s of envSenders) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: s.user, pass: s.pass },
      });
      senders.push({ user: s.user, pass: s.pass, transporter });
    }
  } else {
    console.log('No SENDER env vars found. Auto-generating 2 Ethereal test accounts...');
    for (let i = 0; i < 2; i++) {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      senders.push({
        user: testAccount.user,
        pass: testAccount.pass,
        transporter,
      });
      console.log(`Created Ethereal Sender #${i + 1}: ${testAccount.user}`);
    }
  }

  return senders;
}

export function getSenders(): SenderAccount[] {
  return senders;
}

export function getTransporterForSender(senderEmail: string): nodemailer.Transporter | undefined {
  const account = senders.find((s) => s.user === senderEmail);
  return account?.transporter;
}
