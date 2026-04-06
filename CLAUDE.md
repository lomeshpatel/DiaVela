# DiaVela — AI Diabetes Care Assistant

A conversational diabetes management app with blood glucose tracking, medication reminders, nutrition lookup, and RAG-powered diabetes education.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Webpack), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui, OKLCH color system with dark mode (next-themes)
- **AI**: Vercel AI SDK v6 (`ai`, `@ai-sdk/react`, `@ai-sdk/google`, `@ai-sdk/anthropic`)
- **UI Components**: AI SDK Elements (`components/ai-elements/`) for chat interface
- **Database**: `@libsql/client` / Turso (local `file:` URL in dev, hosted libSQL in production)
- **Embeddings**: Google Text Embedding API (`text-embedding-004`) via `@ai-sdk/google`
- **Charts**: Recharts
- **Testing**: Vitest + @testing-library/react + jsdom

## Commands

```bash
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm typecheck      # TypeScript check (tsc --noEmit)
pnpm test           # Run tests (vitest run)
pnpm test:watch     # Run tests in watch mode
pnpm ingest         # Rebuild knowledge base vectors from data/knowledge/*.txt
```

Always run `pnpm typecheck` and `pnpm test` before committing.

## Project Structure

```
app/
  api/chat/          # POST /api/chat — streaming AI chat with tool calls
  api/glucose/       # GET/POST /api/glucose — blood glucose CRUD
  api/medications/   # GET/POST /api/medications — medication CRUD
  globals.css        # OKLCH color system (light + dark themes)
  layout.tsx         # Root layout with fonts (Fraunces + DM Sans), ThemeProvider

components/
  ai-elements/       # AI SDK Elements: conversation, message, prompt-input, suggestion, tool, code-block
  chat/              # ChatPanel, ChatMessage, ChatToolCall, ToolResultRenderer
  dashboard/         # DashboardPanel, StatsGrid, ReadingsTable, TimeInRangeBar
  ui/                # shadcn/ui primitives
  AppShell.tsx       # Main layout — split panel (dashboard sidebar + chat)
  AppHeader.tsx      # Header with branding and dark mode toggle
  GlucoseChart.tsx   # Recharts line chart for glucose trends
  MedicationCard.tsx # Medication list display

lib/
  tools/             # AI tool definitions: glucose, medication, nutrition (USDA API), knowledge (RAG)
  rag/               # Embedding generation, vector store, ingestion script
  db.ts              # SQLite database setup and queries
  dashboard-context.tsx  # React context for shared dashboard state

data/
  knowledge/         # Source .txt files for diabetes education RAG (tracked in git)
  vectors.json       # Pre-generated embeddings (tracked in git — regenerate with `pnpm ingest` after editing knowledge/*.txt)
  diavela.db*        # SQLite runtime files (not tracked — local dev only)
```

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key + Text Embedding API | (required) |
| `AI_PROVIDER` | `gemini` or `anthropic` | `gemini` |
| `AI_MODEL` | Model ID override | `gemini-2.5-flash` / `claude-sonnet-4-6` |
| `TURSO_DATABASE_URL` | libSQL DB URL (`file:./data/diavela.db` locally, `libsql://...` in prod) | `file:./data/diavela.db` |
| `TURSO_AUTH_TOKEN` | Turso auth token (production only, omit for local `file:` URLs) | (none) |
| `USDA_API_KEY` | USDA FoodData Central API | `DEMO_KEY` |

Copy `.env.local.example` to `.env.local` and fill in your keys.

## Deployment

The app is deployed on **Vercel** with **Turso** as the hosted database.

- **Hosting**: Vercel (auto-deploys from `main` branch)
- **Database**: Turso (hosted libSQL) — same `@libsql/client` driver used locally with `file:` URL
- **CI/CD**: Push to `main` → Vercel builds and deploys automatically
- **Vectors**: `data/vectors.json` is committed to git. Regenerate locally with `pnpm ingest` after editing `data/knowledge/*.txt`, then commit.

## Design System

- Colors use **OKLCH** color space with semantic tokens: `--teal` (primary/glucose), `--amber` (nutrition/medication), `--sage` (healthy/in-range), `--rose-accent` (alerts/out-of-range)
- Each color has `-bg` (surface) and `-vivid` (hover) variants defined in `globals.css`
- Dark mode via `next-themes` with `class` attribute strategy
- Fonts: **Fraunces** (display/headings, `font-display`) + **DM Sans** (body, `font-sans`)
