import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { searchKnowledgeBase, SearchResult } from '../rag/embeddings';

export interface KnowledgeResult {
  query: string;
  results: SearchResult[];
  context: string;
  hasResults: boolean;
}

export const searchDiabetesKnowledgeTool = tool({
  description: 'Search the diabetes knowledge base for information about diabetes management, medications, nutrition, glucose targets, HbA1c, exercise, foot care, and other diabetes-related topics. Use this for educational questions.',
  inputSchema: zodSchema(z.object({
    query: z.string().describe('The question or topic to search for in the diabetes knowledge base'),
    top_k: z.number().optional().describe('Number of relevant passages to retrieve (default: 3)'),
  })),
  execute: async (input): Promise<KnowledgeResult> => {
    const topK = input.top_k ?? 3;
    const results = await searchKnowledgeBase(input.query, topK);

    if (results.length === 0) {
      return {
        query: input.query,
        results: [],
        context: 'No relevant information found in the knowledge base. The knowledge base may not be initialized yet.',
        hasResults: false,
      };
    }

    const context = results.map(r => `[Source: ${r.source}]\n${r.text}`).join('\n\n---\n\n');
    return { query: input.query, results, context, hasResults: true };
  },
});
