"""
03_fine_tune_classifier.py
===========================
Fine-tune DistilBERT to classify diabetes questions into categories:
  - glucose    (questions about blood sugar levels)
  - diet       (questions about food, carbs, nutrition)
  - medication (questions about drugs, insulin, pills)
  - general    (general diabetes education questions)

This demonstrates what "fine-tuning" means — adapting a pre-trained model
to a specific task with a small labeled dataset.

Run with:
    uv run scripts/learning/03_fine_tune_classifier.py

Dependencies (auto-installed by uv via inline script metadata):
"""

# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "transformers>=4.40",
#   "torch>=2.0",
#   "datasets>=2.20",
#   "scikit-learn>=1.3",
#   "numpy>=1.24",
# ]
# ///

import numpy as np
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
)
from sklearn.metrics import classification_report, accuracy_score

# ----------------------------------------------------------------
# 1. Dataset: labeled diabetes questions
# ----------------------------------------------------------------

LABELS = ["glucose", "diet", "medication", "general"]
LABEL2ID = {l: i for i, l in enumerate(LABELS)}
ID2LABEL = {i: l for i, l in enumerate(LABELS)}

TRAINING_DATA = [
    # glucose
    ("What is a normal blood sugar level?", "glucose"),
    ("My glucose is 200 mg/dL, is that bad?", "glucose"),
    ("How do I treat low blood sugar?", "glucose"),
    ("What should my fasting glucose be?", "glucose"),
    ("My blood sugar is 55, what should I do?", "glucose"),
    ("What causes blood sugar to spike?", "glucose"),
    ("How often should I check my glucose?", "glucose"),
    ("What is hyperglycemia?", "glucose"),
    ("What is hypoglycemia?", "glucose"),
    ("My CGM shows 350 mg/dL, should I be worried?", "glucose"),
    ("What does time in range mean?", "glucose"),
    ("How do I lower high blood sugar quickly?", "glucose"),

    # diet
    ("How many carbs should I eat per meal?", "diet"),
    ("What foods are good for diabetics?", "diet"),
    ("Can I eat fruit with diabetes?", "diet"),
    ("How many calories are in oatmeal?", "diet"),
    ("What is the glycemic index?", "diet"),
    ("Is brown rice better than white rice for diabetes?", "diet"),
    ("What is carb counting?", "diet"),
    ("Can I drink alcohol with diabetes?", "diet"),
    ("What snacks are safe for diabetics?", "diet"),
    ("Is the keto diet good for diabetes?", "diet"),
    ("How much sugar is in an apple?", "diet"),
    ("What vegetables are low glycemic?", "diet"),

    # medication
    ("What does metformin do?", "medication"),
    ("When should I take my insulin?", "medication"),
    ("What are the side effects of Jardiance?", "medication"),
    ("How do I store insulin?", "medication"),
    ("What is the difference between rapid and long-acting insulin?", "medication"),
    ("Can I take ibuprofen with metformin?", "medication"),
    ("What is Ozempic used for?", "medication"),
    ("How does a GLP-1 agonist work?", "medication"),
    ("I missed my metformin dose, what should I do?", "medication"),
    ("What is the maximum dose of metformin?", "medication"),
    ("Do I need to refrigerate Ozempic?", "medication"),
    ("What is a sulfonylurea?", "medication"),

    # general
    ("What is the difference between type 1 and type 2 diabetes?", "general"),
    ("What is HbA1c?", "general"),
    ("How is diabetes diagnosed?", "general"),
    ("Can diabetes be reversed?", "general"),
    ("What complications can diabetes cause?", "general"),
    ("How does exercise affect diabetes?", "general"),
    ("What is insulin resistance?", "general"),
    ("Can children get type 2 diabetes?", "general"),
    ("What is a continuous glucose monitor?", "general"),
    ("What is gestational diabetes?", "general"),
    ("How does stress affect blood sugar?", "general"),
    ("What is diabetic neuropathy?", "general"),
]

