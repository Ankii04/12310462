'use client';

import { useAuth } from '@/context/AuthContext';
import { Clock, Send, LogOut, Plus } from 'lucide-react';

interface SidebarProps {
  activeTab: 'compose' | 'scheduled' | 'sent';
  onTabChange: (tab: 'compose' | 'scheduled' | 'sent') => void;
  scheduledCount: number;
  sentCount: number;
  onCompose: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  scheduledCount,
  sentCount,
  onCompose,
}: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* User Profile */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.avatar}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Compose Button */}
      <div className="p-4">
        <button
          onClick={onCompose}
          className="w-full border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Compose
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-4">
        <div className="text-xs uppercase font-semibold text-slate-500 px-2 mb-2">CORE</div>

        <button
          onClick={() => onTabChange('scheduled')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors mb-2 ${
            activeTab === 'scheduled'
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="font-medium">Scheduled</span>
          <span className="ml-auto text-sm font-semibold">{scheduledCount}</span>
        </button>

        <button
          onClick={() => onTabChange('sent')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
            activeTab === 'sent'
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Send className="w-5 h-5" />
          <span className="font-medium">Sent</span>
          <span className="ml-auto text-sm font-semibold">{sentCount}</span>
        </button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-red-600 py-2 text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
