# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and the project follows Semantic Versioning.

## [2.0.0-draft.3] - 2026-03-23

### Added
- **Satellite schema architecture (Option B)**: two new normative schemas linked to the catalog by `serviceId`:
  - `schema/form-definition.schema.json` — citizen form field definitions for dynamic form generation (field types, validation, conditional display logic, file constraints, document and step mapping)
  - `schema/execution-mapping.schema.json` — per-step n8n execution mapping (action vocabulary, connector, input/output mapping, retry policy, human task, onFailure)
- **`1-architecture-and-scope.md`**: expanded to 5-layer model (normalization, design-time, form-time, run-time, publication); new §1.5 documents the satellite architecture, Option B decision, and `serviceId` linking contract; full pipeline diagram in §1.4
- **`2-conformance-and-governance.md`**: two new conformance profiles — Form Profile and Execution Profile — with their respective conformance requirements; satellite versioning policy added to §2.5
- **`3-information-model-and-field-dictionary.md`**: new §3.6 (form definition model) and §3.7 (execution mapping model) as references to the satellite schemas
- **`6-business-rules-catalog.md`**: BR-011 — satellite referential integrity (`serviceId` in any satellite MUST match a known catalog record)
- **`glossary.md`**: 11 new terms — satellite schema, serviceId (as linking key), pipeline, building block, form definition, execution mapping, design-time contract, Form Profile, Execution Profile, normalizationConfidence, qualityFlag, frictionScore
- **`examples/valid-form-definition.json`**: canonical example for `form-definition` satellite (6 fields, 2 sections, conditional field, file constraints, document and step mapping), based on MID-EXAMPLE-002
- **`examples/valid-execution-mapping.json`**: canonical example for `execution-mapping` satellite (case_intake, document_check with humanTask, notification_send), based on MID-EXAMPLE-002
- **`examples/invalid-explained.md`**: companion annotation file documenting expected BR violations (BR-004, BR-005, BR-008) per conformance profile for `invalid-explained.json`

### Changed
- **`0-document-control.md`**: objective updated to reference the full 5-stage pipeline; §0.3 updated to list catalog and satellite schemas as separate normative artifact categories; normative language definition in §0.2 designated as the single authoritative location
- **`1-architecture-and-scope.md`**: scope updated to include form field definition and execution mapping; exclusion of "user interface behavior" narrowed to visual rendering only
- **`2-conformance-and-governance.md`**: §2.1 now defers to §0.2 for normative language definition (removes duplication); §2.4 governance model expanded to include satellite schema ownership boundaries
- **`3-information-model-and-field-dictionary.md`**: §3.4 corrected — `documentTypeCode`, `label`, `requirementLevel` are MUST (not SHOULD); §3.5 cross-referenced to BR catalog as the authoritative machine-testable form of consistency rules
- **`4-publication-profile-and-quality-gates.md`**: §4.2 and §4.3 clarified — `approved_auto` is the sole publishable `reviewStatus`; §4.5 checklist extended with satellite consistency policy
- **`5-workflow-execution-mapping.md`**: full rewrite as normative prose companion to `execution-mapping.schema.json`; adds field table (§5.2–5.3), action vocabulary aligned with catalog `stepType` (§5.4), complete state machine with rejected/cancelled/needs_complement branches (§5.5), and non-functional requirements (§5.6)
- **`6-business-rules-catalog.md`**: BR-008 resolved — `approved_auto` is the only publishable status, `review_required` is Internal Profile only; BR-010 failure action clarified — WARNING by default, escalates to BLOCK when `requiresPayment: true`

### Fixed
- **`examples/invalid-explained.json`**: removed `_comment` and `_fails` fields from the root payload — these violated `additionalProperties: false` and caused structural validation failure before any business rule could be evaluated

## [0.1.0] - 2026-03-22
### Added
- Initial specification structure in `spec/`.
- Core docs: architecture, conformance, model dictionary, publication profile, execution mapping.
- Normative schemas under `schema/`:
  - `administrative-procedure.schema.json`
  - `workflow.schema.json`
  - `fee.schema.json`
  - `document-requirement.schema.json`
- Release workflow for tag-based GitHub releases.
