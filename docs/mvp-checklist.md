# MVP Checklist (Definition of Done)

Use this checklist to decide whether Contract Copilot is ready for portfolio/demo use.

## A. Project Bootstrap
- [ ] Monorepo structure exists: `frontend/`, `backend/`, `docs/`
- [ ] `docker-compose.yml` starts db + backend + frontend
- [ ] `.env.example` exists for both frontend/backend vars
- [ ] `README.md` has copy-paste setup steps

## B. Database & Schema
- [ ] Prisma schema defines: `documents`, `document_chunks`, `contract_summaries`, `risks`, `qa_history`, `feedback`
- [ ] Required relations and indexes exist
- [ ] Migrations run successfully on clean DB
- [ ] Seed or sample data path is documented

## C. Upload + Parsing (Feature 1 & 2)
- [ ] Upload endpoint accepts PDF and rejects unsupported file types
- [ ] File size validation exists with clear error message
- [ ] Uploaded document metadata is persisted
- [ ] Raw text extraction works on at least 3 sample PDFs
- [ ] Chunking persists `chunkIndex`, `sectionTitle` (if found), content, and metadata
- [ ] Upload API returns parse status + text preview

### Demo check
- [ ] In UI, upload one PDF and show parse preview in under 30s (for small file)

## D. Summary Extraction (Feature 3)
- [ ] `POST /api/documents/:id/analyze` triggers summary generation
- [ ] Summary output is validated with Zod
- [ ] Invalid model JSON triggers one repair retry
- [ ] Summary is stored in DB and retrievable via API
- [ ] UI renders structured summary fields (not plain blob only)

### Demo check
- [ ] Show contract type, parties, effective date, termination, payment terms

## E. Risk Extraction (Feature 4)
- [ ] Risk output is structured (`riskType`, `severity`, `clauseReference`, `explanation`, `suggestedRevision`)
- [ ] Risks are persisted in DB and retrievable via API
- [ ] UI displays severity badges and expandable details
- [ ] Empty-risk fallback state is handled gracefully

### Demo check
- [ ] Show at least 2 extracted risks with clause references

## F. Grounded Q&A (Feature 5)
- [ ] QA endpoint embeds question and retrieves top-k chunks
- [ ] Prompt uses retrieved context only
- [ ] Answer returns `answer + citations[]`
- [ ] Citations include chunk ID and snippet
- [ ] If evidence is insufficient, answer states uncertainty
- [ ] QA interaction is persisted to `qa_history`

### Demo check
- [ ] Ask 3 legal-style questions and show citations for each answer

## G. History (Feature 6)
- [ ] History page lists prior uploaded documents
- [ ] Document detail shows previous summary/risk results
- [ ] QA history is visible by document
- [ ] Timestamps are visible and human-readable

## H. Feedback (Feature 7)
- [ ] Feedback endpoint accepts labels: `helpful`, `not_helpful`, `false_positive`, `acceptable`, `needs_review`
- [ ] Feedback can target summary/risk/qa entities
- [ ] Feedback is persisted and queryable
- [ ] UI supports fast one-click label + optional comment

### Demo check
- [ ] Submit one feedback item per target type and confirm persistence

## I. Reliability & UX Baseline
- [ ] API error responses use consistent JSON error shape
- [ ] Frontend has loading, success, and error states
- [ ] Long-running analyze action has progress indicator
- [ ] No critical runtime errors in default local flow

## J. Evaluation Artifacts (MVP minimal)
- [ ] `docs/eval-set.json` (or csv) exists with sample questions/expected clauses
- [ ] At least 10 QA examples are manually spot-checked
- [ ] Failure cases are documented in README

## K. Final Demo Gate (CV Ready)
- [ ] Fresh setup to running app in <= 10 minutes
- [ ] End-to-end flow (upload -> analyze -> QA -> feedback -> history) in <= 2 minutes on one sample doc
- [ ] At least 3 screenshots are prepared
- [ ] Resume bullets are included in README

