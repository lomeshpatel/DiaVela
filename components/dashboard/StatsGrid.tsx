'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Stats } from '@/lib/dashboard-context';

function StatCard({ label, value, unit, color }: { label: string; value: string | number | null; unit?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color || 'text-foreground'}`}>
          {value !== null ? value : '\u2014'}
          {value !== null && unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

export default function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Readings" value={stats.count} />
      <StatCard
        label="Average"
        value={stats.average}
        unit="mg/dL"
        color={stats.average !== null && (stats.average > 180 || stats.average < 70) ? 'text-red-600' : 'text-foreground'}
      />
      <StatCard label="Min" value={stats.min} unit="mg/dL" color={stats.min !== null && stats.min < 70 ? 'text-red-600' : 'text-foreground'} />
      <StatCard label="Max" value={stats.max} unit="mg/dL" color={stats.max !== null && stats.max > 180 ? 'text-red-600' : 'text-foreground'} />
    </div>
  );
}
