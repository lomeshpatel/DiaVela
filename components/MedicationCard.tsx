'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Syringe } from 'lucide-react';

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

function isInjectable(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('insulin') || lower.includes('ozempic') || lower.includes('semaglutide');
}

export default function MedicationCard({ medications }: Props) {
  if (medications.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-muted-foreground">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-bg mx-auto mb-2 flex items-center justify-center border border-amber/20">
            <Pill className="size-6 text-amber" />
          </div>
          <p className="text-sm font-semibold text-foreground">No medications added</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ask DiaVela to add a reminder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {medications.map((med) => {
        const injectable = isInjectable(med.name);
        const Icon = injectable ? Syringe : Pill;

        return (
          <Card key={med.id} className="border-l-[3px] border-l-amber hover:shadow-md transition-all hover:border-l-amber-vivid">
            <CardContent className="py-2.5 px-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-bg flex items-center justify-center shrink-0 mt-0.5 border border-amber/15">
                    <Icon className="size-4 text-amber-vivid" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.dose}</p>
                    {med.notes && (
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5 italic">{med.notes}</p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="text-[11px] shrink-0 bg-amber-bg text-amber font-semibold border-amber/15">
                  {med.schedule_time}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
