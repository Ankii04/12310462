'use client';

import { useState } from 'react';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduledEmails from '@/components/ScheduledEmails';
import SentEmails from '@/components/SentEmails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function Home() {
  const [userEmail, setUserEmail] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScheduleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Email Scheduler</h2>
        <p className="text-slate-600">
          Schedule bulk emails with intelligent rate limiting, job queue management, and delivery tracking.
        </p>

        {/* User Email Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="email"
            placeholder="Enter your email to view your campaigns..."
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="schedule" className="bg-white rounded-lg shadow-sm border border-slate-200">
            <TabsList className="grid w-full grid-cols-3 border-b border-slate-200 rounded-none bg-slate-50">
              <TabsTrigger value="schedule" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white">
                Schedule Email
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white">
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="sent" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white">
                Sent/Failed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="p-6">
              <ScheduleForm onSuccess={handleScheduleSuccess} />
            </TabsContent>

            <TabsContent value="scheduled" className="p-6">
              {userEmail ? (
                <ScheduledEmails userEmail={userEmail} refreshKey={refreshKey} />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Please enter your email above to view scheduled emails
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="p-6">
              {userEmail ? (
                <SentEmails userEmail={userEmail} refreshKey={refreshKey} />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Please enter your email above to view sent emails
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-lg">⏱️</span>
                <span>Smart scheduling with custom delays</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🔒</span>
                <span>Per-sender hourly rate limiting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">📊</span>
                <span>Real-time delivery tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">⚡</span>
                <span>BullMQ job queue processing</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-6 border border-green-200">
            <h3 className="text-sm font-semibold text-green-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-green-700">Multiple Senders</div>
                <div className="text-xs text-green-600">Load balanced email dispatch</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">PostgreSQL</div>
                <div className="text-xs text-green-600">Persistent data storage</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">Redis Queue</div>
                <div className="text-xs text-green-600">Async job processing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
