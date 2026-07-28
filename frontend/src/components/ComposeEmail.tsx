'use client';

import { useState } from 'react';
import { X, Upload, Clock } from 'lucide-react';
import RecipientTags from './RecipientTags';

interface ComposeEmailProps {
  onClose: () => void;
  onSend: (data: any) => void;
}

export default function ComposeEmail({ onClose, onSend }: ComposeEmailProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delayBetween, setDelayBetween] = useState('2000');
  const [hourlyLimit, setHourlyLimit] = useState('100');
  const [sendLater, setSendLater] = useState(false);
  const [sendTime, setSendTime] = useState('');
  const [loading, setLoading] = useState(false);

  const addRecipient = (email: string) => {
    const trimmed = email.trim();
    if (trimmed && !recipients.includes(trimmed)) {
      setRecipients([...recipients, trimmed]);
      setRecipientInput('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleRecipientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientInput(value);

    if (value.includes(',') || value.includes(';')) {
      const emails = value.split(/[,;]/).map((e) => e.trim());
      emails.forEach((email) => {
        if (email) addRecipient(email);
      });
      setRecipientInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient(recipientInput);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSend({
        recipients,
        subject,
        body,
        delayBetween: parseInt(delayBetween),
        hourlyLimit: parseInt(hourlyLimit),
        sendLater,
        sendTime,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-slate-900">← Compose New Email</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-6">
          {/* From & To */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="w-20 font-medium text-slate-700 pt-3">From</label>
              <input
                type="email"
                value="oliver.brown@domain.io"
                readOnly
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium cursor-default"
              />
            </div>

            <div className="flex gap-4 items-start">
              <label className="w-20 font-medium text-slate-700 pt-3">To</label>
              <div className="flex-1">
                <RecipientTags
                  recipients={recipients}
                  onRemove={removeRecipient}
                />
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientInput}
                  onChange={handleRecipientInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder-slate-400 mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">Press Enter or use comma/semicolon to add emails</p>
              </div>
              <button
                type="button"
                className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <Upload className="w-4 h-4" />
                Upload List
              </button>
            </div>
          </div>

          {/* Subject */}
          <div className="flex gap-4">
            <label className="w-20 font-medium text-slate-700 pt-3">Subject</label>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Delay & Hourly Limit */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium text-slate-700 mb-2">Delay between 2 emails</label>
              <input
                type="number"
                value={delayBetween}
                onChange={(e) => setDelayBetween(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-slate-700 mb-2">Hourly Limit</label>
              <input
                type="number"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block font-medium text-slate-700 mb-2">Body</label>
            <textarea
              placeholder="Type Your Reply..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder-slate-400 min-h-64 resize-none"
            />
            {/* Rich Text Toolbar */}
            <div className="flex gap-2 mt-3 pb-4 border-b border-slate-200">
              <button type="button" className="p-2 hover:bg-slate-100 rounded text-slate-600">↶</button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded text-slate-600">↷</button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded text-slate-600">T~</button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded text-slate-600">B</button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded text-slate-600">I</button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded text-slate-600">U</button>
            </div>
          </div>

          {/* Send Options */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSendLater(!sendLater)}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Clock className="w-5 h-5" />
                Send Later
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || recipients.length === 0}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Sending...' : 'Do'}
              </button>
            </div>
          </div>

          {/* Send Later Options */}
          {sendLater && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-slate-900">Send Later</h4>
              <div className="space-y-2">
                {[
                  { label: 'Pick date & time', value: 'custom' },
                  { label: 'Tomorrow', value: 'tomorrow' },
                  { label: 'Tomorrow, 10:00 AM', value: 'tomorrow-10' },
                  { label: 'Tomorrow, 11:00 AM', value: 'tomorrow-11' },
                  { label: 'Tomorrow, 3:00 PM', value: 'tomorrow-3' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSendTime(option.value)}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      sendTime === option.value
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'hover:bg-white text-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
