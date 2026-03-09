import { NextRequest, NextResponse } from 'next/server';
import { insertMedication, getAllMedications } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const medications = getAllMedications();
    return NextResponse.json({ medications });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch medications' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, dose, schedule_time, notes } = body;

    if (!name || !dose || !schedule_time) {
      return NextResponse.json(
        { error: 'name, dose, and schedule_time are required' },
        { status: 400 }
      );
    }

    const medication = insertMedication(name, dose, schedule_time, notes);
    return NextResponse.json({ medication }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save medication' },
      { status: 500 }
    );
  }
}
