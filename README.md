# Administrative Process Schema Standard

This repository contains a national, machine-readable standard for describing administrative procedures. A procedure is not just a page in a portal — it is a governed artifact with fields, rules, and quality expectations that software systems can consume directly across a full pipeline: from raw institutional data to citizen-facing forms and automated workflow execution.

## Pipeline overview

```
Institution (raw data)
    ↓ normalization
AdministrativeProcedure catalog record
    ↓ publication
Procedures portal / public API
    ↓ form generation
Citizen form  (driven by form-definition satellite)
    ↓ case submission
Workflow building block — n8n orchestration (driven by execution-mapping satellite)
    ↓ case lifecycle
Audit trail / notifications / decision delivery
```

## What this standard enables

- **Publication**: a procedure record can be published to a portal or API in a consistent, validated format
- **Form generation**: the form-definition satellite drives dynamic citizen-facing forms without hard-coding field logic
- **Workflow execution**: the execution-mapping satellite configures n8n orchestration from the canonical procedure definition, without rewriting business semantics
- **Governance and analytics**: friction scoring, SLA tracking, and cost transparency are built into the data model

## Repository contents

The core specification is organized in documents, read in order:

1. `0-document-control.md` — version, normative artifacts, governance reference
2. `1-architecture-and-scope.md` — 5-layer model, pipeline diagram, satellite architecture
3. `2-conformance-and-governance.md` — conformance profiles, versioning policy
4. `3-information-model-and-field-dictionary.md` — field dictionary for all schemas
5. `4-publication-profile-and-quality-gates.md` — publication checklist and quality gates
6. `5-workflow-execution-mapping.md` — normative companion to execution-mapping schema
7. `6-business-rules-catalog.md` — machine-testable business rules (BR-001 to BR-011)
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
| `schema/execution-mapping.schema.json` | Per-step n8n execution mapping | Draft v1 |

## Example payloads

| File | Profile | Purpose |
|---|---|---|
| `examples/valid-internal.json` | Internal | Record in review — manual_required state, quality flags |
| `examples/valid-public.json` | Public API | Publishable catalog record |
| `examples/invalid-explained.json` | — | Structurally valid but fails BR-004, BR-005, BR-008 |
| `examples/invalid-explained.md` | — | Annotation: expected violations per profile |
| `examples/valid-form-definition.json` | Form | Satellite form definition for MID-EXAMPLE-002 |
| `examples/valid-execution-mapping.json` | Execution | Satellite execution mapping for MID-EXAMPLE-002 |

## Core principles

The catalog schema is the source of truth at design time. Satellite schemas extend that contract for specific downstream consumers without modifying it. Execution engines MUST consume canonical semantics rather than redefine them. Every release is versioned and governed by a working group.

## Current status

| Artifact | Status |
|---|---|
| Catalog schemas v2 | Draft-stable |
| Satellite schemas v1 | Draft |
| Specification documents | Draft 2.0.0-draft.3 |
| Business rules catalog | BR-001 to BR-011 |
| Canonical examples | 6 files (catalog + satellites) |

## Next milestone

Freeze `2.0.0-rc1` with:
- [ ] One real procedure implemented end-to-end (catalog + form-definition + execution-mapping)
- [ ] Validator script covering schema validation and BR-001 to BR-011
- [ ] First portal integration consuming the catalog Public API Profile
- [ ] First n8n workflow consuming the execution-mapping satellite
