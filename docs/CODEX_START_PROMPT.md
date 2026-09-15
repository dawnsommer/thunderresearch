# Prompt for ChatGPT Codex

You are continuing development of the local project **ThunderResearch**.

First read, in this order:

1. `AGENTS.md`
2. `README.md`
3. `docs/HANDOFF_CODEX.md`
4. `docs/JSON_FORMAT.md`
5. `docs/TEST_CHECKLIST.md`

Then inspect the existing application and run the regression tests before editing anything.

This is already a functioning architecture. Do **not** replace it with React, a backend, cloud storage, external APIs, or a different framework. The user wants a simple zero-cost GitHub Pages application using local patient JSON files and IndexedDB.

Your role is to polish and improve the current app while preserving:

- 113-field schema compatibility
- legacy + V2 JSON import compatibility
- client-only patient data handling
- IndexedDB refresh-safe persistence
- manual clear-database control
- optional master CSV
- evidence-first human review
- strict human approval validation
- deterministic final CSV generation
- no network upload/API/analytics/CDN

Use only synthetic fixtures for tests. Never place real patient data in the repository.

Start by giving me a concise assessment of the current UI/architecture and the highest-value polish changes you recommend. Do not make large structural changes until you have inspected the current implementation.
