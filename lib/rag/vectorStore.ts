import fs from 'fs';
import path from 'path';

export interface VectorEntry {
  id: string;
  text: string;
  source: string;
  embedding: number[];
}

export interface VectorStore {
  entries: VectorEntry[];
  createdAt: string;
}

const VECTORS_PATH = path.join(process.cwd(), 'data', 'vectors.json');

let cachedStore: VectorStore | null = null;

export function loadVectorStore(): VectorStore {
  if (cachedStore) return cachedStore;

  if (!fs.existsSync(VECTORS_PATH)) {
    return { entries: [], createdAt: new Date().toISOString() };
  }

  try {
    const raw = fs.readFileSync(VECTORS_PATH, 'utf-8');
    cachedStore = JSON.parse(raw) as VectorStore;
    return cachedStore;
  } catch (err) {
    console.error('[vectorStore] Failed to load vectors.json — knowledge base unavailable:', err);
    return { entries: [], createdAt: new Date().toISOString() };
  }
}

export function saveVectorStore(store: VectorStore): void {
  const dir = path.dirname(VECTORS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(VECTORS_PATH, JSON.stringify(store, null, 2), 'utf-8');
  cachedStore = store;
}

export function invalidateCache(): void {
  cachedStore = null;
}
