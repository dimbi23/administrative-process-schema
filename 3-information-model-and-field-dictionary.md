# 3. Information Model and Field Dictionary

## 3.1 Root entity: AdministrativeProcedure

The root entity is `AdministrativeProcedure`. At minimum, each record MUST include `schemaVersion`, `generatedAt`, `serviceId`, `name`, `status`, `owner`, `workflow`, and `fee`.

## 3.2 Workflow model

Each workflow object MUST include `schemaVersion`, `version`, `generatedAt`, `steps`, `sourceRaw`, `normalizationConfidence`, and `reviewStatus`. Each step MUST include `stepId`, `order`, `label`, `stepType`, and `confidence`. The `stepId` field follows the pattern `^step_[a-z0-9_-]+$`, and `order` starts at 1.

The `stepType`, `actor`, and `channel` fields use controlled vocabularies defined in the schema. These enums are normative and provide interoperability for publication and execution mapping.

## 3.3 Fee model (merged cost+pricing)

Each fee object MUST include `schemaVersion`, `generatedAt`, `currency`, `model`, `rules`, and `summary`. The current schema constrains `currency` to `MGA` and constrains `model` to `fixed`, `conditional`, `range`, `composite`, `percentage`, or `unknown`.

Rule-level conditional constraints are enforced by schema logic: `fixed` rules require `amount`, `range` rules require `minAmount` and `maxAmount`, and `percentage` rules require `percentage`.

## 3.4 Documents model

Each `documentsRequired[]` entry MUST include `documentTypeCode`, `label`, and `requirementLevel`. It MAY include `condition` when a requirement is context-dependent, `sourceText` for traceability, and `confidence` to indicate normalization quality.

The `documentTypeCode` field MUST use a canonical code from the document taxonomy (`document_taxonomy.csv`, column `documentCode`, where `active=true`). This taxonomy is the authoritative controlled vocabulary for document type codes across the entire pipeline — catalog records, form-definition satellites, and normalization tooling all reference the same codes. Non-conformant codes (e.g., ad-hoc strings like `CIN_COPY`) are invalid and MUST be rejected (BR-013).

The taxonomy follows the naming convention `DOC_[CATEGORY]_[SUBCATEGORY]` (e.g., `DOC_ID_CIN`, `DOC_RES_CERT`, `DOC_PAY_BANK_SLIP`). The full taxonomy is maintained at `./taxonomy/document_taxonomy.csv` within the spec repository. The synonyms table (raw label → canonical code mappings used by the normalization pipeline) is at `./taxonomy/document_synonyms.csv`.

## 3.5 Business consistency rules (core)

This section provides a prose summary. The authoritative machine-testable form of these rules is the business rules catalog in `6-business-rules-catalog.md`. In case of conflict, the catalog is normative.

Implementations MUST enforce: `fee.summary.ruleCount` matching the number of items in `fee.rules` (BR-005), monetary values greater than or equal to zero (BR-006), and `maxAmount >= minAmount` when both are present (BR-007). As a policy rule, `status=active` SHOULD imply a non-empty and execution-ready workflow (BR-001).

## 3.6 Form definition model (satellite)

The `form-definition` satellite schema defines the citizen-facing form fields derived from a procedure. Each form definition record is linked to a catalog record by `serviceId`. The information model for form fields — including field types, validation constraints, conditional display logic, and document upload constraints — is defined in `./schema/form-definition.schema.json`.

## 3.7 Execution mapping model (satellite)

The `execution-mapping` satellite schema defines how each workflow step maps to an executable action in the orchestration engine. Each execution mapping record is linked to a catalog record by `serviceId` and provides per-step fields such as action type, connector reference, input/output mapping, retry policy, and human task configuration. The full field dictionary for execution mappings is defined in `./schema/execution-mapping.schema.json` and its prose companion in `5-workflow-execution-mapping.md`.
