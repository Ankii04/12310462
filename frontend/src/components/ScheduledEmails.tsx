'use client';

import { useState, useEffect } from 'react';
import { emailApi, ScheduledEmail } from '@/lib/api';
import { Loader, AlertCircle, Clock } from 'lucide-react';

interface ScheduledEmailsProps {
  userEmail: string;
  refreshKey: number;
}

export default function ScheduledEmails({ userEmail, refreshKey }: ScheduledEmailsProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) return;

    const fetchEmails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await emailApi.getScheduledEmails(userEmail);
        setEmails(data.emails || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [userEmail, refreshKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-slate-600">Loading scheduled emails...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="font-medium">No scheduled emails</p>
        <p className="text-sm">Schedule emails to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <div
          key={email.id}
          className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{email.batch.subject}</p>
              <p className="text-sm text-slate-600 mt-1">
                To: <span className="font-mono">{email.recipient}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  email.status === 'SCHEDULED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {email.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 border-t border-slate-100 pt-3 mt-3">
            <div>
              <p className="text-xs text-slate-500 uppercase">Sender</p>
              <p className="font-mono text-slate-900">{email.senderEmail}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Scheduled For</p>
              <p className="text-slate-900">
                {new Date(email.scheduledFor).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Job ID</p>
              <p className="font-mono text-slate-700 truncate">{email.bullJobId?.slice(0, 12)}...</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Created</p>
              <p className="text-slate-900">
                {new Date(email.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
