/**
 * Ingest script: reads all .txt files from data/knowledge/,
 * splits them into chunks, generates embeddings, and saves to data/vectors.json.
 *
 * Run with: npx tsx lib/rag/ingest.ts
 */

import fs from 'fs';
import path from 'path';
import { generateEmbedding } from './embeddings';
import { saveVectorStore, VectorEntry } from './vectorStore';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'data', 'knowledge');
const CHUNK_SIZE = 500; // characters per chunk
const CHUNK_OVERLAP = 50;

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks.filter(c => c.length > 50); // skip tiny chunks
}

async function ingest() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.txt'));
  console.log(`Found ${files.length} knowledge files`);

  const entries: VectorEntry[] = [];
  let chunkIndex = 0;

  for (const file of files) {
    const filePath = path.join(KNOWLEDGE_DIR, file);
    const text = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);

    console.log(`  ${file}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`    Embedding chunk ${i + 1}/${chunks.length}...`);
      const embedding = await generateEmbedding(chunk);

      entries.push({
        id: `chunk_${chunkIndex++}`,
        text: chunk,
        source: file.replace('.txt', ''),
        embedding,
      });
    }
  }

  saveVectorStore({
    entries,
    createdAt: new Date().toISOString(),
  });

  console.log(`\nSaved ${entries.length} chunks to data/vectors.json`);
}

ingest().catch(console.error);
