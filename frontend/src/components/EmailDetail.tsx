'use client';

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

interface EmailDetailProps {
  email: Email | null;
  onClose: () => void;
}

export default function EmailDetail({ email, onClose }: EmailDetailProps) {
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Select an email to view details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <button
          onClick={onClose}
          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mb-3"
        >
          ← Back
        </button>
        <h2 className="text-xl font-semibold text-slate-900">{email.subject}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Sender Info */}
        <div className="mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
              {email.from?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{email.from || 'Unknown Sender'}</p>
              <p className="text-sm text-slate-500">to {email.to}</p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-xs text-slate-500">{email.timestamp}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    email.status === 'sent'
                      ? 'bg-green-100 text-green-700'
                      : email.status === 'scheduled'
                      ? 'bg-yellow-100 text-yellow-700'
                      : email.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {email.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                ⭐
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                🗑️
              </button>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
          {email.body}
        </div>

        {/* Attachments (if any) */}
        {email.scheduledFor && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Scheduled for:</strong> {new Date(email.scheduledFor).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
