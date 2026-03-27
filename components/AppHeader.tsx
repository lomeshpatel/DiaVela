'use client';

import Link from 'next/link';
import { HeartPulse, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export default function AppHeader({ panelOpen, onTogglePanel }: AppHeaderProps) {
  return (
    <header className="h-14 shrink-0 bg-background border-b border-border flex items-center px-4 gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePanel}
        className="hidden lg:inline-flex"
        aria-label={panelOpen ? 'Close dashboard panel' : 'Open dashboard panel'}
      >
        {panelOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
      </Button>
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
          <HeartPulse className="size-4" />
        </div>
        <div className="leading-none">
          <p className="text-sm font-bold text-foreground">DiaVela</p>
          <p className="text-[10px] text-muted-foreground">AI Diabetes Care Assistant</p>
        </div>
      </Link>
    </header>
  );
}
