# Contract Copilot

An end-to-end full-stack LLM contract review assistant. Upload a PDF contract to get a structured summary, risk extraction, grounded Q&A with citations, and a feedback loop for quality tuning.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + React Query
- **Backend**: Node.js + TypeScript + Express + Prisma + Zod
- **Database**: PostgreSQL
- **LLM**: Anthropic API (claude-haiku-4-5 as default), JSON schema outputs with Zod validation

## Quick Start (Docker)

```bash
# 1. Clone and enter project
git clone <repo-url> && cd contract-copilot

# 2. Set your Anthropic key
cp .env.example .env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env

# 3. Start everything
docker-compose up --build
```

Open http://localhost:5173

## Local Development (no Docker)

**Prerequisites**: Node 20+, PostgreSQL running locally

```bash
# Backend
cd backend
cp .env.example .env        # fill in DATABASE_URL and ANTHROPIC_API_KEY
npm install
npx prisma migrate dev
npm run dev                  # http://localhost:4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

## Architecture

```
┌─────────────┐      HTTP/REST      ┌──────────────────────┐
│   React UI  │ ──────────────────► │  Express API         │
│  (Vite 5)   │                     │  /api/documents      │
└─────────────┘                     │  /api/feedback       │
                                    └──────────┬───────────┘
                                               │ Prisma ORM
                                    ┌──────────▼───────────┐
                                    │     PostgreSQL        │
                                    │  documents            │
                                    │  document_chunks      │
                                    │  contract_summaries   │
                                    │  risks                │
                                    │  qa_history           │
                                    │  feedback             │
                                    └───────────────────────┘
                                               │ Anthropic API
                                    ┌──────────▼───────────┐
                                    │  LLM Services         │
                                    │  summary extraction   │
                                    │  risk extraction      │
                                    │  grounded QA          │
                                    └───────────────────────┘
```

**Ingestion pipeline**: PDF upload → pdf-parse → text chunking (1500 char chunks, 200 overlap) → PostgreSQL

**Analysis pipeline**: Full text -> Anthropic -> Zod-validated JSON -> DB. On invalid JSON, one repair retry before fallback.

**QA pipeline**: Question → keyword-based top-k chunk retrieval → grounded prompt → answer + citations[]

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/documents/upload` | Upload a PDF (multipart/form-data, field: `file`) |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/:id` | Get document metadata |
| POST | `/api/documents/:id/analyze` | Trigger summary + risk extraction |
| GET | `/api/documents/:id/summary` | Get structured summary |
| GET | `/api/documents/:id/risks` | Get extracted risks |
| POST | `/api/documents/:id/qa` | Ask a grounded question `{ question: string }` |
| POST | `/api/feedback` | Submit feedback `{ targetType, targetId, label, comment? }` |

All error responses: `{ error: string }`

## Known Limitations

- **PDF only** — DOCX not supported (deferred post-MVP)
- **Keyword retrieval, no embeddings** — top-k chunk selection works well for direct clause queries; degrades on paraphrase-heavy questions
- **Synchronous analysis** — `POST /analyze` blocks until LLM responds; large contracts may time out (no job queue)
- **No authentication** — single-user, local-only; no session isolation
- **Single model** — Claude Haiku only; no reranking or multi-model orchestration

## Screenshots

See [`docs/screenshots/`](docs/screenshots/) for UI captures: upload, summary/risks panel, grounded QA with citations, history page.

## Evaluation Sample

[`docs/eval-set.json`](docs/eval-set.json) contains sample questions with expected answer summaries and clause references for manual spot-checking.
