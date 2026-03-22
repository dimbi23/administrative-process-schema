# 6. Business Rules Catalog (Machine-Testable)

This catalog defines implementation-level business rules beyond JSON Schema structure.

## Rule format

Each rule has:
- **ID**: stable identifier (`BR-xxx`)
- **Level**: MUST / SHOULD
- **Profile**: Internal / Public API / Both
- **Expression**: testable condition
- **Failure action**: block publication, route to review, warning

---

## BR-001 — Active procedure must have executable workflow
- **Level:** MUST
- **Profile:** Public API
- **Expression:** if `status == "active"` then `len(workflow.steps) >= 1`
- **Failure action:** BLOCK publication

## BR-002 — Step order uniqueness
- **Level:** MUST
- **Profile:** Both
- **Expression:** all `workflow.steps[].order` values are unique
- **Failure action:** INVALID record

## BR-003 — Step order monotonicity
- **Level:** MUST
- **Profile:** Both
- **Expression:** `workflow.steps[].order` strictly increasing by sorted sequence
- **Failure action:** INVALID record

## BR-004 — No placeholder labels in public profile
- **Level:** MUST
- **Profile:** Public API
- **Expression:** step labels do not match placeholder patterns (e.g. `Étape sans libellé`)
- **Failure action:** BLOCK publication

## BR-005 — Fee rule count consistency
- **Level:** MUST
- **Profile:** Both
- **Expression:** `fee.summary.ruleCount == len(fee.rules)`
- **Failure action:** INVALID record

## BR-006 — Monetary bounds
- **Level:** MUST
- **Profile:** Both
- **Expression:** all monetary numeric values are `>= 0`
- **Failure action:** INVALID record

## BR-007 — Range coherence
- **Level:** MUST
- **Profile:** Both
- **Expression:** if `minAmount` and `maxAmount` exist, then `maxAmount >= minAmount`
- **Failure action:** INVALID record

## BR-008 — Publishable review status
- **Level:** MUST
- **Profile:** Public API
- **Expression:** `workflow.reviewStatus in {"approved_auto", "review_required"}` according to governance policy
- **Failure action:** BLOCK publication

## BR-009 — Blocking quality flags resolved
- **Level:** MUST
- **Profile:** Public API
- **Expression:** no blocking `qualityFlags` remain unresolved
- **Failure action:** BLOCK publication

## BR-010 — Unknown fee model not publishable with payment step
- **Level:** SHOULD
- **Profile:** Public API
- **Expression:** if any `stepType == "payment"`, `fee.model != "unknown"`
- **Failure action:** WARNING or BLOCK (policy-controlled)
