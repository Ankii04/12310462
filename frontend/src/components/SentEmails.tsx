'use client';

import { useState, useEffect } from 'react';
import { emailApi, ScheduledEmail } from '@/lib/api';
import { Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface SentEmailsProps {
  userEmail: string;
  refreshKey: number;
}

export default function SentEmails({ userEmail, refreshKey }: SentEmailsProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) return;

    const fetchEmails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await emailApi.getSentEmails(userEmail);
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
        <p className="text-slate-600">Loading sent emails...</p>
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
        <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="font-medium">No sent or failed emails</p>
        <p className="text-sm">Scheduled emails will appear here once processed</p>
      </div>
    );
  }

  const sentCount = emails.filter((e) => e.status === 'SENT').length;
  const failedCount = emails.filter((e) => e.status === 'FAILED').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-700 uppercase font-semibold">Sent</p>
          <p className="text-3xl font-bold text-green-600">{sentCount}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-700 uppercase font-semibold">Failed</p>
          <p className="text-3xl font-bold text-red-600">{failedCount}</p>
        </div>
      </div>

      {/* Email List */}
      <div className="space-y-3">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              email.status === 'SENT'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{email.batch.subject}</p>
                <p className="text-sm text-slate-600 mt-1">
                  To: <span className="font-mono">{email.recipient}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {email.status === 'SENT' ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    Sent
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4" />
                    Failed
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 border-t border-opacity-20 pt-3 mt-3">
              <div>
                <p className="text-xs text-slate-500 uppercase">Sender</p>
                <p className="font-mono text-slate-900">{email.senderEmail}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  {email.status === 'SENT' ? 'Sent At' : 'Processed At'}
                </p>
                <p className="text-slate-900">
                  {email.sentAt
                    ? new Date(email.sentAt).toLocaleString()
                    : new Date(email.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Job ID</p>
                <p className="font-mono text-slate-700 truncate">{email.bullJobId?.slice(0, 12)}...</p>
              </div>
              {email.status === 'FAILED' && email.error && (
                <div className="md:col-span-4">
                  <p className="text-xs text-red-700 uppercase font-semibold">Error</p>
                  <p className="text-red-700 text-sm font-mono">{email.error}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
