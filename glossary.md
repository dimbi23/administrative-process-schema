# Glossary

## AdministrativeProcedure
Canonical root object representing one administrative service definition. The single source of truth for a procedure's identity, workflow, fee, and document requirements.

## Case
Runtime instance of a procedure execution for a specific applicant or request. A case carries a `caseId` and references the procedure version (`schemaVersion`) it was started from.

## Catalog schema
The set of normative schemas defining the `AdministrativeProcedure` root model and its sub-models (`workflow`, `fee`, `document-requirement`). The catalog schema is the design-time contract for a procedure definition.

## Satellite schema
A normative schema that extends the catalog contract for a specific downstream consumer. Satellite schemas are linked to catalog records by `serviceId`. The two satellite schemas in this specification are `form-definition.schema.json` and `execution-mapping.schema.json`.

## serviceId
The unique identifier of a procedure record. Acts as the cross-schema linking key between the catalog record and any satellite records (`form-definition`, `execution-mapping`). All records sharing a `serviceId` describe the same administrative procedure from different perspectives.

## Pipeline
The five-stage processing chain: (1) normalization of raw institutional data, (2) catalog publication to the portal, (3) citizen form generation, (4) workflow building block integration, (5) case orchestration.

## Building block
A reusable, independently deployable system component in the pipeline. The workflow building block is the orchestration component that executes case instances using the execution mapping as its configuration contract.

## Form definition
A satellite schema record that defines the citizen-facing form fields for one procedure. It declares field types, labels, validation rules, and conditional display logic as a machine-readable contract for form generators. It does not define visual rendering.

## Execution mapping
A satellite schema record that defines how each workflow step in a procedure maps to an executable action in the orchestration engine. It provides connector references, input/output mappings, retry policies, and human task configurations.

## Design-time contract
A normative schema or satellite schema artifact that defines what a procedure, form, or execution must contain. Design-time contracts are version-controlled and governed. They are consumed by runtime systems but MUST NOT be modified by them.

## Publishable
A catalog record that satisfies all Public API profile constraints and quality gates defined in `4-publication-profile-and-quality-gates.md`.

## Blocking quality condition
A quality issue that prevents publication until resolved. Enforced by the business rules catalog.

## Non-blocking quality condition
A quality issue that may be published with a warning under policy. Recorded as a `qualityFlag` on the affected record.

## Execution-ready workflow
A workflow that is non-empty, consistently ordered, semantically coherent, and publishable under the Public API Profile.

## Placeholder
A temporary value used during internal normalization (e.g., `Étape sans libellé`). Not allowed in the Public API Profile. Detected by BR-004.

## Internal Profile
Conformance profile for ingestion, normalization, and review workflows. Permits `manual_required` states and quality flags.

## Public API Profile
Conformance profile for external publication. Requires `reviewStatus=approved_auto`, no placeholder labels, and all blocking quality conditions resolved.

## Form Profile
Conformance profile for `form-definition` satellite records. Requires a valid `serviceId`, at least one form field, and structural schema validation.

## Execution Profile
Conformance profile for `execution-mapping` satellite records. Requires a valid `serviceId`, a mapping entry for each catalog workflow step, and structural schema validation.

## Normative artifact
A schema or specification file that defines mandatory constraints. All normative artifacts are listed in `0-document-control.md` §0.3.

## normalizationConfidence
A field indicating how reliably a workflow or its steps were extracted from raw source data. Values: `auto_high`, `auto_medium`, `manual_required`.

## qualityFlag
A structured indicator of a known quality issue on a workflow step. Detected during normalization. Blocking quality flags prevent Public API publication (BR-009).

## frictionScore
A computed metric on a procedure indicating the relative complexity or burden imposed on the applicant. Derived from step count, manual step share, and document requirements.
