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
    <header className="h-14 shrink-0 border-b border-border/60 flex items-center px-4 gap-3 bg-card/80 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePanel}
        className="hidden lg:inline-flex text-muted-foreground hover:text-primary hover:bg-teal-light/50 transition-colors"
        aria-label={panelOpen ? 'Close dashboard panel' : 'Open dashboard panel'}
      >
        {panelOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
      </Button>
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 bg-gradient-to-br from-teal to-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm shadow-teal/20 group-hover:shadow-md group-hover:shadow-teal/30 transition-shadow">
          <HeartPulse className="size-[18px]" />
        </div>
        <div className="leading-none">
          <p className="text-[15px] font-display font-bold tracking-tight text-foreground">DiaVela</p>
          <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Diabetes Care</p>
        </div>
      </Link>
    </header>
  );
}
