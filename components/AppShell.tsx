'use client';

import { useState } from 'react';
import { LayoutDashboard, MessageSquare } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import DashboardPanel from '@/components/dashboard/DashboardPanel';
import ChatPanel from '@/components/chat/ChatPanel';

export default function AppShell() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <AppHeader panelOpen={panelOpen} onTogglePanel={() => setPanelOpen(prev => !prev)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Dashboard panel — sidebar on desktop, full-width on mobile when selected */}
        <aside
          className={`overflow-hidden border-r border-border ${
            panelOpen ? 'hidden lg:block lg:w-[420px] lg:shrink-0' : 'hidden'
          } ${activeTab === 'dashboard' ? 'block lg:block flex-1 lg:flex-none border-r-0 lg:border-r' : ''}`}
        >
          <DashboardPanel />
        </aside>

        {/* Chat panel — always rendered, hidden on mobile when dashboard tab is active */}
        <main
          className={`flex-1 min-w-0 overflow-hidden ${
            activeTab === 'dashboard' ? 'hidden lg:block' : 'block'
          }`}
        >
          <ChatPanel />
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav className="h-14 shrink-0 border-t border-border bg-background flex lg:hidden">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
            activeTab === 'chat' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <MessageSquare className="size-5" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
            activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <LayoutDashboard className="size-5" />
          Dashboard
        </button>
      </nav>
    </div>
  );
}
