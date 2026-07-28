'use client';

import { X } from 'lucide-react';

interface RecipientTagsProps {
  recipients: string[];
  onRemove: (email: string) => void;
}

export default function RecipientTags({ recipients, onRemove }: RecipientTagsProps) {
  if (recipients.length === 0) return null;

  const displayedRecipients = recipients.slice(0, 3);
  const remainingCount = recipients.length - 3;

  return (
    <div className="flex flex-wrap gap-2">
      {displayedRecipients.map((email) => (
        <div
          key={email}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-emerald-600 rounded-full text-sm text-slate-700"
        >
          <span>{email}</span>
          <button
            type="button"
            onClick={() => onRemove(email)}
            className="text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="inline-flex items-center px-3 py-1 bg-white border-2 border-emerald-600 rounded-full text-sm text-slate-700 font-medium">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
