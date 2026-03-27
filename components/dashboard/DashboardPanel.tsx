'use client';

import { useDashboard } from '@/lib/dashboard-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import GlucoseChart from '@/components/GlucoseChart';
import MedicationCard from '@/components/MedicationCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ReadingsTable from '@/components/dashboard/ReadingsTable';

function TimeInRangeBar({ percent }: { percent: number | null }) {
  if (percent === null) return null;
  const color = percent >= 70 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = percent >= 70 ? 'text-green-600' : percent >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Time in Range (70\u2013180 mg/dL)</p>
          <p className={`text-lg font-bold ${textColor}`}>{percent}%</p>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">ADA target: \u226570% time in range</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPanel() {
  const { readings, medications, stats, loading, days, setDays } = useDashboard();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header with time range */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Dashboard</h2>
          <div className="flex items-center gap-1.5">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  days === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <StatsGrid stats={stats} />
        <TimeInRangeBar percent={stats.inRangePercent} />

        {/* Glucose Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              Glucose Trends
              <Badge variant="secondary" className="text-xs font-normal">
                {readings.length} readings
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
            ) : (
              <GlucoseChart readings={readings} />
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              Medications
              <Badge variant="secondary" className="text-xs font-normal">
                {medications.length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : (
              <MedicationCard medications={medications} />
            )}
          </CardContent>
        </Card>

        {/* Recent Readings */}
        {readings.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Recent Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <ReadingsTable readings={readings} />
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
