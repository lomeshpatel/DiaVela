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
} from 'recharts';
import { Activity } from 'lucide-react';

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

/* Vivid health colors */
const COLORS = {
  sage: '#2ea86b',       /* in-range green — vivid */
  amber: '#d4920a',      /* slightly high — vivid amber */
  rose: '#d44040',        /* out of range — vivid rose */
  teal: '#0f8a8a',        /* primary line — vivid teal */
  muted: '#888580',       /* axis text */
  gridStroke: '#e8e4dc',  /* warm grid */
};

function getColor(value: number): string {
  if (value < 70) return COLORS.rose;
  if (value <= 140) return COLORS.sage;
  if (value <= 180) return COLORS.amber;
  return COLORS.rose;
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
      r={4.5}
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
  let statusColor = COLORS.sage;
  if (value < 70) { status = 'Low'; statusColor = COLORS.rose; }
  else if (value > 180) { status = 'High'; statusColor = COLORS.rose; }
  else if (value > 140) { status = 'Slightly High'; statusColor = COLORS.amber; }

  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm backdrop-blur-sm">
      <p className="font-bold text-foreground text-lg tabular-nums">{value} <span className="text-xs font-normal text-muted-foreground">mg/dL</span></p>
      <p className="font-semibold text-xs mt-0.5" style={{ color: statusColor }}>{status}</p>
      <p className="text-muted-foreground text-xs mt-1">{data.formattedTime}</p>
      {data.notes && <p className="text-muted-foreground text-xs mt-1 italic">&ldquo;{data.notes}&rdquo;</p>}
    </div>
  );
}

export default function GlucoseChart({ readings }: Props) {
  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-muted-foreground">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-bg mx-auto mb-3 flex items-center justify-center border border-teal/20">
            <Activity className="size-7 text-teal" />
          </div>
          <p className="text-sm font-semibold text-foreground">No glucose readings yet</p>
          <p className="text-xs text-muted-foreground mt-1">Ask DiaVela to log your first reading</p>
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
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridStroke} />
          <XAxis
            dataKey="formattedTime"
            tick={{ fontSize: 10, fill: COLORS.muted }}
            interval="preserveStartEnd"
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
          />
          <YAxis
            domain={[40, 350]}
            tick={{ fontSize: 10, fill: COLORS.muted }}
            tickFormatter={(v) => `${v}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine y={70} stroke={COLORS.rose} strokeDasharray="6 3" strokeWidth={1.5} strokeOpacity={0.6} />
          <ReferenceLine y={140} stroke={COLORS.sage} strokeDasharray="6 3" strokeWidth={1.5} strokeOpacity={0.6} />
          <ReferenceLine y={180} stroke={COLORS.amber} strokeDasharray="6 3" strokeWidth={1.5} strokeOpacity={0.6} />

          <Line
            type="monotone"
            dataKey="value"
            stroke={COLORS.teal}
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 7, stroke: COLORS.teal, strokeWidth: 2, fill: 'white' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Color legend */}
      <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground justify-center font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS.sage }} />
          70\u2013140 Target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS.amber }} />
          140\u2013180 High
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS.rose }} />
          Out of Range
        </span>
      </div>
    </div>
  );
}
