import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'diavela.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
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

// ---- Glucose Readings ----

export interface GlucoseReading {
  id: number;
  value_mgdl: number;
  timestamp: string;
  notes: string | null;
}

export function insertGlucoseReading(value_mgdl: number, notes?: string): GlucoseReading {
  const stmt = db.prepare(`
    INSERT INTO glucose_readings (value_mgdl, notes) VALUES (?, ?)
  `);
  const result = stmt.run(value_mgdl, notes ?? null);
  return getGlucoseReadingById(result.lastInsertRowid as number)!;
}

export function getGlucoseReadingById(id: number): GlucoseReading | null {
  return db.prepare('SELECT * FROM glucose_readings WHERE id = ?').get(id) as GlucoseReading | null;
}

export function getGlucoseReadings(days: number = 7): GlucoseReading[] {
  return db.prepare(`
    SELECT * FROM glucose_readings
    WHERE timestamp >= datetime('now', ? || ' days')
    ORDER BY timestamp DESC
  `).all(`-${days}`) as GlucoseReading[];
}

export function getAllGlucoseReadings(): GlucoseReading[] {
  return db.prepare('SELECT * FROM glucose_readings ORDER BY timestamp DESC').all() as GlucoseReading[];
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

export function insertMedication(name: string, dose: string, schedule_time: string, notes?: string): Medication {
  const stmt = db.prepare(`
    INSERT INTO medications (name, dose, schedule_time, notes) VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name, dose, schedule_time, notes ?? null);
  return getMedicationById(result.lastInsertRowid as number)!;
}

export function getMedicationById(id: number): Medication | null {
  return db.prepare('SELECT * FROM medications WHERE id = ?').get(id) as Medication | null;
}

export function getAllMedications(): Medication[] {
  return db.prepare('SELECT * FROM medications ORDER BY schedule_time ASC').all() as Medication[];
}

export default db;
