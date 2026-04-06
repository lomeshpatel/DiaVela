import { describe, it, expect, beforeEach, vi } from 'vitest';

// Use in-memory libSQL for all DB tests
vi.stubEnv('TURSO_DATABASE_URL', 'file::memory:');

// Re-import module after env is set — vitest resets module registry per file
const {
  insertGlucoseReading,
  getGlucoseReadingById,
  getGlucoseReadings,
  getAllGlucoseReadings,
  insertMedication,
  getMedicationById,
  getAllMedications,
} = await import('@/lib/db');

// Reset the isInitialized guard between tests by re-importing a fresh module
// Since vitest isolates modules per test file this is safe.

describe('Glucose readings', () => {
  it('inserts and retrieves a reading by id', async () => {
    const reading = await insertGlucoseReading(120, 'after lunch');

    expect(reading.id).toBeTypeOf('number');
    expect(reading.value_mgdl).toBe(120);
    expect(reading.notes).toBe('after lunch');
    expect(reading.timestamp).toBeTypeOf('string');
  });

  it('inserts a reading without notes', async () => {
    const reading = await insertGlucoseReading(95);
    expect(reading.notes).toBeNull();
  });

  it('getGlucoseReadingById returns null for missing id', async () => {
    const result = await getGlucoseReadingById(999999);
    expect(result).toBeNull();
  });

  it('getAllGlucoseReadings returns inserted readings', async () => {
    await insertGlucoseReading(100);
    await insertGlucoseReading(140);

    const readings = await getAllGlucoseReadings();
    expect(readings.length).toBeGreaterThanOrEqual(2);
    expect(readings.every(r => typeof r.value_mgdl === 'number')).toBe(true);
  });

  it('getGlucoseReadings filters by days', async () => {
    const readings = await getGlucoseReadings(7);
    // All returned readings should have a timestamp (basic shape check)
    expect(Array.isArray(readings)).toBe(true);
    readings.forEach(r => {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('value_mgdl');
      expect(r).toHaveProperty('timestamp');
    });
  });
});

describe('Medications', () => {
  it('inserts and retrieves a medication by id', async () => {
    const med = await insertMedication('Metformin', '500mg', '8:00 AM', 'take with food');

    expect(med.id).toBeTypeOf('number');
    expect(med.name).toBe('Metformin');
    expect(med.dose).toBe('500mg');
    expect(med.schedule_time).toBe('8:00 AM');
    expect(med.notes).toBe('take with food');
    expect(med.created_at).toBeTypeOf('string');
  });

  it('inserts a medication without notes', async () => {
    const med = await insertMedication('Insulin', '10 units', 'bedtime');
    expect(med.notes).toBeNull();
  });

  it('getMedicationById returns null for missing id', async () => {
    const result = await getMedicationById(999999);
    expect(result).toBeNull();
  });

  it('getAllMedications returns inserted medications', async () => {
    await insertMedication('Lisinopril', '10mg', '9:00 AM');
    await insertMedication('Atorvastatin', '20mg', 'bedtime');

    const meds = await getAllMedications();
    expect(meds.length).toBeGreaterThanOrEqual(2);
    expect(meds.every(m => typeof m.name === 'string')).toBe(true);
  });
});
