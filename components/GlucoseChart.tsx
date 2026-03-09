'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface GlucoseReading {
  id: number;
  value_mgdl: number;
  timestamp: string;
  notes: string | null;
}

interface Props {
  readings: GlucoseReading[];
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getColor(value: number): string {
  if (value < 70) return '#ef4444';   // red - low
  if (value <= 140) return '#22c55e'; // green - normal
  if (value <= 180) return '#f59e0b'; // yellow - slightly high
  return '#ef4444';                   // red - high
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  value?: number;
}

function CustomDot({ cx, cy, value }: CustomDotProps) {
  if (cx === undefined || cy === undefined || value === undefined) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={getColor(value)}
      stroke="white"
      strokeWidth={2}
    />
  );
}

interface TooltipPayload {
  value: number;
  payload: GlucoseReading & { formattedTime: string };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const value = entry.value;
  const data = entry.payload;

  let status = 'Normal';
  let statusColor = 'text-green-600';
  if (value < 70) { status = 'Low'; statusColor = 'text-red-600'; }
  else if (value > 180) { status = 'High'; statusColor = 'text-red-600'; }
  else if (value > 140) { status = 'Slightly High'; statusColor = 'text-yellow-600'; }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800">{value} mg/dL</p>
      <p className={`font-medium ${statusColor}`}>{status}</p>
      <p className="text-gray-500">{data.formattedTime}</p>
      {data.notes && <p className="text-gray-600 mt-1 italic">"{data.notes}"</p>}
    </div>
  );
}

export default function GlucoseChart({ readings }: Props) {
  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No glucose readings yet</p>
          <p className="text-sm">Ask DiaVela to log your first reading</p>
        </div>
      </div>
    );
  }

  const chartData = [...readings]
    .reverse()
    .map(r => ({
      ...r,
      formattedTime: formatTimestamp(r.timestamp),
      value: r.value_mgdl,
    }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="formattedTime"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[40, 350]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={(v) => `${v}`}
            label={{ value: 'mg/dL', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Target range shading via reference lines */}
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '70', position: 'left', fontSize: 10, fill: '#ef4444' }} />
          <ReferenceLine y={140} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '140', position: 'left', fontSize: 10, fill: '#22c55e' }} />
          <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '180', position: 'left', fontSize: 10, fill: '#f59e0b' }} />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 7 }}
            name="Glucose (mg/dL)"
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>

      {/* Color legend */}
      <div className="flex gap-4 mt-2 text-xs text-gray-500 justify-center">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 70–140 (Target)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 140–180 (Slightly High)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &lt;70 or &gt;180 (Out of Range)</span>
      </div>
    </div>
  );
}
