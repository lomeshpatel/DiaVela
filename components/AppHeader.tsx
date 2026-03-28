'use client';

import Link from 'next/link';
import { HeartPulse, PanelLeftClose, PanelLeftOpen, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export default function AppHeader({ panelOpen, onTogglePanel }: AppHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="h-14 shrink-0 border-b border-teal/15 flex items-center px-4 gap-3 bg-gradient-to-r from-teal-bg via-card to-amber-bg/40">
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePanel}
        className="hidden lg:inline-flex text-teal hover:text-teal-vivid hover:bg-teal-bg transition-colors"
        aria-label={panelOpen ? 'Close dashboard panel' : 'Open dashboard panel'}
      >
        {panelOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
      </Button>
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 bg-gradient-to-br from-teal-vivid to-teal rounded-xl flex items-center justify-center text-white shadow-md shadow-teal/25 group-hover:shadow-lg group-hover:shadow-teal/35 transition-all">
          <HeartPulse className="size-[18px]" />
        </div>
        <div className="leading-none">
          <p className="text-[15px] font-display font-bold tracking-tight text-foreground">DiaVela</p>
          <p className="text-[10px] text-teal font-semibold tracking-widest uppercase">Diabetes Care</p>
        </div>
      </Link>

      <div className="ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="text-amber hover:text-amber-vivid hover:bg-amber-bg transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  );
}
