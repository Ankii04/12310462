'use client';

interface Email {
  id: string;
  to: string;
  subject: string;
  timestamp: string;
  body: string;
  status: 'scheduled' | 'processing' | 'sent' | 'failed';
  scheduledFor?: string;
}

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  selectedEmailId?: string;
}

export default function EmailList({ emails, onSelectEmail, selectedEmailId }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p>No emails</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className={`w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors border-l-4 ${
            selectedEmailId === email.id
              ? 'bg-emerald-50 border-l-emerald-600'
              : 'border-l-transparent'
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <p className="font-medium text-slate-900">To: {email.to}</p>
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
          <p className="text-sm text-slate-600 truncate mb-1">{email.subject}</p>
          <p className="text-xs text-slate-500">
            {email.status === 'scheduled' && email.scheduledFor
              ? `Scheduled for ${new Date(email.scheduledFor).toLocaleString()}`
              : email.timestamp}
          </p>
        </button>
      ))}
    </div>
  );
}
