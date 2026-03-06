# Interview Script & CV Deliverables

This document is optimized for quickly turning the project into resume content and interview narrative.

## 1) Deliverables Checklist (CV-Oriented)
- [ ] Live local demo works end-to-end
- [ ] API collection (Postman or curl examples) prepared
- [ ] 3-5 screenshots captured (upload, review, QA citations, history)
- [ ] Architecture diagram prepared (Mermaid is enough)
- [ ] README contains setup + architecture + endpoint list
- [ ] Evaluation snapshot prepared (basic metrics + failure examples)

## 2) 60-Second Project Pitch
I built an end-to-end full-stack LLM contract review assistant called Contract Copilot.  
Users can upload contract PDFs, automatically generate structured summaries and risk flags, ask grounded questions with clause-level citations, and leave feedback for iterative quality tuning.  
The stack is React + TypeScript on the frontend, Node.js/Express + Prisma/PostgreSQL on the backend, with Anthropic-based structured output and retrieval-augmented QA.

## 3) 3-Minute Interview Walkthrough
1. Problem framing
   - Contract review is slow and high-cognitive-load.
   - Generic chatbots are not enough because answers must be grounded.
2. System design
   - Ingestion pipeline: upload -> parse -> chunk -> persist metadata.
   - Analysis pipeline: summary + risks via schema-validated JSON generation.
   - QA pipeline: question embedding -> top-k retrieval -> grounded answer + citations.
3. Engineering decisions
   - Scoped to MVP for reliable end-to-end delivery.
   - Used strict validation and fallback behavior for invalid LLM outputs.
   - Added feedback capture for measurable iteration loop.
4. Outcome
   - Working full-stack demo with stored history and traceable answers.

## 4) Demo Script (5-7 Minutes)

## Step A: Upload
- Upload one sample PDF contract.
- Show parse success and preview.

## Step B: Analyze
- Trigger analysis and show structured summary fields.
- Open risks panel and explain severity + clause reference.

## Step C: Grounded QA
- Ask 2-3 questions:
  - What are termination conditions?
  - Is there an auto-renewal clause?
  - Does the agreement limit liability?
- Show each answer with chunk citations/snippets.

## Step D: Feedback + History
- Mark one QA answer as helpful/not helpful.
- Go to history page and show persisted records.

## 5) Resume Bullet Templates
Choose 2-4 bullets based on what you actually implemented.

- Built an end-to-end full-stack LLM contract review assistant using React, TypeScript, Node.js, PostgreSQL, Prisma, and Anthropic API.
- Implemented PDF ingestion, chunk-based retrieval QA, structured risk extraction, and persisted review history workflows for legal document analysis.
- Designed schema-validated JSON outputs and citation-grounded answering to improve response consistency and reduce unsupported claims.
- Added user feedback capture and analysis artifacts to support iterative quality improvements and faster prompt tuning cycles.

## 6) Metrics You Can Mention (Only If Measured)
- QA grounding accuracy on internal sample set
- Citation correctness rate
- Summary field completeness
- Top-risk precision on manually reviewed examples
- Repeated-query latency

## 7) Common Interview Questions & Suggested Angles

## Q1: How did you reduce hallucination?
- Retrieval-first prompting
- strict schema validation + retry-repair
- uncertainty response when evidence is insufficient

## Q2: What trade-offs did you make?
- Prioritized PDF-only and single-model path for speed
- deferred advanced reranking/caching until MVP stabilized

## Q3: How would you improve next?
- add docx + version diff
- add eval dashboard and caching layer
- improve legal-domain prompt set with error taxonomy

