# Project Spec (CV-Fast MVP): Contract Copilot

## 1) Project Goal
Build a portfolio-grade full-stack LLM product for contract review that is:
- end-to-end runnable locally
- demo-ready for recruiter/hiring manager conversation
- realistic enough to discuss architecture and trade-offs

Primary target is **speed to credible MVP**, not enterprise completeness.

---

## 2) MVP Scope (Strict)
This first version includes only:
1. PDF upload and parsing
2. Contract chunking and metadata persistence
3. Structured summary (JSON)
4. Structured risk extraction (JSON list)
5. Grounded Q&A with citations
6. Review history persistence
7. Feedback capture

### Explicitly Deferred (Post-MVP)
- DOCX support
- version comparison
- advanced caching/reuse strategies
- admin analytics dashboard
- reranking and multi-model orchestration
- authentication/permissions

---

## 3) Product Workflow
1. User uploads one PDF contract
2. Backend parses raw text, cleans noise, chunks content
3. System stores document + chunks in PostgreSQL
4. User triggers analysis
5. Backend runs summary + risk extraction
6. User opens review page and asks questions
7. Retrieval selects top-k chunks
8. LLM returns grounded answer + citations
9. User gives feedback on summary/risk/QA
10. System stores all artifacts for history

---

## 4) Technical Decisions (MVP-First)

### Frontend
- React + TypeScript + Vite + Tailwind
- React Query for API state
- Zustand (or Context API if simpler)

### Backend
- Node.js + TypeScript + Express
- Zod for request/response validation
- Multer for upload
- PDF parser library (`pdf-parse` or equivalent)

### Database
- PostgreSQL + Prisma
- Use `pgvector` if quick to set up; otherwise fallback to simple in-app similarity baseline for MVP demo

### LLM
- Anthropic API, **single model strategy** for summary/risk/qa
- JSON schema constrained outputs (validated by Zod)
- one retry with repair prompt on invalid JSON

### Infra
- Docker Compose for one-command local start
- `.env` + `.env.example`

---

## 5) Data Model (MVP)
Required tables:
- `documents`
- `document_chunks`
- `contract_summaries`
- `risks`
- `qa_history`
- `feedback`

Each table should include timestamps and foreign keys with clear cascade rules.

---

## 6) API Surface (MVP)
- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/:id`
- `POST /api/documents/:id/analyze`
- `GET /api/documents/:id/summary`
- `GET /api/documents/:id/risks`
- `POST /api/documents/:id/qa`
- `POST /api/feedback`

All endpoints must return typed JSON with consistent error format.

---

## 7) Frontend Pages (MVP)
- Dashboard page: document list + analysis status
- Upload page: drag/drop, validation, upload progress
- Review page: chunks + summary/risks + Q&A + feedback
- History page: prior documents, QA logs, feedback records

Desktop-first UI is enough.

---

## 8) Definition of Done (High-Level)
MVP is done when:
1. One command starts frontend/backend/db
2. A PDF can be uploaded and parsed successfully
3. Summary and risks are generated and displayed
4. QA answers include citations to chunk IDs/sections
5. History and feedback are queryable in UI
6. README enables a reviewer to run and demo in under 10 minutes

Detailed DoD checklist lives in `docs/mvp-checklist.md`.

---

## 9) 2-Week Delivery Milestones

### Week 1
- M1: monorepo scaffold + DB schema + Docker Compose
- M2: upload + parse + chunk + persistence
- M3: summary + risk extraction APIs + UI integration

### Week 2
- M4: grounded QA retrieval + citation rendering
- M5: history + feedback persistence and UI
- M6: polish (error states, loading states, README, screenshots, eval sample)

---

## 10) Non-Goals
Do not optimize for:
- legal-grade correctness guarantees
- compliance infrastructure
- complex auth or billing
- enterprise observability stack

---

## 11) Resume-Oriented Acceptance
Project must support credible bullets such as:
- Built an end-to-end full-stack LLM contract review assistant with React, TypeScript, Node.js, PostgreSQL, and Anthropic API.
- Implemented PDF ingestion, chunk-based retrieval QA, structured risk extraction, and review history workflows.
- Added schema-validated LLM outputs and citation grounding to reduce unsupported answers.
- Designed feedback loop artifacts for iterative quality improvement.

---

## 12) Required Artifacts
- runnable frontend demo
- backend APIs
- screenshots (`docs/screenshots/` placeholders acceptable initially)
- architecture diagram (Mermaid acceptable)
- README with setup + architecture + API docs
- minimal evaluation file (`docs/eval-set.json` or CSV)
- short interview demo script

---

## 13) Build Order
1. scaffold frontend/backend
2. prisma schema + migrations
3. upload + parse + chunk
4. summary
5. risk extraction
6. QA retrieval + citations
7. history persistence
8. feedback capture
9. polish + eval artifacts

