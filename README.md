# Administrative Process Schema Standard

This repository contains a national, machine-readable standard for describing administrative procedures. A procedure is not just a page in a portal — it is a governed artifact with fields, rules, and quality expectations that software systems can consume directly across a full pipeline: from raw institutional data to citizen-facing forms and automated workflow execution.

## Pipeline overview

```
Institution (raw data)
    ↓ normalization
AdministrativeProcedure catalog record  ← this spec
    ↓ publication
Procedures API  ◄──►  Portal
    ↓ form generation
Citizen form  (driven by form-definition satellite)
    ↓ case submission
Case API
    ↓ GovStack WBB API
WBB Service  ← GovStack WBB contract, process derivation
    ↓ execution engine  [internal]
    ↓ case lifecycle
Audit trail / notifications / decision delivery
```

## What this standard enables

- **Publication**: a procedure record can be published to a portal or API in a consistent, validated format
- **Form generation**: the form-definition satellite drives dynamic citizen-facing forms without hard-coding field logic
- **Workflow execution**: the execution-mapping satellite drives the WBB Service — which implements the GovStack Workflow Building Block contract and delegates execution to a workflow engine internally
- **Governance and analytics**: friction scoring, SLA tracking, and cost transparency are built into the data model

## Repository contents

The core specification is organized in documents, read in order:

1. `0-document-control.md` — version, normative artifacts, governance reference
2. `1-architecture-and-scope.md` — 5-layer model, pipeline diagram, satellite architecture
3. `2-conformance-and-governance.md` — conformance profiles, versioning policy
4. `3-information-model-and-field-dictionary.md` — field dictionary for all schemas
5. `4-publication-profile-and-quality-gates.md` — publication checklist and quality gates
6. `5-workflow-execution-mapping.md` — normative companion to execution-mapping schema
7. `6-business-rules-catalog.md` — machine-testable business rules (BR-001 to BR-013)
8. `glossary.md` — term definitions

## Normative schemas

### Catalog schemas
| Schema | Description | Status |
|---|---|---|
| `schema/administrative-procedure.schema.json` | Root procedure model | Draft-stable |
| `schema/workflow.schema.json` | Workflow and step model | Draft-stable |
| `schema/fee.schema.json` | Fee and pricing model | Draft-stable |
| `schema/document-requirement.schema.json` | Document requirement model | Draft-stable |

### Satellite schemas (linked by `serviceId`)
| Schema | Description | Status |
|---|---|---|
| `schema/form-definition.schema.json` | Citizen form field definitions | Draft v1 |
| `schema/execution-mapping.schema.json` | Per-step WBB Service execution mapping | Draft v1 |

## Reference data (taxonomy)

| File | Description |
|---|---|
| `taxonomy/document_taxonomy.csv` | Canonical `documentTypeCode` vocabulary — 19 active codes (enforced by BR-013) |
| `taxonomy/document_synonyms.csv` | Raw label → canonical code mappings for the normalization pipeline |
| `taxonomy/workflow_step_taxonomy.json` | Workflow step type classification reference |

## Example payloads

| File | Profile | Purpose |
|---|---|---|
| `examples/valid-internal.json` | Internal | Record in review — manual_required state, quality flags |
| `examples/valid-public.json` | Public API | Publishable catalog record (MID-EXAMPLE-002) |
| `examples/invalid-explained.json` | — | Structurally valid but fails BR-004, BR-005, BR-008 |
| `examples/invalid-explained.md` | — | Annotation: expected violations per profile |
| `examples/valid-form-definition.json` | Form | Satellite form definition for MID-EXAMPLE-002 |
| `examples/valid-execution-mapping.json` | Execution | Satellite execution mapping for MID-EXAMPLE-002 |
| `examples/end-to-end-walkthrough.md` | — | Full derivation chain walkthrough for MID-EXAMPLE-002 |

## Core principles

The catalog schema is the source of truth at design time. Satellite schemas extend that contract for specific downstream consumers without modifying it. Execution engines MUST consume canonical semantics rather than redefine them. Every release is versioned and governed by a working group.

## Current status

| Artifact | Status |
|---|---|
| Catalog schemas v2 | RC1 |
| Satellite schemas v1 | RC1 |
| Specification documents | 2.0.0-rc1 |
| Business rules catalog | BR-001 to BR-013 |
| Canonical examples | 7 files (catalog + satellites + walkthrough) |
| Taxonomy reference data | 3 files in `taxonomy/` |
| Validator | BR-001–BR-013, `--profile`, `--catalog`, `--taxonomy` flags |
| GovStack WBB profile | Partial conformance declared (§7) |
| Architecture | Frozen — WBB Service layer, Nx monorepo topology |

## Validator usage

```bash
cd validator && npm install

# Validate a catalog record (public profile, with taxonomy check)
node validate.js ../examples/valid-public.json --taxonomy ../taxonomy/document_taxonomy.csv

# Validate internal profile
node validate.js ../examples/valid-internal.json --profile internal

# Validate satellite with referential integrity check
node validate.js ../examples/valid-form-definition.json --catalog ../examples/valid-public.json
node validate.js ../examples/valid-execution-mapping.json --profile internal --catalog ../examples/valid-public.json
```

## Next milestone — v2.1.0

- First portal integration consuming the catalog Public API Profile
- First WBB Service consuming the execution-mapping satellite
- BPMN 2.0 export utility (deferred from rc1)
