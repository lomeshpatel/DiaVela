import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { loadVectorStore, VectorEntry } from './vectorStore';

const EMBEDDING_MODEL = google.textEmbeddingModel('text-embedding-004');

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: EMBEDDING_MODEL,
      value: text,
    });
    return embedding;
  } catch (err) {
    console.error('[embeddings] generateEmbedding failed:', err);
    throw new Error('Embedding generation failed — knowledge search unavailable.');
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export interface SearchResult {
  id: string;
  text: string;
  source: string;
  score: number;
}

export async function searchKnowledgeBase(query: string, topK: number = 3): Promise<SearchResult[]> {
  const store = loadVectorStore();

  if (store.entries.length === 0) {
    return [];
  }

  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(query);
  } catch (err) {
    console.error('[embeddings] searchKnowledgeBase failed for query:', query, err);
    return [];
  }

  const scored = store.entries.map((entry: VectorEntry) => ({
    id: entry.id,
    text: entry.text,
    source: entry.source,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
