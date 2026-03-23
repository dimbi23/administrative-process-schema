# invalid-explained.json — Annotation

This file documents the intended violations in `invalid-explained.json`. The payload itself is structurally valid (passes JSON Schema validation) but fails Public API profile business rules.

## Expected failures

### BR-004 — Placeholder label in public profile
- **Field:** `workflow.steps[0].label`
- **Value:** `"Étape sans libellé (1)"`
- **Why it fails:** Step labels matching placeholder patterns are not allowed in the Public API Profile.
- **How to fix:** Replace with a meaningful label describing the actual step.

### BR-008 — Review status not publishable
- **Field:** `workflow.reviewStatus`
- **Value:** `"manual_required"`
- **Why it fails:** Only `approved_auto` is accepted for Public API publication. `manual_required` indicates the record has not been reviewed.
- **How to fix:** Complete the review process and set `reviewStatus` to `approved_auto`.

### BR-005 — Fee rule count mismatch
- **Field:** `fee.summary.ruleCount`
- **Value:** `2`
- **Actual rule count:** `1` (one entry in `fee.rules`)
- **Why it fails:** `fee.summary.ruleCount` MUST equal the number of items in `fee.rules`.
- **How to fix:** Set `ruleCount` to `1` or add a second rule to `fee.rules`.

## Profile behavior

| Profile | Outcome |
|---|---|
| Internal | VALID — `manual_required` states and quality flags are permitted |
| Public API | BLOCKED — BR-004, BR-008, BR-005 all fail |
