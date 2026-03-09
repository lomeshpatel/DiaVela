# What is RAG? (Retrieval-Augmented Generation)

## The Problem RAG Solves

Large Language Models (LLMs) like Claude are trained on massive datasets — but they have limitations:

1. **Knowledge cutoff**: They don't know about recent events
2. **No domain-specific knowledge**: A general LLM doesn't know *your* specific medical records
3. **Hallucination**: They may confidently state incorrect facts
4. **Context window limits**: You can't fit an entire library into one prompt

**RAG solves this** by giving the LLM access to an external knowledge base at query time.

---

## How RAG Works (Step by Step)

```
User Question
      │
      ▼
 ┌─────────────┐
 │  Embedding  │  ← Convert question to a vector (list of numbers)
 │   Model     │
 └─────────────┘
      │
      ▼
 ┌─────────────┐
 │   Vector    │  ← Search for similar vectors in your knowledge base
 │   Store     │     (cosine similarity)
 └─────────────┘
      │
      ▼
 Top-K relevant chunks of text
      │
      ▼
 ┌─────────────────────────────────────────────┐
 │  LLM Prompt = "Using this context:          │
 │  [retrieved chunks] answer: [question]"     │
 └─────────────────────────────────────────────┘
      │
      ▼
 Grounded, accurate answer
```

---

## What are Embeddings?

An **embedding** is a dense vector (list of floating-point numbers) that captures the *meaning* of text.

```python
"blood sugar is too high" → [0.23, -0.45, 0.12, 0.67, ...]  # 384 numbers
"hyperglycemia symptoms"  → [0.21, -0.42, 0.14, 0.65, ...]  # similar!
"basketball game score"   → [-0.31, 0.22, -0.45, 0.11, ...]  # very different
```

Key insight: **Semantically similar text → geometrically close vectors**

---

## Cosine Similarity

To measure how similar two vectors are, we use cosine similarity:

```
similarity = (A · B) / (|A| × |B|)
```

- Returns a value between -1 and 1
- 1.0 = identical meaning
- 0.0 = unrelated
- -1.0 = opposite meaning

For sentence embeddings, scores above 0.7 are usually very similar.

---

## DiaVela's RAG Architecture

```
data/knowledge/*.txt          (10 diabetes guideline docs)
         │
         ▼
lib/rag/ingest.ts             (split into chunks, embed each chunk)
         │
         ▼
data/vectors.json             (JSON: [{id, text, source, embedding: [384 numbers]}])
         │
         ▼
lib/rag/embeddings.ts         (at query time: embed question → cosine search)
         │
         ▼
lib/tools/knowledgeTools.ts   (returns top-3 chunks as context to Claude)
         │
         ▼
Claude (claude-sonnet-4-6)    (generates answer grounded in retrieved context)
```

**Model used**: `Xenova/all-MiniLM-L6-v2` — a fast, 22M parameter model that generates 384-dimensional embeddings. Runs locally in Node.js via `@huggingface/transformers`.

---

## Why Not Just Train a Model?

| Approach | Time | Cost | Requires | Best For |
|----------|------|------|----------|----------|
| RAG | Hours | Low | Storage + API | Always-current knowledge |
| Fine-tuning | Days | Medium | Labeled data | Style/format adaptation |
| Train from scratch | Months | Enormous | Massive compute + data | Research |

**For medical AI**: RAG is almost always the right answer. It lets you cite sources, update knowledge without retraining, and keep the powerful reasoning of frontier models.

---

## Hands-On

Run `02_build_embeddings.py` to see embeddings and similarity in action!
