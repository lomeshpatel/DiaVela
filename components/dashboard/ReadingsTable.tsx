'use client';

import type { GlucoseReading } from '@/lib/dashboard-context';

export default function ReadingsTable({ readings }: { readings: GlucoseReading[] }) {
  if (readings.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-muted-foreground font-medium pb-2">Time</th>
            <th className="text-left text-muted-foreground font-medium pb-2">Value</th>
            <th className="text-left text-muted-foreground font-medium pb-2">Status</th>
            <th className="text-left text-muted-foreground font-medium pb-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {readings.slice(0, 10).map(r => {
            const status = r.value_mgdl < 70 ? 'Low' : r.value_mgdl <= 140 ? 'Normal' : r.value_mgdl <= 180 ? 'Slightly High' : 'High';
            const statusColor = r.value_mgdl < 70 || r.value_mgdl > 180 ? 'text-red-600' : r.value_mgdl > 140 ? 'text-yellow-600' : 'text-green-600';
            return (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-2 text-muted-foreground">
                  {new Date(r.timestamp).toLocaleString()}
                </td>
                <td className="py-2 font-semibold">{r.value_mgdl} mg/dL</td>
                <td className={`py-2 font-medium ${statusColor}`}>{status}</td>
                <td className="py-2 text-muted-foreground">{r.notes || '\u2014'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
