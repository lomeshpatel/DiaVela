'use client';

import type { GlucoseReading } from '@/lib/dashboard-context';

function getStatusInfo(value: number): { label: string; className: string } {
  if (value < 70) return { label: 'Low', className: 'bg-rose-accent/10 text-rose-accent' };
  if (value <= 140) return { label: 'Normal', className: 'bg-sage/10 text-sage' };
  if (value <= 180) return { label: 'Slightly High', className: 'bg-amber/10 text-amber' };
  return { label: 'High', className: 'bg-rose-accent/10 text-rose-accent' };
}

export default function ReadingsTable({ readings }: { readings: GlucoseReading[] }) {
  if (readings.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider pb-2.5">Time</th>
            <th className="text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider pb-2.5">Value</th>
            <th className="text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider pb-2.5">Status</th>
            <th className="text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider pb-2.5">Notes</th>
          </tr>
        </thead>
        <tbody>
          {readings.slice(0, 10).map(r => {
            const status = getStatusInfo(r.value_mgdl);
            return (
              <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 text-muted-foreground text-[13px]">
                  {new Date(r.timestamp).toLocaleString()}
                </td>
                <td className="py-2.5 font-semibold text-foreground tabular-nums">{r.value_mgdl} <span className="text-muted-foreground font-normal text-xs">mg/dL</span></td>
                <td className="py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </td>
                <td className="py-2.5 text-muted-foreground text-[13px]">{r.notes || '\u2014'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
