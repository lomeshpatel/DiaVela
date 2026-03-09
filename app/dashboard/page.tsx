'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GlucoseChart from '@/components/GlucoseChart';
import MedicationCard from '@/components/MedicationCard';

interface GlucoseReading {
  id: number;
  value_mgdl: number;
  timestamp: string;
  notes: string | null;
}

interface Medication {
  id: number;
  name: string;
  dose: string;
  schedule_time: string;
  notes: string | null;
  created_at: string;
}

interface Stats {
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

function StatCard({ label, value, unit, color }: { label: string; value: string | number | null; unit?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color || 'text-gray-800'}`}>
          {value !== null ? value : '—'}
          {value !== null && unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [glucoseRes, medsRes] = await Promise.all([
          fetch(`/api/glucose?days=${days}`),
          fetch('/api/medications'),
        ]);
        const glucoseData = await glucoseRes.json();
        const medsData = await medsRes.json();
        setReadings(glucoseData.readings || []);
        setMedications(medsData.medications || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [days]);

  const stats = computeStats(readings);

  const getInRangeColor = (pct: number | null) => {
    if (pct === null) return 'text-gray-800';
    if (pct >= 70) return 'text-green-600';
    if (pct >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DiaVela</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            ← Back to Chat
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Time range selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Time range:</span>
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Readings" value={stats.count} />
          <StatCard
            label="Average"
            value={stats.average}
            unit="mg/dL"
            color={stats.average !== null && stats.average > 180 ? 'text-red-600' : stats.average !== null && stats.average < 70 ? 'text-red-600' : 'text-gray-800'}
          />
          <StatCard label="Min" value={stats.min} unit="mg/dL" color={stats.min !== null && stats.min < 70 ? 'text-red-600' : 'text-gray-800'} />
          <StatCard label="Max" value={stats.max} unit="mg/dL" color={stats.max !== null && stats.max > 180 ? 'text-red-600' : 'text-gray-800'} />
        </div>

        {/* Time in Range */}
        {stats.inRangePercent !== null && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Time in Range (70–180 mg/dL)</p>
                <p className={`text-lg font-bold ${getInRangeColor(stats.inRangePercent)}`}>
                  {stats.inRangePercent}%
                </p>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.inRangePercent >= 70 ? 'bg-green-500' :
                    stats.inRangePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.inRangePercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">ADA target: ≥70% time in range</p>
            </CardContent>
          </Card>
        )}

        {/* Glucose Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              📈 Glucose Trends
              <Badge variant="secondary" className="text-xs font-normal">
                {readings.length} readings
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-72 flex items-center justify-center text-gray-400">
                Loading...
              </div>
            ) : (
              <GlucoseChart readings={readings} />
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              💊 Medication Reminders
              <Badge variant="secondary" className="text-xs font-normal">
                {medications.length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : (
              <MedicationCard medications={medications} />
            )}
          </CardContent>
        </Card>

        {/* Recent Readings Table */}
        {readings.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Recent Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-500 font-medium pb-2">Time</th>
                      <th className="text-left text-gray-500 font-medium pb-2">Value</th>
                      <th className="text-left text-gray-500 font-medium pb-2">Status</th>
                      <th className="text-left text-gray-500 font-medium pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.slice(0, 10).map(r => {
                      const status = r.value_mgdl < 70 ? 'Low' : r.value_mgdl <= 140 ? 'Normal' : r.value_mgdl <= 180 ? 'Slightly High' : 'High';
                      const statusColor = r.value_mgdl < 70 || r.value_mgdl > 180 ? 'text-red-600' : r.value_mgdl > 140 ? 'text-yellow-600' : 'text-green-600';
                      return (
                        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 text-gray-600">
                            {new Date(r.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2 font-semibold">{r.value_mgdl} mg/dL</td>
                          <td className={`py-2 font-medium ${statusColor}`}>{status}</td>
                          <td className="py-2 text-gray-500">{r.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
