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
        {/* Dashboard panel — teal-tinted sidebar */}
        <aside
          className={`overflow-hidden border-r border-teal/10 transition-all duration-300 ease-out ${
            panelOpen ? 'hidden lg:block lg:w-[420px] lg:shrink-0' : 'hidden'
          } ${activeTab === 'dashboard' ? 'block lg:block flex-1 lg:flex-none border-r-0 lg:border-r' : ''}`}
        >
          <DashboardPanel />
        </aside>

        {/* Chat panel */}
        <main
          className={`flex-1 min-w-0 overflow-hidden ${
            activeTab === 'dashboard' ? 'hidden lg:block' : 'block'
          }`}
        >
          <ChatPanel />
        </main>
      </div>

      {/* Mobile tab bar — vivid active indicator */}
      <nav className="h-14 shrink-0 border-t border-border bg-card/90 backdrop-blur-sm flex lg:hidden">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-all duration-200 relative ${
            activeTab === 'chat'
              ? 'text-teal'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === 'chat' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-teal rounded-full" />
          )}
          <MessageSquare className={`size-5 transition-transform duration-200 ${activeTab === 'chat' ? 'scale-110' : ''}`} />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-all duration-200 relative ${
            activeTab === 'dashboard'
              ? 'text-teal'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === 'dashboard' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-teal rounded-full" />
          )}
          <LayoutDashboard className={`size-5 transition-transform duration-200 ${activeTab === 'dashboard' ? 'scale-110' : ''}`} />
          Dashboard
        </button>
      </nav>
    </div>
  );
}
