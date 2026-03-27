'use client';

import GlucoseChart from '@/components/GlucoseChart';
import MedicationCard from '@/components/MedicationCard';
import { MessageResponse } from '@/components/ai-elements/message';

interface GlucoseTrendsOutput {
  readings: Array<{ id: number; value_mgdl: number; timestamp: string; notes: string | null }>;
  stats: { count: number; average: number; min: number; max: number; inRangePercent: number };
}

function isGlucoseTrends(v: unknown): v is GlucoseTrendsOutput {
  return typeof v === 'object' && v !== null && 'readings' in v && 'stats' in v;
}

interface MedicationsOutput {
  medications: Array<{ id: number; name: string; dose: string; schedule_time: string; notes: string | null; created_at: string }>;
}

function isMedicationsOutput(v: unknown): v is MedicationsOutput {
  return typeof v === 'object' && v !== null && 'medications' in v && Array.isArray((v as MedicationsOutput).medications);
}

interface NutritionItem {
  description: string;
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
}

interface NutritionOutput {
  foods: NutritionItem[];
  query: string;
}

function isNutritionOutput(v: unknown): v is NutritionOutput {
  return typeof v === 'object' && v !== null && 'foods' in v && Array.isArray((v as NutritionOutput).foods);
}

export default function ToolResultRenderer({ toolName, output }: { toolName: string; output: unknown }) {
  if (toolName === 'get_glucose_trends' && isGlucoseTrends(output)) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/50 rounded p-2">
            <span className="text-muted-foreground">Average:</span>{' '}
            <span className="font-medium">{output.stats.average} mg/dL</span>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <span className="text-muted-foreground">In Range:</span>{' '}
            <span className="font-medium">{output.stats.inRangePercent}%</span>
          </div>
        </div>
        <GlucoseChart readings={output.readings} />
      </div>
    );
  }

  if (toolName === 'list_medications' && isMedicationsOutput(output)) {
    return <MedicationCard medications={output.medications} />;
  }

  if (toolName === 'search_nutrition' && isNutritionOutput(output)) {
    return (
      <div className="space-y-1">
        {output.foods.map((food, i) => (
          <div key={i} className="bg-muted/50 rounded p-2 text-xs">
            <p className="font-medium">{food.description}</p>
            <p className="text-muted-foreground">
              {food.calories} cal | {food.carbs_g}g carbs | {food.protein_g}g protein | {food.fat_g}g fat | {food.fiber_g}g fiber | {food.sugar_g}g sugar
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Default: render as markdown via MessageResponse for strings, or formatted JSON for objects
  if (typeof output === 'string') {
    return <MessageResponse>{output}</MessageResponse>;
  }

  if (typeof output === 'object' && output !== null) {
    return <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">{JSON.stringify(output, null, 2)}</pre>;
  }

  return null;
}
