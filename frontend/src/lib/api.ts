const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ScheduleEmailRequest {
  userEmail: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: string | Date;
  delayMs?: number;
  hourlyLimit?: number;
}

export interface ScheduledEmail {
  id: string;
  batchId: string;
  recipient: string;
  senderEmail: string;
  status: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';
  scheduledFor: string;
  sentAt?: string;
  error?: string;
  bullJobId?: string;
  batch: {
    subject: string;
    body: string;
  };
}

export interface SenderAccount {
  user: string;
}

export const emailApi = {
  async schedule(data: ScheduleEmailRequest) {
    const response = await fetch(`${API_URL}/emails/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to schedule emails');
    }

    return response.json();
  },

  async getScheduledEmails(userEmail: string) {
    const params = new URLSearchParams({ userEmail });
    const response = await fetch(`${API_URL}/emails/scheduled?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch scheduled emails');
    }

    return response.json();
  },

  async getSentEmails(userEmail: string) {
    const params = new URLSearchParams({ userEmail });
    const response = await fetch(`${API_URL}/emails/sent?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch sent emails');
    }

    return response.json();
  },

  async getSenders() {
    const response = await fetch(`${API_URL}/emails/senders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch senders');
    }

    return response.json();
  },
};
