# Codex Handoff — ThunderResearch Web App

## What this project is

A zero-cost, static GitHub Pages app for reviewing ALF research extractions. The clinical extraction happens separately in Codex/Claude projects. This app is the **human adjudication layer**.

The user explicitly chose:
- GitHub Pages/static web app instead of localhost/server hosting
- manual patient JSON import
- optional manual master CSV import
- IndexedDB persistence to protect against accidental refresh
- an easy manual command to clear the local browser database
- eventual regeneration of the Codex/Claude extraction projects to emit the preferred JSON format

## Current implementation

### Review
- Multiple patient JSON import
- Strict 113-heading structural validation
- Patient sidebar + pending/approved filters
- All / Needs Review / Calculated / NR-N/A / Edited filters
- Editable proposed answer
- Explicit field status selector
- Original extracted answer shown after human edits
- Evidence immediately below answer
- Optional source TXT import + evidence context viewer/search

### Persistence
- IndexedDB database `ALFReviewDB`
- Drafts auto-save during editing
- Approved snapshot store
- Optional loaded source TXTs persisted
- Optional master CSV persisted
- Audit events persisted
- Workspace backup export/import
- Two-confirmation Clear local database action
- Explicit light/dark theme toggle with local preference persistence

### Approval
- Human-only Approve Patient button
- Blocks blanks, unresolved review status, missing evidence, schema problems, Patient-ID mismatch
- Approved patient becomes read-only
- Explicit Reopen removes approved snapshot

### Output
- Export current patient JSON
- Export all approved patients as one JSON bundle
- Master CSV optional
- If master loaded: deterministic final CSV preserving master structure and schema mapping
- Without master: deterministic 113-column schema-only CSV

### Privacy
- No backend
- No analytics
- No external CDNs
- No fetch/XHR network access (`connect-src 'none'`)
- Patient files are read with browser File API and stored only in IndexedDB unless the user explicitly downloads/export files

## Key files

- `index.html` — application shell and privacy CSP
- `styles.css` — responsive desktop/iPad UI
- `js/schema.js` — frozen 113-field schema/mappings
- `js/core.js` — pure normalization, validation, source-context, CSV parsing/building
- `js/idb.js` — IndexedDB persistence
- `js/app.js` — UI and workflow controller
- `schema/field_schema.csv/json` — canonical schema source
- `tests/test_core.js` — Node regression tests for pure logic
- `AGENTS.md` — persistent Codex rules

## High-value polishing ideas

Do not implement blindly; inspect the app first.

1. Improve iPad portrait/landscape density and sticky navigation.
2. Add keyboard shortcuts: next field, next unresolved field, patient navigation, save/approve.
3. Add an audit-history drawer per field/patient.
4. Add a patient-level review summary screen before approval.
5. Improve source context matching when evidence lacks line numbers.
6. Add an optional "mark field reviewed" affordance only if it genuinely improves workflow; do not make every high-confidence field require a click.
7. Add storage-usage / backup-age visibility.
8. Consider a local ZIP export only if implemented without a CDN and without weakening static deployment simplicity.
9. Improve accessibility/ARIA and large-touch-target behavior.
10. Add browser-level automated tests if a local test dependency is intentionally introduced.

## Known boundaries

- IndexedDB survives refresh/reopen but can theoretically be evicted by browser storage policy; workspace export is the durable backup.
- No multi-user synchronization; intentionally single-browser/local state.
- No backend means approvals are local until exported.
- Source TXT matching expects JSON `source_file` to match the imported TXT filename.
- There is no XLSX export in V1; JSON and CSV are the canonical interchange/output formats.

## Before changing anything

1. Read `AGENTS.md`.
2. Read `README.md` and `docs/JSON_FORMAT.md`.
3. Run all regression commands.
4. Use only synthetic fixtures.
5. Do not change the 113-field schema or clinical semantics as part of UI polishing.
