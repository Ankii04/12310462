'use client';

import { useState, useEffect } from 'react';
import { emailApi } from '@/lib/api';
import Papa from 'papaparse';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ScheduleFormProps {
  onSuccess: () => void;
}

export default function ScheduleForm({ onSuccess }: ScheduleFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    userEmail: '',
    subject: '',
    body: '',
    startTime: new Date().toISOString().slice(0, 16),
    delayMs: 2000,
    hourlyLimit: 100,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'delayMs' || name === 'hourlyLimit' ? parseInt(value) : value,
    }));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const emails = results.data
          .map((row: any) => row.email || row.Email || row.EMAIL || Object.values(row)[0])
          .filter((email: string) => email && typeof email === 'string' && email.includes('@'));

        setRecipients(emails);
        setMessage({ type: 'success', text: `Loaded ${emails.length} recipient(s) from CSV` });
      },
      error: (error) => {
        setMessage({ type: 'error', text: `CSV parsing error: ${error.message}` });
      },
    });
  };

  const handleManualRecipientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const emails = e.target.value
      .split(/[\n,;]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
    setRecipients(emails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.userEmail) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    if (!formData.subject) {
      setMessage({ type: 'error', text: 'Please enter email subject' });
      return;
    }

    if (!formData.body) {
      setMessage({ type: 'error', text: 'Please enter email body' });
      return;
    }

    if (recipients.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one recipient' });
      return;
    }

    setLoading(true);
    try {
      await emailApi.schedule({
        userEmail: formData.userEmail,
        subject: formData.subject,
        body: formData.body,
        recipients,
        startTime: new Date(formData.startTime),
        delayMs: formData.delayMs,
        hourlyLimit: formData.hourlyLimit,
      });

      setMessage({ type: 'success', text: `Successfully scheduled ${recipients.length} email(s)!` });
      setFormData({
        userEmail: formData.userEmail,
        subject: '',
        body: '',
        startTime: new Date().toISOString().slice(0, 16),
        delayMs: 2000,
        hourlyLimit: 100,
      });
      setRecipients([]);
      setCsvFile(null);
      onSuccess();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message Alert */}
      {message && (
        <div
          className={`flex gap-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* User Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Your Email</label>
        <input
          type="email"
          name="userEmail"
          value={formData.userEmail}
          onChange={handleInputChange}
          placeholder="your@email.com"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
        />
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Email Subject</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          placeholder="Campaign subject line..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Email Body</label>
        <textarea
          name="body"
          value={formData.body}
          onChange={handleInputChange}
          placeholder="Email content..."
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
        />
      </div>

      {/* Recipients Section */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recipients</h3>

        {/* CSV Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload CSV (optional)</label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-slate-600">
              <p className="font-medium">Drop CSV file here or click to upload</p>
              <p className="text-sm text-slate-500 mt-1">CSV should have an 'email' column</p>
            </div>
          </div>
          {csvFile && <p className="text-sm text-green-600 mt-2">✓ {csvFile.name} loaded</p>}
        </div>

        {/* Manual Recipients */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Or enter emails manually (one per line, or comma/semicolon separated)
          </label>
          <textarea
            placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
            onChange={handleManualRecipientsChange}
            defaultValue={recipients.join('\n')}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
          />
        </div>

        {recipients.length > 0 && (
          <p className="text-sm text-slate-600 mt-2">📧 {recipients.length} recipient(s) ready to send</p>
        )}
      </div>

      {/* Scheduling Options */}
      <div className="border-t border-slate-200 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Delay Between Emails (ms)</label>
          <input
            type="number"
            name="delayMs"
            value={formData.delayMs}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Limit per Sender</label>
          <input
            type="number"
            name="hourlyLimit"
            value={formData.hourlyLimit}
            onChange={handleInputChange}
            min="1"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Scheduling...
          </>
        ) : (
          <>
            📧 Schedule Emails
          </>
        )}
      </button>
    </form>
  );
}
