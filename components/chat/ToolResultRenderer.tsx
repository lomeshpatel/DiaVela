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
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-teal-bg rounded-lg p-2.5 border border-teal/20">
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-0.5 font-semibold">Average</span>
            <span className="font-bold text-teal tabular-nums text-sm">{output.stats.average} mg/dL</span>
          </div>
          <div className="bg-sage-bg rounded-lg p-2.5 border border-sage/20">
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-0.5 font-semibold">In Range</span>
            <span className="font-bold text-sage tabular-nums text-sm">{output.stats.inRangePercent}%</span>
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
      <div className="space-y-1.5">
        {output.foods.map((food, i) => (
          <div key={i} className="bg-amber-bg rounded-lg p-3 border border-amber/20 text-xs">
            <p className="font-bold text-foreground text-[13px]">{food.description}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-muted-foreground">
              <span><span className="font-semibold text-amber">{food.calories}</span> cal</span>
              <span><span className="font-semibold text-amber">{food.carbs_g}g</span> carbs</span>
              <span><span className="font-semibold text-foreground">{food.protein_g}g</span> protein</span>
              <span><span className="font-semibold text-foreground">{food.fat_g}g</span> fat</span>
              <span><span className="font-semibold text-foreground">{food.fiber_g}g</span> fiber</span>
              <span><span className="font-semibold text-foreground">{food.sugar_g}g</span> sugar</span>
            </div>
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
    return <pre className="text-xs bg-muted/60 rounded-lg p-3 overflow-x-auto text-muted-foreground border border-border">{JSON.stringify(output, null, 2)}</pre>;
  }

  return null;
}
