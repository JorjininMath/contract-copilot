# First-Round Prompt for Cursor / Claude Code

Copy-paste the prompt below as your first instruction to the coding agent.

```md
You are building this project from `spec.md` in the current workspace.

Goal:
- Deliver a portfolio-quality, CV-ready MVP fast.
- Prioritize end-to-end working flow over advanced architecture.

Execution rules:
1. Implement MVP only. Do NOT build stretch features now.
2. Follow build order in `spec.md` strictly:
   - scaffold frontend/backend
   - DB schema
   - upload + parse + chunk
   - summary
   - risk extraction
   - grounded QA retrieval
   - history
   - feedback
   - polish
3. Start by generating project structure and base configs first.
4. After each milestone, run minimal validation and report:
   - what works
   - what remains
   - exact commands to test locally
5. Keep code modular and interview-friendly:
   - no giant files
   - clear service/controller separation
   - Zod validation for external input and LLM output
6. For LLM outputs:
   - structured JSON only
   - retry once on invalid output with repair prompt
   - controlled fallback if still invalid
7. Grounded QA must cite chunk IDs/sections and avoid unsupported claims.
8. Create/update:
   - `.env.example`
   - use `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` consistently (no `OPENAI_*` vars)
   - `README.md`
   - `docs/eval-set.json` (minimal)
9. Leave TODO comments only for post-MVP stretch items.
10. Do not overengineer and do not add auth/billing.

Deliverables required before stopping:
- Running frontend + backend + database
- Upload -> Analyze -> QA -> Feedback -> History full demo path
- README with setup, architecture, API endpoints, and resume-ready bullets
```

## Suggested follow-up prompt after scaffold is done

```md
Continue with Milestone 2 and Milestone 3 only:
- upload + parse + chunk
- summary + risk extraction

Constraints:
- support PDF only for now
- ensure DB persistence works
- include API examples
- add UI states for loading/error/success

When finished, provide:
1) files changed
2) commands to run
3) a 2-minute demo script for current progress
```

