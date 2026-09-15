# Regression checklist

## Automated/core

```bash
node tests/test_core.js
node --check js/schema.js
node --check js/core.js
node --check js/idb.js
node --check js/app.js
```

## Fresh app

- Open site with a fresh browser session.
- Empty-state import button works.
- No console errors.
- Status bar reports session-only memory and refresh-clears-data behavior.
- Master CSV shows not loaded.

## Patient import

- Import synthetic `patient_v1.json`.
- Import synthetic `patient_v2.json`.
- Each patient contains 113 fields.
- Legacy `[REVIEW]` becomes clean answer + REVIEW status.
- Duplicate patient import asks before replacement.
- Unknown/missing/duplicate schema headings are rejected.

## Session lifecycle

- Edit an answer.
- Refresh page.
- Imported patients, edits, statuses, and loaded sources are cleared.
- Explicit workspace export produces a downloadable JSON file.
- Explicit workspace import restores data into the current session only.

## Review filters

- Needs Review filter shows review fields only.
- Calculated filter works.
- NR/N/A filter works.
- Edited filter shows changed answers.
- Revert restores initial extraction.
- Next unresolved focuses the next REVIEW field and updates the visible filter.
- Mark all REVIEW as OK requires confirmation, changes statuses only, and does not auto-approve.
- Previous/next patient navigation selects the expected patient.
- Alt+Down and Alt+Shift+Down keyboard navigation works outside editable controls.

## Sources

- Import matching synthetic TXT.
- Open source button activates.
- View context near `L120-L122` highlights expected line.
- Source search locates text.
- Refresh preserves loaded source TXT.

## Approval

- Approval is blocked while REVIEW remains.
- Approval is blocked on blank answer.
- Approval is blocked if evidence missing.
- After resolving issues, approval succeeds.
- Approved patient becomes read-only.
- Reopen returns it to editable pending state and removes approved snapshot.

## Workspace export/import

- Export workspace.
- Workspace export status updates during the current session.
- Audit history shows local import/edit/status/approval events for the selected patient.
- Clear current session.
- Confirm app becomes empty.
- Import workspace backup.
- Patients, approvals, source TXT, master CSV and audit state are restored for the current session.

## Master CSV

- Load `tests/fixtures/master.csv`.
- Invalid/nonmatching CSV is rejected.
- Master clears after refresh.
- Generate research CSV with approved patients.
- Existing synthetic row is preserved.
- Approved patient rows are appended.
- Output has 131 columns.
- Duplicate Patient ID already in master blocks generation.

## No-master CSV

- Remove/clear master by clearing database or fresh session.
- With approved patients, Generate research CSV offers schema-only output.
- Output has 113 headings in canonical order.

## Privacy/network

- DevTools Network: importing/editing patient files causes no outbound requests.
- No analytics/telemetry/CDN calls.
- Real patient files are never committed to repository.

## Responsive/iPad

- Desktop layout usable at ≥ 1200 px.
- iPad landscape usable around 1024 px.
- iPad portrait/mobile layout does not horizontally overflow field cards.
- Inputs/buttons have practical touch targets.
