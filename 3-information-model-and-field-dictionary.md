# 3. Information Model and Field Dictionary

## 3.1 Root entity: AdministrativeProcedure

Minimum required:
- `schemaVersion`
- `generatedAt`
- `serviceId`
- `name`
- `status`
- `owner`
- `workflow`
- `fee`

## 3.2 Workflow model

Workflow required fields:
- `schemaVersion`, `version`, `generatedAt`
- `steps`
- `sourceRaw`, `normalizationConfidence`, `reviewStatus`

Step required fields:
- `stepId` (`^step_[a-z0-9_-]+$`)
- `order` (>=1)
- `label` (non-empty)
- `stepType`
- `confidence`

Step semantics:
- `stepType`: submission, verification, inspection, payment, instruction, approval, decision, notification, delivery, archival, other
- `actor`: citizen, business, administration, mixed, unknown
- `channel`: offline, online, hybrid, unknown

## 3.3 Fee model (merged cost+pricing)

Fee required fields:
- `schemaVersion`, `generatedAt`
- `currency` (MGA)
- `model` (fixed/conditional/range/composite/percentage/unknown)
- `rules`
- `summary`

Rule conditional constraints:
- type=fixed => amount required
- type=range => minAmount and maxAmount required
- type=percentage => percentage required

## 3.4 Documents model

`documentsRequired[]` entries SHOULD include:
- `documentTypeCode`
- `label`
- `requirementLevel` (required/conditional/optional)
- optional `condition`

## 3.5 Business consistency rules (core)

- `status=active` SHOULD imply non-empty workflow.
- `fee.summary.ruleCount` MUST match `len(fee.rules)`.
- monetary values MUST be >= 0.
- if min+max exist, max MUST be >= min.
