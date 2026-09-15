# ThunderResearch — Static GitHub Pages App

A browser-only review interface for Acute Liver Failure research abstraction.

## Design

The GitHub repository contains **only application code and the frozen 113-field schema**. Patient JSON/TXT files and the research master CSV are selected manually from the user's device and are never uploaded by the app.

- Plain HTML + CSS + JavaScript
- No backend
- No API calls
- No analytics
- No CDN dependencies
- `connect-src 'none'` Content Security Policy
- IndexedDB persistence across refresh/reopen
- Explicit light/dark theme toggle with local preference persistence
- Manual **Clear local database** command
- Optional source TXT loading for context review
- Optional master CSV loading for exact final-sheet compilation

## Review workflow

1. Open the hosted GitHub Pages app.
2. **Import patient JSONs** (one or many).
3. Optionally **Import source TXTs**. The app matches each patient's `source_file`.
4. Review the proposed answer beside its evidence.
5. Resolve every field with status `REVIEW`; edit answers as needed.
6. Press **Approve patient**. Approval requires:
   - all 113 schema fields
   - no blank answers
   - no unresolved `REVIEW` fields
   - evidence for every field
   - Patient ID field matching `patient_id`
7. Optionally load the current research master CSV.
8. Use **More → Generate research CSV**.
   - With a master CSV: preserves the master structure and appends approved patient rows deterministically.
   - Without a master CSV: generates a schema-only 113-column CSV.

## Refresh-safe storage

The app stores drafts, approved snapshots, source TXTs, optional master CSV, and audit history in browser IndexedDB (`ALFReviewDB`). A normal refresh or browser restart should not lose the working state.

IndexedDB is local browser storage, not a formal backup. Use **More → Export workspace backup** periodically. The exported workspace can be restored with **Import workspace backup**.

To remove all local research data from the browser, use **More → Clear local database**. It requires two confirmations.

## Input JSON

The app accepts both:

- Legacy/current format: `entries[]` with `research_heading`, `proposed_answer`, `verbatim_evidence`
- Preferred V2 format: `fields[]` with structured `status` and `evidence[]`

See [`docs/JSON_FORMAT.md`](docs/JSON_FORMAT.md).

## GitHub Pages deployment

The repository can be published directly from the root directory. No build step is required.

1. Create a GitHub repository.
2. Copy the contents of this folder into it.
3. Commit/push.
4. GitHub repository → **Settings → Pages**.
5. Deploy from the desired branch/root.
6. Open the resulting Pages URL.

Do **not** commit patient JSONs, TXT files, workspace backups, approved exports, or the live research master CSV.

## Testing

Run:

```bash
node tests/test_core.js
node --check js/schema.js
node --check js/core.js
node --check js/idb.js
node --check js/app.js
```

For a manual browser test, host the folder locally:

```bash
python3 -m http.server 8000
```

and open `http://localhost:8000`.

Synthetic fixtures in `tests/fixtures/` contain no real patient data.

## Codex handoff

This repository is prepared for further UI/UX polishing in ChatGPT Codex:

- `AGENTS.md` — persistent repository rules
- `docs/HANDOFF_CODEX.md` — architecture/current-state handoff
- `docs/CODEX_START_PROMPT.md` — ready-to-paste initial Codex prompt
- `docs/TEST_CHECKLIST.md` — regression checklist

Read those before making structural changes.
