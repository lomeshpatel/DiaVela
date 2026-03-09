"""
02_build_embeddings.py
======================
Hands-on exploration of text embeddings and cosine similarity.

Run with:
    uv run scripts/learning/02_build_embeddings.py

Or if you have uv set up with a pyproject.toml:
    uv init (in scripts/ directory)
    uv add sentence-transformers torch numpy
    uv run 02_build_embeddings.py
"""

# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "sentence-transformers>=3.0",
#   "numpy>=1.24",
#   "torch>=2.0",
# ]
# ///

import numpy as np
from sentence_transformers import SentenceTransformer

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def print_section(title: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def main():
    print("Loading embedding model (Xenova/all-MiniLM-L6-v2)...")
    print("This may take a moment to download the first time.\n")

    model = SentenceTransformer("all-MiniLM-L6-v2")

    # ----------------------------------------------------------------
    # 1. Basic embedding shape
    # ----------------------------------------------------------------
    print_section("1. What does an embedding look like?")

    sample_text = "blood glucose is high after breakfast"
    embedding = model.encode(sample_text)

    print(f"Text: '{sample_text}'")
    print(f"Embedding shape: {embedding.shape}")
    print(f"First 10 values: {embedding[:10].round(4)}")
    print(f"Range: [{embedding.min():.4f}, {embedding.max():.4f}]")
    print(f"\n→ Each text becomes a {len(embedding)}-dimensional vector!")

    # ----------------------------------------------------------------
    # 2. Similarity between diabetes-related sentences
    # ----------------------------------------------------------------
    print_section("2. Similarity between related sentences")

    diabetes_sentences = [
        "What is the normal blood glucose range?",
        "What should my blood sugar be?",
        "How do I count carbohydrates for diabetes?",
        "What foods have the most carbs?",
        "When should I take my insulin?",
        "What time should I take my medication?",
        "How do I treat low blood sugar?",
        "What should I do if I feel dizzy and shaky?",
    ]

    embeddings = model.encode(diabetes_sentences)

    print("Sentence pairs and their cosine similarity scores:\n")
    pairs = [
        (0, 1, "Semantically same question (different words)"),
        (2, 3, "Both about carbs/food"),
        (4, 5, "Both about medication timing"),
        (6, 7, "Both about hypoglycemia"),
        (0, 4, "Unrelated diabetes topics"),
        (0, 2, "Both diabetes but different topics"),
    ]

    for i, j, label in pairs:
        sim = cosine_similarity(embeddings[i], embeddings[j])
        bar = "█" * int(sim * 30)
        print(f"  [{sim:.3f}] {bar}")
        print(f"  Q1: {diabetes_sentences[i]}")
        print(f"  Q2: {diabetes_sentences[j]}")
        print(f"  ({label})\n")

    # ----------------------------------------------------------------
    # 3. Retrieval demo: find most relevant knowledge chunk
    # ----------------------------------------------------------------
    print_section("3. Mini RAG: retrieve the most relevant passage")

    knowledge_chunks = [
        {
            "id": 1,
            "text": "Blood glucose targets for most adults: before meals 80-130 mg/dL, after meals less than 180 mg/dL. HbA1c target is below 7%.",
            "source": "blood_glucose_targets"
        },
        {
            "id": 2,
            "text": "HbA1c measures average blood glucose over the past 2-3 months. An HbA1c of 6% corresponds to average blood glucose of about 126 mg/dL.",
            "source": "hba1c_explained"
        },
        {
            "id": 3,
            "text": "Carbohydrate counting: 1 serving = 15 grams of carbs. Most people with diabetes aim for 45-60 grams per meal.",
            "source": "carb_counting"
        },
        {
            "id": 4,
            "text": "Metformin is the first-line medication for type 2 diabetes. It reduces glucose production in the liver and improves insulin sensitivity.",
            "source": "common_medications"
        },
        {
            "id": 5,
            "text": "Exercise lowers blood glucose by making muscles use glucose for energy. Check blood glucose before and after exercise.",
            "source": "exercise_and_diabetes"
        },
        {
            "id": 6,
            "text": "Hypoglycemia occurs when blood glucose falls below 70 mg/dL. Treat with 15g fast-acting carbs (glucose tablets, 4 oz juice) and recheck in 15 minutes.",
            "source": "blood_glucose_targets"
        },
    ]

    queries = [
        "My blood sugar is 55, what should I do?",
        "What is a good HbA1c level?",
        "How many grams of carbs can I eat per meal?",
        "What does metformin do?",
    ]

    chunk_texts = [c["text"] for c in knowledge_chunks]
    chunk_embeddings = model.encode(chunk_texts)

    for query in queries:
        query_embedding = model.encode(query)

        similarities = [
            (cosine_similarity(query_embedding, chunk_emb), chunk)
            for chunk_emb, chunk in zip(chunk_embeddings, knowledge_chunks)
        ]
        similarities.sort(key=lambda x: x[0], reverse=True)

        print(f"Query: \"{query}\"")
        print(f"  Best match (score={similarities[0][0]:.3f}): [{similarities[0][1]['source']}]")
        print(f"  \"{similarities[0][1]['text'][:100]}...\"")

        print(f"  2nd best (score={similarities[1][0]:.3f}): [{similarities[1][1]['source']}]")
        print()

    # ----------------------------------------------------------------
    # 4. The embedding "space" intuition
    # ----------------------------------------------------------------
    print_section("4. Key Takeaways")

    print("""
  ✅ Embeddings convert text → vectors of numbers
  ✅ Similar meanings → similar vectors → high cosine similarity
  ✅ RAG = embed query → find similar vectors → give context to LLM
  ✅ This is exactly how DiaVela's search_diabetes_knowledge tool works!

  Next steps:
  • Run 03_fine_tune_classifier.py to see model fine-tuning
  • Look at lib/rag/embeddings.ts to see the TypeScript equivalent
  • Run 'npx tsx lib/rag/ingest.ts' to build DiaVela's vector store
    """)

if __name__ == "__main__":
    main()
