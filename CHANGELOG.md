# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and the project follows Semantic Versioning.

## [2.0.0-draft.6] - 2026-03-23

### Added
- **`6-business-rules-catalog.md`**: BR-013 — `documentTypeCode` taxonomy conformance (every code in `documentsRequired` MUST exist in `document_taxonomy.csv` with `active=true`)
- **`validator/validate.js`**: BR-013 implementation — `--taxonomy <file>` flag loads `document_taxonomy.csv`; checks all `documentsRequired[].documentTypeCode` values; emits WARNING if `--taxonomy` not provided, BLOCK if code unknown
- **`validator/validate.js`**: `loadTaxonomy()` CSV parser (column 0 = documentCode, column 11 = active)

### Changed
- **`3-information-model-and-field-dictionary.md` §3.4**: normative reference to `document_taxonomy.csv` as the authoritative controlled vocabulary for `documentTypeCode`; naming convention `DOC_[CATEGORY]_[SUBCATEGORY]` documented
- **`schema-reference.md`**: `documentTypeCode` description updated with canonical convention and BR-013 reference; BR-012 and BR-013 added to quick reference table

## [2.0.0-draft.5] - 2026-03-23

### Added
- **`examples/end-to-end-walkthrough.md`**: step-by-step walkthrough of the three-file derivation chain for `MID-EXAMPLE-002` — serviceId linking, catalogSchemaVersion anchor, step linkage, document type linkage, derivation chain diagram, and validator commands
- **`schema-reference.md` §9**: `deploymentStatus`, `processId`, and `trigger` fields added to ExecutionMapping table; new Trigger object sub-table
- **`2-conformance-and-governance.md`**: Execution Profile explicitly restricted to Internal Profile only; satellite ownership (portal team / WBB Service team) added to governance section

### Changed
- **`examples/valid-public.json`**: added `documentsRequired` with `CIN_COPY` and `DOMICILE_PROOF` entries — aligning catalog with form-definition field mappings; all three artifacts now form a coherent end-to-end example
- **`examples/valid-execution-mapping.json`**: added `trigger` (type: api), `deploymentStatus: "deployed"`, and `processId` fields
- **`schema-reference.md`**: corrected "n8n action" references to "WBB Service action" in Workflow §2 and stepType table §3; connector field description updated

### Validated
- All three `MID-EXAMPLE-002` example files pass `validate.js` end-to-end: `valid-public.json` (public), `valid-form-definition.json` (public + catalog), `valid-execution-mapping.json` (internal + catalog) — all exit 0

## [2.0.0-draft.4] - 2026-03-23

### Added
- **`1-architecture-and-scope.md` §1.5**: service topology — Nx monorepo with four apps (`procedures-api`, `case-api`, `wbb-service`, `portal`) and three shared libs (`schemas`, `dto`, `events`); Nx enforce-module-boundaries rules; inter-service communication pattern
- **`1-architecture-and-scope.md` §1.6**: procedure → process derivation model — `AdministrativeProcedure` (institutional layer) derives via `ExecutionMapping` to `ProcessDefinition` (WBB layer); in-flight instance version freeze rule
- **`5-workflow-execution-mapping.md` §5.6**: deployment lifecycle — four `deploymentStatus` states (`draft`, `validated`, `deployed`, `deprecated`); version freeze rule; procedure prerequisite constraint
- **`schema/execution-mapping.schema.json`**: `deploymentStatus` enum field and `processId` field (set by WBB Service on deployment)

### Changed
- **`1-architecture-and-scope.md` §1.4**: pipeline diagram updated — WBB Service is an explicit layer between Case API and n8n; n8n is shown as internal implementation detail with "internal — never exposed outside WBB Service" annotation
- **`1-architecture-and-scope.md` §1.7** (was §1.5): satellite architecture updated — execution-mapping ownership transferred to "WBB Service team"; access control section added (form-definition is public; execution-mapping MUST NOT be served in Public API Profile)
- **`5-workflow-execution-mapping.md` §5.1**: WBB Service introduced as the consumer of the execution-mapping satellite; n8n repositioned as internal to WBB Service; `connector` vocabulary described as WBB Service boundary, not n8n level
- **`5-workflow-execution-mapping.md` §5.3**: `connector` field description updated — references WBB Service action handler, not n8n node directly
- **`govstack-wbb-profile.md` §6**: WBB Service introduced as the GovStack WBB contract implementor; n8n repositioned as internal execution engine delegated by the WBB Service; engine-swap note added
- **`schema/execution-mapping.schema.json`**: `connector` field description updated to reference WBB Service
- **`0-document-control.md` §0.3**: execution-mapping satellite description updated — "WBB Service" replaces "n8n"

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
