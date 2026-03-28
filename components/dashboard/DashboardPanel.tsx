'use client';

import { useDashboard } from '@/lib/dashboard-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Pill, AlertCircle } from 'lucide-react';
import GlucoseChart from '@/components/GlucoseChart';
import MedicationCard from '@/components/MedicationCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ReadingsTable from '@/components/dashboard/ReadingsTable';

function TimeInRangeBar({ percent }: { percent: number | null }) {
  if (percent === null) return null;

  const barColor = percent >= 70
    ? 'bg-sage'
    : percent >= 50
      ? 'bg-amber'
      : 'bg-rose-accent';

  const textColor = percent >= 70
    ? 'text-sage'
    : percent >= 50
      ? 'text-amber'
      : 'text-rose-accent';

  const bgTint = percent >= 70
    ? 'bg-sage-bg/50'
    : percent >= 50
      ? 'bg-amber-bg/50'
      : 'bg-rose-bg/50';

  return (
    <Card className={`animate-fade-in-up stagger-3 overflow-hidden border-0 ${bgTint}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-semibold text-foreground">Time in Range</p>
          <p className={`text-xl font-bold font-display ${textColor}`}>{percent}%</p>
        </div>
        <div className="w-full h-3 bg-background/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-muted-foreground">70\u2013180 mg/dL</p>
          <p className="text-[11px] text-muted-foreground">ADA target: \u226570%</p>
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
  const { readings, medications, stats, loading, error, days, setDays } = useDashboard();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4 bg-panel/50 min-h-full">
        {/* Header with time range */}
        <div className="flex items-center justify-between animate-fade-in">
          <h2 className="text-base font-display font-bold text-foreground tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-1 bg-teal-bg/70 rounded-full p-0.5 border border-teal/15">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  days === d
                    ? 'bg-teal text-white shadow-sm shadow-teal/30'
                    : 'text-teal hover:text-teal-vivid'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-accent/20 bg-rose-bg/40 px-3.5 py-3 text-sm text-rose-accent animate-fade-in">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <LoadingPulse />
        ) : (
          <>
            <StatsGrid stats={stats} />
            <TimeInRangeBar percent={stats.inRangePercent} />

            {/* Glucose Chart */}
            <Card className="animate-fade-in-up stagger-4 overflow-hidden border-teal/10">
              <CardHeader className="pb-2 bg-teal-bg/30">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-teal/15 flex items-center justify-center">
                    <TrendingUp className="size-3.5 text-teal" />
                  </div>
                  Glucose Trends
                  <Badge variant="secondary" className="text-[11px] font-normal ml-auto bg-teal-bg text-teal border-teal/15">
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
            <Card className="animate-fade-in-up stagger-5 overflow-hidden border-amber/10">
              <CardHeader className="pb-2 bg-amber-bg/30">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber/15 flex items-center justify-center">
                    <Pill className="size-3.5 text-amber" />
                  </div>
                  Medications
                  <Badge variant="secondary" className="text-[11px] font-normal ml-auto bg-amber-bg text-amber border-amber/15">
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
