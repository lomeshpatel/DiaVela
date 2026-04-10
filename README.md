# DiaVela — Complete User Guide

DiaVela is an AI-powered diabetes care assistant. It lets you log blood glucose readings, look up nutrition information, manage medication reminders, and ask questions about diabetes — all through a simple chat interface.

---

## Table of Contents

1. [What You Need Before Starting](#1-what-you-need-before-starting)
2. [One-Time Setup](#2-one-time-setup)
3. [Starting the App Every Day](#3-starting-the-app-every-day)
4. [Using the App](#4-using-the-app)
5. [The Dashboard](#5-the-dashboard)
6. [Adding Your Own Data](#6-adding-your-own-data)
7. [Stopping the App](#7-stopping-the-app)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. What You Need Before Starting

### Software to Install

You need two programs installed on your computer. If they are already installed, skip to the next section.

**Node.js** (the engine that runs the app)
- Go to https://nodejs.org and download the version marked **LTS** (Long Term Support)
- Run the installer and accept all defaults
- To confirm it worked: open a terminal (see below) and type `node --version` — you should see a number like `v20.x.x`

**pnpm** (a package manager — installs the app's dependencies)
- After Node.js is installed, open a terminal and type:
  ```
  npm install -g pnpm
  ```
- To confirm: type `pnpm --version` — you should see a number like `10.x.x`

**How to open a terminal:**
- **Windows**: Press `Win + R`, type `cmd`, press Enter. Or search "Command Prompt" in the Start menu.
- **Mac**: Press `Cmd + Space`, type "Terminal", press Enter.

---

### API Keys You Need

The app uses external AI services. You need at least one of the following:

#### Option A — Google Gemini (recommended, free tier available)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with a Google account
3. Click **Create API Key**
4. Copy the key (it looks like `AIzaSy...`) — save it somewhere safe

#### Option B — Anthropic Claude
1. Go to https://console.anthropic.com
2. Create an account and add a payment method
3. Go to **API Keys** and click **Create Key**
4. Copy the key (it looks like `sk-ant-...`) — save it somewhere safe

#### USDA Nutrition Data (optional but recommended)
The app can look up real nutrition data for any food. Without this key it uses a demo key that may be rate-limited.
1. Go to https://fdc.nal.usda.gov/api-guide.html
2. Click **Get an API Key** and fill in the short form
3. The key arrives by email within a few minutes

---

## 2. One-Time Setup

Do this only the first time you use the app.

### Step 1 — Open a Terminal and Navigate to the App Folder

```
cd C:\Users\patel\myprojects\ai-playground\diavela
```

> **Tip:** You can also open File Explorer, navigate to that folder, click the address bar at the top, type `cmd`, and press Enter — this opens a terminal already in the right folder.

### Step 2 — Install Dependencies

In the terminal, type:
```
pnpm install
```

Wait for it to finish. You will see a progress bar and then "Done". This only needs to be done once (or after the app's code is updated).

### Step 3 — Create Your Settings File

In the app folder, look for a file called `.env.local`. Open it in any text editor (Notepad works fine).

A template file called `.env.local.example` is included — copy it to `.env.local` and fill in your keys:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key_here
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash

# Database — local dev uses a local SQLite file (no account needed)
TURSO_DATABASE_URL=file:./data/diavela.db

# Optional
USDA_API_KEY=DEMO_KEY
```

**Fill in your keys:**

- Replace `your_gemini_key_here` with your Google API key
- Leave `TURSO_DATABASE_URL=file:./data/diavela.db` as-is for local development — no Turso account needed locally
- If you have a **USDA key**: Replace `DEMO_KEY` with your key

Save the file and close it.

> **Important:** Never share this file with anyone. It contains your private API keys.

---

## 3. Starting the App Every Day

Every time you want to use DiaVela:

**Step 1** — Open a terminal in the app folder (see Step 1 above).

**Step 2** — Type:
```
pnpm dev
```

**Step 3** — Wait about 10–15 seconds. You will see something like:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
- Ready in 2.3s
```

**Step 4** — Open your web browser and go to:
```
http://localhost:3000
```

The app is now running. The terminal must stay open while you use the app — do not close it.

---

## 4. Using the App

### Chat Interface (Main Page)

When you open the app, you will see a chat window. Type your message in the box at the bottom and press **Enter** (or click the send button).

**Things you can say:**

| What you want to do | Example message |
|---|---|
| Log a blood glucose reading | `My blood sugar is 142 mg/dL before dinner` |
| Log with extra context | `Blood sugar 98, fasting this morning` |
| See your recent trends | `Show me my glucose trends for the past 2 weeks` |
| Look up nutrition info | `How many carbs are in a medium banana?` |
| Add a medication reminder | `Add metformin 500mg at 8am with breakfast` |
| See all your medications | `What medications do I have listed?` |
| Ask an education question | `What is HbA1c and what should mine be?` |
| Ask about symptoms | `What should I do if my blood sugar is very low?` |

### Suggested Prompts

On your first visit, six example prompts appear below the chat. Click any of them to send it instantly.

### Tool Badges

When DiaVela uses one of its tools (for example, looking up your glucose history), a small badge appears above its response:

- ✅ Logging glucose reading
- ✅ Fetching glucose trends
- ✅ Looking up nutrition data
- ✅ Adding medication reminder
- ✅ Searching knowledge base

These confirm that the AI used real data from your records or from official databases — not guesses.

### Important Safety Note

DiaVela is for **education and tracking only**. It will always remind you to consult your doctor for medical decisions. It will never tell you to change your insulin dose or prescriptions.

---

## 5. The Dashboard

Click the **Dashboard** link in the top-right corner to see your analytics.

### What's on the Dashboard

**Time Range Buttons** — Switch between the last 7, 14, or 30 days of data.

**Stats Cards** (four boxes at the top):
- **Readings** — How many glucose readings you have logged
- **Average** — Your average blood glucose (highlighted red if outside target)
- **Min / Max** — Your lowest and highest recorded values

**Time in Range** — Shows what percentage of your readings fall within the healthy range of 70–180 mg/dL. The goal set by the American Diabetes Association is above 70%.

**Glucose Trends Chart** — A line graph of all your readings. Three reference lines help you interpret the chart:
- Red line at **70** — below this is low (hypoglycemia)
- Green line at **140** — upper limit of the normal fasting range
- Yellow line at **180** — above this is high (hyperglycemia)

**Medication Reminders** — A list of all medications you have added.

**Recent Readings** — A table of your last 10 glucose readings with timestamps and notes.

---

## 6. Adding Your Own Data

### A — Logging Glucose Readings

The easiest way is through chat:
> `My blood sugar is 115 mg/dL`

You can add context too:
> `Blood sugar 178, two hours after pizza for dinner`

The AI will log it and confirm. It will also tell you whether the reading is in the normal range, slightly elevated, or high.

**Alternatively**, if you want to enter readings directly without going through chat, you can use the API from a browser or tool like Postman:
```
POST http://localhost:3000/api/glucose
Body (JSON): { "value_mgdl": 115, "notes": "fasting" }
```

---

### B — Adding Medication Reminders

Through chat:
> `Add Lisinopril 10mg every morning at 7am`
> `Add Lantus 20 units at bedtime, check blood sugar first`

The AI will confirm the medication has been saved. It will appear on the Dashboard under **Medication Reminders**.

---

### C — Adding to the Knowledge Base (Empirical / Reference Documents)

The knowledge base is what DiaVela searches when you ask educational questions. It currently contains 11 documents covering topics like blood glucose targets, HbA1c, medications, meal planning, and exercise.

**To add your own documents** (for example, notes from your doctor, clinical guidelines, or research summaries):

1. Open the folder:
   ```
   C:\Users\patel\myprojects\ai-playground\diavela\data\knowledge\
   ```

2. Create a new plain text file (`.txt` extension). Name it clearly, for example:
   ```
   my_doctor_notes.txt
   personal_targets.txt
   clinical_guideline_ckd.txt
   ```

3. Write or paste the content into the file. Plain text only — no Word documents, no PDFs. The content can be as long as you like.

4. Save the file and go back to your terminal.

5. Run the ingestion script to rebuild the knowledge base:
   ```
   pnpm ingest
   ```
   You will see output like:
   ```
   Processing: my_doctor_notes.txt
   Generated 4 chunks
   Vector store saved: 50 chunks total
   ```

6. Restart the app (`Ctrl + C` to stop, then `pnpm dev` again).

DiaVela will now search your new document when answering questions.

**Tips for writing good knowledge documents:**
- Write in clear, plain sentences — the same way you would explain something to someone
- One topic per file keeps things organized
- Include specific numbers and targets where relevant (e.g., "Target HbA1c for this patient: 7.0%")
- You can write personal notes: "Patient is on a low-carb diet, aiming for under 30g carbs per day"

**Existing knowledge files for reference:**

| File | What it covers |
|---|---|
| `blood_glucose_targets.txt` | Normal ranges, hypoglycemia, hyperglycemia, the 15-15 rule |
| `carb_counting.txt` | Carb servings, meal targets, high/low carb foods, glycemic index |
| `common_medications.txt` | Metformin, SGLT2 inhibitors, GLP-1 agonists, sulfonylureas |
| `exercise_and_diabetes.txt` | Exercise recommendations, glucose effects, monitoring during exercise |
| `foot_care.txt` | Daily inspection, footwear, warning signs, neuropathy |
| `hba1c_explained.txt` | What HbA1c means, target ranges, conversion to average glucose |
| `insulin_types.txt` | Rapid/short/intermediate/long-acting insulins, storage |
| `meal_planning.txt` | Mediterranean diet, diabetes plate method, foods to emphasize/limit |
| `monitoring_and_cgm.txt` | SMBG vs CGM, major CGM systems, time-in-range targets |
| `sick_day_rules.txt` | What to do when sick, ketone checking, when to call a doctor |
| `type1_vs_type2.txt` | Differences, causes, gestational diabetes, prediabetes |

---

### D — Loading Sample / Historical Data

If you have past glucose readings you want to import (for example, from a glucose meter or another app), you can add them through the API.

#### Option 1 — One at a Time (through the chat)

Just tell DiaVela each reading with the date and time:
> `Log a glucose reading of 132 from yesterday morning, fasting`

#### Option 2 — Bulk Import (for technical users)

If you have a list of readings, you can send them to the app's API. Here is an example using PowerShell on Windows:

```powershell
# Example: import a list of readings
$readings = @(
    @{ value_mgdl = 124; notes = "fasting" },
    @{ value_mgdl = 178; notes = "after lunch" },
    @{ value_mgdl = 98;  notes = "before bed" }
)

foreach ($r in $readings) {
    $body = $r | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:3000/api/glucose" `
                      -Method POST `
                      -ContentType "application/json" `
                      -Body $body
}
```

Or using `curl` in any terminal:
```bash
curl -X POST http://localhost:3000/api/glucose \
  -H "Content-Type: application/json" \
  -d '{"value_mgdl": 124, "notes": "fasting"}'
```

#### Option 3 — Direct Database Entry (advanced)

Locally, the app stores all data in a SQLite file at `data/diavela.db` in the app folder.

You can open this file with a free tool called **DB Browser for SQLite** (https://sqlitebrowser.org) and insert rows directly into the `glucose_readings` or `medications` tables.

**Glucose readings table columns:**

| Column | Type | Description | Example |
|---|---|---|---|
| `value_mgdl` | Number | Blood glucose value | `142` |
| `timestamp` | Text | Date and time (ISO format) | `2025-03-01T08:30:00.000Z` |
| `notes` | Text | Optional context | `fasting` |

**Medications table columns:**

| Column | Type | Description | Example |
|---|---|---|---|
| `name` | Text | Medication name | `Metformin` |
| `dose` | Text | Dosage amount | `500mg` |
| `schedule_time` | Text | When to take it | `8:00 AM with breakfast` |
| `notes` | Text | Optional reminder | `take with food` |

---

## 7. Stopping the App

To stop the app, go to the terminal where `pnpm dev` is running and press:
```
Ctrl + C
```

Your data is automatically saved — nothing is lost when you stop the app.

---

## 8. Troubleshooting

### "Cannot connect" or blank page in browser
- Make sure you ran `pnpm dev` and see the "Ready" message in the terminal
- Make sure you're going to `http://localhost:3000` (not https)
- Try refreshing the page

### Chat says "Sorry, I encountered an error"
- Your API key may be missing or incorrect — check `.env.local`
- Your API key may have expired or run out of credit
- The terminal will show a more detailed error message — look there first

### Nutrition lookup returns no results
- The USDA API has a rate limit on the free `DEMO_KEY`
- Sign up for a free USDA API key (see Section 1) and add it to `.env.local`
- Restart the app after changing `.env.local`

### Knowledge base not finding my new document
- Make sure you ran `pnpm ingest` after adding the file
- Make sure the file has a `.txt` extension
- Make sure the file is in `data/knowledge/` not in a subfolder
- Restart the app after running `pnpm ingest`

### Dashboard shows no data
- You need to log at least one glucose reading first (through chat)
- Readings are stored by date — make sure the time range matches when you logged them

### "pnpm: command not found"
- pnpm was not installed, or the terminal session is old
- Run `npm install -g pnpm` and open a fresh terminal

### Switching Between Gemini and Claude
1. Open `.env.local` in a text editor
2. Change `AI_PROVIDER=gemini` to `AI_PROVIDER=anthropic` (or vice versa)
3. Make sure the matching API key line is filled in
4. Stop the app (`Ctrl + C`) and restart it (`pnpm dev`)
