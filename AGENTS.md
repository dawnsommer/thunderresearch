# AGENTS.md — ThunderResearch App

## Project purpose

This is a **static, client-only GitHub Pages review application** for human verification of AI-extracted Acute Liver Failure research variables. It is not the clinical extractor. It receives structured patient JSONs, lets the researcher compare proposed answers against source-faithful evidence, holds the current workspace in memory only, creates human-approved snapshots, and deterministically generates research CSV output.

## Non-negotiable architecture

1. Keep the app deployable as plain GitHub Pages: HTML/CSS/vanilla JavaScript, no backend required.
2. Do not add server-side storage, cloud databases, authentication services, analytics, telemetry, or LLM/API calls unless the user explicitly changes the architecture.
3. Do not add external CDNs. Vendor any dependency locally only with explicit justification. Prefer no dependencies.
4. Patient data must remain client-side. Never add code that uploads patient JSON/TXT/master CSV/workspace data.
5. Preserve the restrictive Content Security Policy. `connect-src` should remain `none` unless the user explicitly authorizes network functionality.
6. Never commit real patient data, real approved JSON, live workspace backups, source TXT files, or the user's live master research CSV.
7. Use only synthetic fixtures for tests.
8. Preserve the **113-field frozen schema** and its master-column mappings unless the user explicitly supplies a schema revision.
9. Final CSV generation must remain deterministic and must use only approved answers; it must never reinterpret evidence or source text.
10. Approval must remain a deliberate human action. Do not auto-approve patients.

## Current data model

Session-only in-memory state. Refreshing the page or closing the tab clears the workspace. No patient data is written to IndexedDB or another browser database.

Session collections:
- `patients` — editable draft state, keyed by `patient_id`
- `approved` — approved snapshots, keyed by `patient_id`
- `sources` — optional source TXT content, keyed by `source_file`
- `meta` — optional master CSV and session metadata
- `audit` — local edit/approval history

## Input compatibility

The app accepts:
- Legacy/current extraction JSON: `entries[]` with `research_heading`, `proposed_answer`, `verbatim_evidence`
- Preferred V2 extraction JSON: `fields[]`, explicit `status`, structured `evidence[]`

Do not remove legacy compatibility while the extraction projects are being migrated.

## Human review behavior

- Show fixed research heading, editable answer, and evidence together.
- Preserve initial extraction separately from the human-edited answer.
- Status values: `ok`, `review`, `calculated`, `nr`, `na`.
- `[REVIEW]` and `[CALC]` legacy tags are normalized into status metadata and removed from the editable answer.
- Approved patients are read-only until explicitly reopened.
- Reopening removes the approved snapshot until re-approved.

## Approval validation

Must block approval for:
- missing/duplicate/unknown schema fields
- blank answers
- unresolved `review` status
- missing evidence
- Patient ID mismatch

`calculated`, `nr`, and `na` are allowed after human review.

## Final CSV behavior

- Master CSV is optional.
- When loaded, validate expected schema headings/mappings and preserve its rows/structure.
- Refuse duplicate Patient IDs already present in the master.
- Append one row per approved patient using schema mappings.
- Evidence is never written to research cells.
- Without a master, generate a schema-only 113-column CSV.

## UI polishing priorities

Safe areas for improvement:
- responsive/iPad layout
- information density/readability
- keyboard navigation
- source-context viewer
- patient/field filtering
- review progress indicators
- accessibility
- audit-history viewer
- explicit backup/storage UX

Do not sacrifice evidence visibility or approval safeguards for visual minimalism.

## Regression commands

```bash
node tests/test_core.js
node --check js/schema.js
node --check js/core.js
node --check js/idb.js
node --check js/app.js
```

Also follow `docs/TEST_CHECKLIST.md` for browser-level testing.
