# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Contract Copilot** — a portfolio-grade, full-stack LLM contract review assistant. MVP is fully built and working end-to-end.

## Tech Stack (implemented)

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite 7 + Tailwind CSS v4 + React Query + React Router |
| Backend | Node.js + TypeScript + Express + Zod + Multer v2 + pdf-parse |
| Database | PostgreSQL + Prisma |
| LLM | Anthropic Claude (claude-haiku-4-5-20251001 by default) via `@anthropic-ai/sdk` |
| Infra | Docker for Postgres DB only; frontend/backend run locally |

## How to Run

**Prerequisites:** Node 20+, Docker Desktop running

```bash
# Start Postgres
docker run -d --name contractdb -p 5432:5432 \
  -e POSTGRES_USER=copilot -e POSTGRES_PASSWORD=copilot \
  -e POSTGRES_DB=contractcopilot postgres:16-alpine

# Terminal 1 — backend (http://localhost:4000)
cd backend
cp .env.example .env   # add ANTHROPIC_API_KEY
npx prisma migrate dev --name init
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Kill stuck ports: `lsof -ti:4000,5173 | xargs kill -9`

## Environment Variables

`backend/.env` requires:
```
DATABASE_URL=postgresql://copilot:copilot@localhost:5432/contractcopilot
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001   # optional, this is the default
PORT=4000
```

## Project Structure

```
frontend/src/
  pages/          # DashboardPage, UploadPage, ReviewPage, HistoryPage
  api/client.ts   # axios instance, proxies /api → localhost:4000

backend/src/
  routes/         # documents.ts (all doc endpoints), feedback.ts
  services/
    parser.ts     # PDF → text → chunks (1500 char, 200 overlap)
    llm.ts        # summary + risk extraction via Claude
    qa.ts         # keyword retrieval + grounded Q&A + citations
    db.ts         # Prisma client singleton
  middleware/
    errorHandler.ts  # consistent { error: string } responses
  index.ts        # Express app entry point

backend/prisma/schema.prisma   # 6-table schema
```

## Key Architectural Decisions

**LLM:** Uses Anthropic Claude (not OpenAI). `llm.ts` and `qa.ts` call `@anthropic-ai/sdk` directly. JSON is extracted via regex from response text, validated with Zod, retried once with repair prompt on failure.

**QA retrieval:** Keyword-based scoring (no embeddings) — terms from the question are matched against chunk content. Top 5 chunks are sent as context. Citations include chunk ID + snippet.

**Feedback model:** Polymorphic — `targetType` + `targetId` fields, no DB-level foreign keys (avoids constraint conflicts with multi-table polymorphism).

**Multer v2:** `req.file.originalname` for filename, `req.file.buffer` for content (not `req.file.filename`).

## API Surface

```
POST /api/documents/upload          # multipart, field: file (PDF only, 20MB max)
GET  /api/documents                 # list with _count.qaHistory
GET  /api/documents/:id
POST /api/documents/:id/analyze     # triggers summary + risk extraction
GET  /api/documents/:id/summary
GET  /api/documents/:id/risks
POST /api/documents/:id/qa          # { question: string } → { answer, citations[] }
POST /api/feedback                  # { targetType, targetId, label, comment? }
```

All errors: `{ error: string }`

## MVP Status

All 9 build-order milestones completed:
- [x] Scaffold + base configs
- [x] Prisma schema + migrations
- [x] Upload + parse + chunk
- [x] Summary extraction
- [x] Risk extraction
- [x] Grounded QA + citations
- [x] History persistence
- [x] Feedback capture
- [ ] Polish + eval artifacts (next)

## MVP Constraints

- PDF only, no DOCX
- No auth or billing
- Desktop-first UI
- Single model (Claude Haiku)
