'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, TrendingDown, TrendingUp, Hash } from 'lucide-react';
import type { Stats } from '@/lib/dashboard-context';

const STAT_CONFIG = [
  { key: 'count' as const, label: 'Readings', unit: undefined, icon: Hash, colorClass: 'text-teal', bgClass: 'bg-teal/15', borderClass: 'border-teal/20' },
  { key: 'average' as const, label: 'Average', unit: 'mg/dL', icon: Activity, colorClass: 'text-amber', bgClass: 'bg-amber/15', borderClass: 'border-amber/20' },
  { key: 'min' as const, label: 'Min', unit: 'mg/dL', icon: TrendingDown, colorClass: 'text-sage', bgClass: 'bg-sage/15', borderClass: 'border-sage/20' },
  { key: 'max' as const, label: 'Max', unit: 'mg/dL', icon: TrendingUp, colorClass: 'text-rose-accent', bgClass: 'bg-rose-accent/15', borderClass: 'border-rose-accent/20' },
] as const;

function getValueColor(key: string, value: number | null): string {
  if (value === null) return 'text-foreground';
  if (key === 'average' && (value > 180 || value < 70)) return 'text-rose-accent';
  if (key === 'min' && value < 70) return 'text-rose-accent';
  if (key === 'max' && value > 180) return 'text-rose-accent';
  return 'text-foreground';
}

export default function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {STAT_CONFIG.map((cfg, i) => {
        const Icon = cfg.icon;
        const value = stats[cfg.key];
        const color = getValueColor(cfg.key, value);

        return (
          <Card key={cfg.key} className={`animate-fade-in-up stagger-${i + 1} group hover:shadow-md transition-all border-l-[3px] ${cfg.borderClass}`}>
            <CardContent className="pt-3.5 pb-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-5 h-5 rounded ${cfg.bgClass} flex items-center justify-center`}>
                  <Icon className={`size-3 ${cfg.colorClass}`} />
                </div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{cfg.label}</p>
              </div>
              <p className={`text-2xl font-bold font-display tracking-tight ${color}`}>
                {value !== null ? value : '\u2014'}
                {value !== null && cfg.unit && (
                  <span className="text-xs font-sans font-normal text-muted-foreground ml-1">{cfg.unit}</span>
                )}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
