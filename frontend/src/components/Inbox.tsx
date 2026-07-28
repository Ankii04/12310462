'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import ComposeEmail from './ComposeEmail';
import { emailApi } from '@/lib/api';

interface Email {
  id: string;
  to: string;
  subject: string;
  timestamp: string;
  body: string;
  status: 'scheduled' | 'processing' | 'sent' | 'failed';
  scheduledFor?: string;
  from?: string;
}

export default function Inbox() {
  const [activeTab, setActiveTab] = useState<'compose' | 'scheduled' | 'sent'>('scheduled');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState<Email[]>([
    {
      id: '1',
      to: 'john@example.com',
      subject: 'Meeting follow-up - Scheduled',
      timestamp: 'Tue 9:15 AM',
      body: 'Hi John, just wanted to follow up on our meeting...',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 86400000).toISOString(),
      from: 'You',
    },
    {
      id: '2',
      to: 'olive@example.com',
      subject: 'Ramit, great to meet you - you\'ll love it',
      timestamp: 'Thu 8:15 PM',
      body: 'Hi Olive, just wanted to follow up on our meeting...',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 172800000).toISOString(),
      from: 'You',
    },
  ]);

  const [sentEmails, setSentEmails] = useState<Email[]>([
    {
      id: '3',
      to: 'sarah@example.com',
      subject: 'Re: Project Update',
      timestamp: 'Nov 3, 10:23 AM',
      body: 'Thanks for the update, Sarah. Looks good!',
      status: 'sent',
      from: 'You',
    },
    {
      id: '4',
      to: 'support@example.com',
      subject: 'Issue with login',
      timestamp: 'Nov 2, 2:45 PM',
      body: 'I am having trouble logging in to the dashboard...',
      status: 'sent',
      from: 'You',
    },
  ]);

  const handleCompose = async (data: any) => {
    try {
      // Send to backend
      await emailApi.schedule({
        userEmail: 'oliver.brown@domain.io',
        subject: data.subject,
        body: data.body,
        recipients: data.recipients,
        startTime: new Date(),
        delayMs: data.delayBetween,
        hourlyLimit: data.hourlyLimit,
      });

      // Add to local state
      const newEmails = data.recipients.map((recipient: string, idx: number) => ({
        id: `new-${idx}-${Date.now()}`,
        to: recipient,
        subject: data.subject,
        timestamp: new Date().toLocaleTimeString(),
        body: data.body,
        status: 'scheduled' as const,
        scheduledFor: new Date(Date.now() + data.delayBetween * idx).toISOString(),
        from: 'You',
      }));

      setScheduledEmails([...newEmails, ...scheduledEmails]);
      setShowCompose(false);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const currentEmails = activeTab === 'scheduled' ? scheduledEmails : sentEmails;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scheduledCount={scheduledEmails.length}
        sentCount={sentEmails.length}
        onCompose={() => setShowCompose(true)}
      />

      <div className="flex-1 flex">
        {/* Email List */}
        <div className="w-96 border-r border-slate-200 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">
              {activeTab === 'scheduled' ? 'Scheduled' : 'Sent'} Emails
            </h3>
          </div>
          <EmailList
            emails={currentEmails}
            onSelectEmail={setSelectedEmail}
            selectedEmailId={selectedEmail?.id}
          />
        </div>

        {/* Email Detail */}
        <div className="flex-1 bg-white">
          {selectedEmail ? (
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>Select an email to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeEmail
          onClose={() => setShowCompose(false)}
          onSend={handleCompose}
        />
      )}
    </div>
  );
}
