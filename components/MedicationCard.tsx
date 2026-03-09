'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Medication {
  id: number;
  name: string;
  dose: string;
  schedule_time: string;
  notes: string | null;
  created_at: string;
}

interface Props {
  medications: Medication[];
}

function getMedicationIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('insulin')) return '💉';
  if (lower.includes('metformin')) return '💊';
  if (lower.includes('jardiance') || lower.includes('empagliflozin')) return '💊';
  if (lower.includes('ozempic') || lower.includes('semaglutide')) return '💉';
  return '💊';
}

export default function MedicationCard({ medications }: Props) {
  if (medications.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center">
            <div className="text-3xl mb-1">💊</div>
            <p className="text-sm">No medications added yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {medications.map((med) => (
        <Card key={med.id} className="border-l-4 border-l-indigo-400">
          <CardContent className="py-3 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className="text-xl">{getMedicationIcon(med.name)}</span>
                <div>
                  <p className="font-semibold text-gray-800">{med.name}</p>
                  <p className="text-sm text-gray-600">{med.dose}</p>
                  {med.notes && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">{med.notes}</p>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {med.schedule_time}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
