import { loadVectorStore, VectorEntry } from './vectorStore';

type EmbeddingPipeline = (texts: string[], options?: object) => Promise<{ data: Float32Array; dims: number[] }[]>;

// Lazy-loaded pipeline to avoid top-level await issues
let pipelineInstance: EmbeddingPipeline | null = null;

async function getEmbeddingPipeline(): Promise<EmbeddingPipeline> {
  if (!pipelineInstance) {
    // Dynamic import to avoid SSR issues
    const { pipeline } = await import('@huggingface/transformers');
    pipelineInstance = (await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')) as unknown as EmbeddingPipeline;
  }
  return pipelineInstance!;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe([text], { pooling: 'mean', normalize: true });
  // output[0].data is a Float32Array
  return Array.from(output[0].data);
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

  const queryEmbedding = await generateEmbedding(query);

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