TEST_DATA = [
    ("My blood glucose is 380, what do I do?", "glucose"),
    ("Is pasta bad for diabetics?", "diet"),
    ("What does Ozempic do for blood sugar?", "medication"),
    ("What is the A1c test?", "general"),
    ("How do I adjust my insulin for exercise?", "medication"),
    ("What are symptoms of low blood sugar?", "glucose"),
    ("Can I eat pizza?", "diet"),
    ("What is prediabetes?", "general"),
]


def prepare_dataset(data):
    return Dataset.from_dict({
        "text": [d[0] for d in data],
        "label": [LABEL2ID[d[1]] for d in data],
    })


def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def main():
    MODEL_NAME = "distilbert-base-uncased"

    print_section("1. Loading model and tokenizer")
    print(f"Base model: {MODEL_NAME}")
    print("This is DistilBERT — a small (66M parameter) BERT variant.")
    print("We'll add a classification head and fine-tune it.\n")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(LABELS),
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")

    print_section("2. Preparing dataset")
    print(f"Training examples: {len(TRAINING_DATA)}")
    print(f"Test examples: {len(TEST_DATA)}")
    print(f"Labels: {LABELS}\n")

    # Count per class
    from collections import Counter
    label_counts = Counter(d[1] for d in TRAINING_DATA)
    for label, count in sorted(label_counts.items()):
        print(f"  {label:12s}: {count} examples")

    train_dataset = prepare_dataset(TRAINING_DATA)
    test_dataset = prepare_dataset(TEST_DATA)

    def tokenize(examples):
        return tokenizer(examples["text"], truncation=True, max_length=128)

    train_tokenized = train_dataset.map(tokenize, batched=True)
    test_tokenized = test_dataset.map(tokenize, batched=True)

    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

    print_section("3. Fine-tuning")
    print("Training for 5 epochs with a small learning rate...")
    print("Fine-tuning only adjusts model weights slightly — it doesn't")
    print("train from scratch. The model already 'understands' English.\n")

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=-1)
        acc = accuracy_score(labels, predictions)
        return {"accuracy": acc}

    training_args = TrainingArguments(
        output_dir="./scripts/learning/model_output",
        num_train_epochs=5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        learning_rate=2e-5,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="no",
        load_best_model_at_end=False,
        logging_steps=10,
        report_to="none",
        no_cuda=False,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tokenized,
        eval_dataset=test_tokenized,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    trainer.train()

    print_section("4. Evaluation")

    predictions_output = trainer.predict(test_tokenized)
    pred_labels = np.argmax(predictions_output.predictions, axis=-1)
    true_labels = [LABEL2ID[d[1]] for d in TEST_DATA]

    print(classification_report(
        true_labels, pred_labels,
        target_names=LABELS,
        zero_division=0
    ))

    print_section("5. Making predictions on new questions")

    new_questions = [
        "Should I eat before checking blood sugar?",
        "What are the long-term effects of high blood sugar?",
        "Can I take Tylenol with my diabetes medications?",
        "How does fiber affect blood glucose?",
    ]

    for question in new_questions:
        inputs = tokenizer(question, return_tensors="pt", truncation=True, max_length=128)
        import torch
        with torch.no_grad():
            logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0].tolist()
        pred_label = LABELS[int(torch.argmax(logits))]

        print(f"Q: {question}")
        print(f"   → Predicted category: {pred_label.upper()}")
        for label, prob in zip(LABELS, probs):
            bar = "█" * int(prob * 20)
            print(f"   {label:12s}: {prob:.3f} {bar}")
        print()

    print_section("6. Key Concepts Learned")
    print("""
  ✅ Fine-tuning = taking a pre-trained model + training on your task
  ✅ The model keeps its general language understanding
  ✅ Only a small dataset needed (48 examples here!)
  ✅ Classification head maps embeddings → category scores (logits)
  ✅ Softmax converts logits → probabilities that sum to 1

  How this connects to DiaVela:
  • DiaVela's agent uses Claude (a much larger model) for generation
  • This classifier could route questions to the right tool automatically
  • In production, you'd fine-tune on thousands of labeled examples
  • RAG (what DiaVela uses) is often better than fine-tuning for knowledge tasks
    """)


if __name__ == "__main__":
    main()
