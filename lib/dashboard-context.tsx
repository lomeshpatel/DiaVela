'use client';

import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface GlucoseReading {
  id: number;
  value_mgdl: number;
  timestamp: string;
  notes: string | null;
}

export interface Medication {
  id: number;
  name: string;
  dose: string;
  schedule_time: string;
  notes: string | null;
  created_at: string;
}

export interface Stats {
  count: number;
  average: number | null;
  min: number | null;
  max: number | null;
  inRangePercent: number | null;
}

function computeStats(readings: GlucoseReading[]): Stats {
  if (readings.length === 0) {
    return { count: 0, average: null, min: null, max: null, inRangePercent: null };
  }
  const values = readings.map(r => r.value_mgdl);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const inRange = values.filter(v => v >= 70 && v <= 180).length;
  return {
    count: readings.length,
    average: Math.round(average * 10) / 10,
    min: Math.min(...values),
    max: Math.max(...values),
    inRangePercent: Math.round((inRange / values.length) * 100),
  };
}

interface DashboardContextValue {
  readings: GlucoseReading[];
  medications: Medication[];
  stats: Stats;
  loading: boolean;
  days: number;
  setDays: (days: number) => void;
  refresh: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchData = useCallback(async (daysToFetch: number) => {
    setLoading(true);
    try {
      const [glucoseRes, medsRes] = await Promise.all([
        fetch(`/api/glucose?days=${daysToFetch}`),
        fetch('/api/medications'),
      ]);
      if (!glucoseRes.ok) throw new Error(`Glucose API error: ${glucoseRes.status}`);
      if (!medsRes.ok) throw new Error(`Medications API error: ${medsRes.status}`);
      const glucoseData = await glucoseRes.json();
      const medsData = await medsRes.json();
      setReadings(glucoseData.readings || []);
      setMedications(medsData.medications || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  const refresh = useCallback(() => {
    fetchData(days);
  }, [days, fetchData]);

  const stats = computeStats(readings);

  return (
    <DashboardContext.Provider value={{ readings, medications, stats, loading, days, setDays, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
