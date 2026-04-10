import { NextRequest, NextResponse } from 'next/server';
import { insertGlucoseReading, getGlucoseReadings, getAllGlucoseReadings } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = searchParams.get('days');

    const readings = days ? await getGlucoseReadings(parseInt(days)) : await getAllGlucoseReadings();
    return NextResponse.json({ readings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch readings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { value_mgdl, notes } = body;

    if (typeof value_mgdl !== 'number') {
      return NextResponse.json({ error: 'value_mgdl must be a number' }, { status: 400 });
    }

    const reading = await insertGlucoseReading(value_mgdl, notes);
    return NextResponse.json({ reading }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save reading' },
      { status: 500 }
    );
  }
}
