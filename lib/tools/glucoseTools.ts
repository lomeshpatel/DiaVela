import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { insertGlucoseReading, getGlucoseReadings, GlucoseReading } from '../db';

export interface GlucoseTrends {
  readings: GlucoseReading[];
  stats: {
    count: number;
    average: number | null;
    min: number | null;
    max: number | null;
    inRangePercent: number | null;
  };
  days: number;
}

function getGlucoseStatus(value: number): string {
  if (value < 54) return 'severely low';
  if (value < 70) return 'low (hypoglycemia)';
  if (value <= 140) return 'normal range';
  if (value <= 180) return 'slightly elevated';
  if (value <= 250) return 'high (hyperglycemia)';
  return 'very high';
}

export const logGlucoseReadingTool = tool({
  description: 'Log a blood glucose reading for the patient. Use this when the user mentions their blood glucose/blood sugar level.',
  inputSchema: zodSchema(z.object({
    value_mgdl: z.number().describe('Blood glucose value in mg/dL'),
    notes: z.string().optional().describe('Optional notes (e.g., "after lunch", "fasting", "before exercise")'),
  })),
  execute: async (input) => {
    const reading = insertGlucoseReading(input.value_mgdl, input.notes);
    const status = getGlucoseStatus(input.value_mgdl);
    return {
      success: true,
      reading,
      status,
      message: `Logged glucose reading: ${input.value_mgdl} mg/dL (${status})`,
    };
  },
});

export const getGlucoseTrendsTool = tool({
  description: 'Retrieve blood glucose readings for the past N days and compute statistics (average, min, max, count).',
  inputSchema: zodSchema(z.object({
    days: z.number().optional().describe('Number of days to look back (default: 7)'),
  })),
  execute: async (input): Promise<GlucoseTrends> => {
    const days = input.days ?? 7;
    const readings = getGlucoseReadings(days);

    if (readings.length === 0) {
      return { readings: [], stats: { count: 0, average: null, min: null, max: null, inRangePercent: null }, days };
    }

    const values = readings.map(r => r.value_mgdl);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const inRange = values.filter(v => v >= 70 && v <= 180).length;
    const inRangePercent = Math.round((inRange / values.length) * 100);

    return {
      readings,
      stats: { count: readings.length, average: Math.round(average * 10) / 10, min, max, inRangePercent },
      days,
    };
  },
});
