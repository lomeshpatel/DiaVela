'use client';

import { useDashboard } from '@/lib/dashboard-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Pill } from 'lucide-react';
import GlucoseChart from '@/components/GlucoseChart';
import MedicationCard from '@/components/MedicationCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ReadingsTable from '@/components/dashboard/ReadingsTable';

function TimeInRangeBar({ percent }: { percent: number | null }) {
  if (percent === null) return null;

  const color = percent >= 70
    ? 'bg-sage'
    : percent >= 50
      ? 'bg-amber'
      : 'bg-rose-accent';

  const textColor = percent >= 70
    ? 'text-sage'
    : percent >= 50
      ? 'text-amber'
      : 'text-rose-accent';

  return (
    <Card className="animate-fade-in-up stagger-3 overflow-hidden">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-medium text-foreground">Time in Range</p>
          <div className="flex items-baseline gap-1">
            <p className={`text-xl font-bold font-display ${textColor}`}>{percent}%</p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-muted-foreground">70–180 mg/dL</p>
          <p className="text-[11px] text-muted-foreground">ADA target: ≥70%</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingPulse() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="h-20 rounded-xl animate-shimmer"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function DashboardPanel() {
  const { readings, medications, stats, loading, days, setDays } = useDashboard();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header with time range */}
        <div className="flex items-center justify-between animate-fade-in">
          <h2 className="text-base font-display font-bold text-foreground tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-1 bg-muted/80 rounded-full p-0.5">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  days === d
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingPulse />
        ) : (
          <>
            <StatsGrid stats={stats} />
            <TimeInRangeBar percent={stats.inRangePercent} />

            {/* Glucose Chart */}
            <Card className="animate-fade-in-up stagger-4 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Glucose Trends
                  <Badge variant="secondary" className="text-[11px] font-normal ml-auto">
                    {readings.length} readings
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GlucoseChart readings={readings} />
              </CardContent>
            </Card>

            {/* Medications */}
            <Card className="animate-fade-in-up stagger-5 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Pill className="size-4 text-amber" />
                  Medications
                  <Badge variant="secondary" className="text-[11px] font-normal ml-auto">
                    {medications.length} active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MedicationCard medications={medications} />
              </CardContent>
            </Card>

            {/* Recent Readings */}
            {readings.length > 0 && (
              <Card className="animate-fade-in-up stagger-6 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">Recent Readings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReadingsTable readings={readings} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
