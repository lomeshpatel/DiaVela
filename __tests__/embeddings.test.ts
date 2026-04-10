import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the 'ai' module so tests don't make real API calls
vi.mock('ai', () => ({
  embed: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
  google: {
    textEmbeddingModel: vi.fn(() => 'mock-model'),
  },
}));

import { embed } from 'ai';
import { generateEmbedding, cosineSimilarity } from '@/lib/rag/embeddings';

const mockEmbed = vi.mocked(embed);

describe('generateEmbedding', () => {
  beforeEach(() => {
    mockEmbed.mockReset();
  });

  it('returns embedding array from embed()', async () => {
    const fakeEmbedding = [0.1, 0.2, 0.3];
    mockEmbed.mockResolvedValueOnce({ embedding: fakeEmbedding, value: 'blood glucose', warnings: [], usage: { tokens: 3 } });

    const result = await generateEmbedding('blood glucose');

    expect(result).toEqual(fakeEmbedding);
    expect(mockEmbed).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'blood glucose' })
    );
  });

  it('throws with a friendly message when embed() fails', async () => {
    mockEmbed.mockRejectedValueOnce(new Error('API error'));

    await expect(generateEmbedding('test')).rejects.toThrow(
      'Embedding generation failed — knowledge search unavailable.'
    );
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('returns 0 for vectors of different lengths', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2])).toBe(0);
  });

  it('returns 0 for zero vector', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it('computes correct similarity for known vectors', () => {
    // [1,1] and [1,0] have cosine similarity of 1/sqrt(2) ≈ 0.707
    expect(cosineSimilarity([1, 1], [1, 0])).toBeCloseTo(0.707, 2);
  });
});
