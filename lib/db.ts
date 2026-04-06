import { createClient, type Client } from '@libsql/client';
import path from 'path';

const DB_URL = process.env.TURSO_DATABASE_URL ?? `file:${path.join(process.cwd(), 'data', 'diavela.db')}`;
const DB_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

const client: Client = createClient({
  url: DB_URL,
  ...(DB_AUTH_TOKEN ? { authToken: DB_AUTH_TOKEN } : {}),
});

let isInitialized = false;

async function initDb(): Promise<void> {
  if (isInitialized) return;
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS glucose_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value_mgdl REAL NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dose TEXT NOT NULL,
      schedule_time TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  isInitialized = true;
}

// ---- Glucose Readings ----

export interface GlucoseReading {
  id: number;
  value_mgdl: number;
  timestamp: string;
  notes: string | null;
}

export async function insertGlucoseReading(value_mgdl: number, notes?: string): Promise<GlucoseReading> {
  await initDb();
  const result = await client.execute({
    sql: 'INSERT INTO glucose_readings (value_mgdl, notes) VALUES (?, ?)',
    args: [value_mgdl, notes ?? null],
  });
  const id = Number(result.lastInsertRowid);
  const reading = await getGlucoseReadingById(id);
  if (!reading) throw new Error(`insertGlucoseReading: failed to read back row id=${id}`);
  return reading;
}

export async function getGlucoseReadingById(id: number): Promise<GlucoseReading | null> {
  await initDb();
  const result = await client.execute({
    sql: 'SELECT * FROM glucose_readings WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as unknown as GlucoseReading) ?? null;
}

export async function getGlucoseReadings(days: number = 7): Promise<GlucoseReading[]> {
  await initDb();
  const result = await client.execute({
    sql: `SELECT * FROM glucose_readings WHERE timestamp >= datetime('now', ?) ORDER BY timestamp DESC`,
    args: [`-${days} days`],
  });
  return result.rows as unknown as GlucoseReading[];
}

export async function getAllGlucoseReadings(): Promise<GlucoseReading[]> {
  await initDb();
  const result = await client.execute('SELECT * FROM glucose_readings ORDER BY timestamp DESC');
  return result.rows as unknown as GlucoseReading[];
}

// ---- Medications ----

export interface Medication {
  id: number;
  name: string;
  dose: string;
  schedule_time: string;
  notes: string | null;
  created_at: string;
}

export async function insertMedication(name: string, dose: string, schedule_time: string, notes?: string): Promise<Medication> {
  await initDb();
  const result = await client.execute({
    sql: 'INSERT INTO medications (name, dose, schedule_time, notes) VALUES (?, ?, ?, ?)',
    args: [name, dose, schedule_time, notes ?? null],
  });
  const id = Number(result.lastInsertRowid);
  const medication = await getMedicationById(id);
  if (!medication) throw new Error(`insertMedication: failed to read back row id=${id}`);
  return medication;
}

export async function getMedicationById(id: number): Promise<Medication | null> {
  await initDb();
  const result = await client.execute({
    sql: 'SELECT * FROM medications WHERE id = ?',
    args: [id],
  });
  return (result.rows[0] as unknown as Medication) ?? null;
}

export async function getAllMedications(): Promise<Medication[]> {
  await initDb();
  const result = await client.execute('SELECT * FROM medications ORDER BY schedule_time ASC');
  return result.rows as unknown as Medication[];
}
