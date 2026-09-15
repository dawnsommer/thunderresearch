# Patient JSON formats

## Preferred V2 format

Use this format in the future Codex/Claude extraction projects.

```json
{
  "format": "alf-extraction-v2",
  "schema_version": "1.0",
  "patient_id": "ALF-0001",
  "source_file": "ALF-0001.txt",
  "source_sha256": "optional sha256",
  "generated_at": "2026-09-15T00:00:00Z",
  "fields": [
    {
      "research_heading": "Admission date",
      "proposed_answer": "29-Jan-25",
      "status": "ok",
      "evidence": [
        {
          "date": "29-Jan-25",
          "location": "L30-L33",
          "text": "Inpatient Hospitalization Date : 29.01.2025 16:47:18"
        }
      ]
    }
  ]
}
```

There must be exactly 113 fields, once each, in the frozen schema order.

### Status values

- `ok` — high-confidence extraction
- `review` — genuine ambiguity/conflict requiring human adjudication
- `calculated` — derived from supplied clinical values/dates
- `nr` — relevant but not reliably reported
- `na` — genuinely not applicable

Do not use `review` merely because a field is clinically important. It is for genuine ambiguity, conflict, or an assumption the human should adjudicate.

### Evidence

Evidence should be source-faithful and compact. Prefer 1–4 short excerpts rather than whole progress notes.

For a reported value:

```json
{
  "date": "02-Feb-25",
  "location": "L1147-L1153",
  "text": "ENDOTRACHEAL INTUBATION ... Indication:: low GCS ... on AC/VC/475/7/30%"
}
```

For `NR`, a source-status statement is allowed instead of an invented quote:

```json
{
  "location": "source review",
  "text": "No explicit Wilson disease result found in Safe TXT."
}
```

For calculated values, include the inputs and calculation basis in evidence.

## Legacy/current format

Still accepted:

```json
{
  "patient_id": "ALF-0001",
  "source_file": "ALF-0001.txt",
  "entries": [
    {
      "research_heading": "Peak creatinine",
      "proposed_answer": "1.92 [REVIEW]",
      "verbatim_evidence": "29-Jan: Cr 1.92 || 01-Feb narrative: Cr 7.7 || 01-Feb lab: Cr 1.09"
    }
  ]
}
```

The browser normalizes `[REVIEW]` → status `review` and `[CALC]` → status `calculated`.
