# 0. Document Control

- **Specification:** Administrative Process Schema Standard
- **Status:** Draft
- **Current version:** 2.0.0-draft.6
- **Maintainer:** Administrative Process Schema Working Group
- **Last updated:** 2026-03-23

## 0.1 Objective

This specification defines a national, machine-readable contract for administrative procedures. It covers the full five-stage pipeline: normalization of raw institutional data into a canonical schema, publication to a procedures portal, citizen-facing form generation, integration with a workflow building block, and orchestration of case execution.

The objective is to make procedure definitions explicit, stable, and reusable across all stages of this pipeline. A procedure definition MUST be versioned, publication payloads MUST be machine-validated, and execution engines MUST consume canonical semantics rather than redefine them.

## 0.2 Normative language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** indicate normative requirement levels and are interpreted in the RFC 2119 / RFC 8174 sense. This is the single authoritative definition of normative language for this specification.

## 0.3 Normative artifacts

This specification defines three categories of schema artifacts linked by `serviceId`.

**Catalog schema (stable):**
- `./schema/administrative-procedure.schema.json` — root procedure model
- `./schema/workflow.schema.json` — workflow model
- `./schema/fee.schema.json` — fee model
- `./schema/document-requirement.schema.json` — document requirement model

**Satellite schemas (draft):**
- `./schema/form-definition.schema.json` — citizen form field definitions for dynamic form generation
- `./schema/execution-mapping.schema.json` — per-step execution mapping for the WBB Service (process derivation and workflow orchestration)

Satellite schemas are normative artifacts at draft status. They share the `serviceId` linking key with the root catalog schema. Their governance follows the same working group process defined in `2-conformance-and-governance.md`.

**Reference data (normative):**
- `./taxonomy/document_taxonomy.csv` — canonical document type code vocabulary (source of truth for `documentTypeCode`, enforced by BR-013)
- `./taxonomy/document_synonyms.csv` — raw label → canonical code mappings used by the normalization pipeline

## 0.4 Governance reference

Schema evolution is managed by a working group under the governance rules defined in `2-conformance-and-governance.md`.
