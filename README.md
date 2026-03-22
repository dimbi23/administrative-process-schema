# Administrative Process Schema Standard

This repository contains a national, machine-readable standard for describing administrative procedures. The goal is simple: define procedures once as structured, versioned contracts, then use those contracts consistently for publication, validation, and execution.

In many public systems, digital modernization stopped at web forms and portals. This standard goes further by defining explicit semantics that software systems can consume directly. A procedure is not just a page in a portal; it is a governed artifact with fields, rules, and quality expectations.

## What this standard enables

When a procedure follows this standard, it can be published through a portal or API in a consistent format, validated through deterministic checks, and executed by workflow tooling without rewriting business meaning. The same data model also supports governance and analytics, including cost transparency, processing delays, and friction indicators.

The standard serves two roles at once: it is a national specification for procedure representation, and it is an interoperability layer between systems that need to exchange procedure data.

## Repository contents

The core specification is organized in documents, read in order:

1. `0-document-control.md`
2. `1-architecture-and-scope.md`
3. `2-conformance-and-governance.md`
4. `3-information-model-and-field-dictionary.md`
5. `4-publication-profile-and-quality-gates.md`
6. `5-workflow-execution-mapping.md`
7. `6-business-rules-catalog.md`
8. `glossary.md`

Normative schemas are published under `schema/`:

- `./schema/administrative-procedure.schema.json`
- `./schema/workflow.schema.json`
- `./schema/fee.schema.json`
- `./schema/document-requirement.schema.json`

## Example payloads

- `examples/valid-internal.json`
- `examples/valid-public.json`
- `examples/invalid-explained.json`

## Core principles

The schema is the source of truth at design time. Workflow engines execute that schema at run time and MUST NOT redefine its business semantics. Internal processing may include review-oriented states, but public publication follows a stricter profile. Every release is versioned and governed by a working group.

## Current implementation target

The current 90-day implementation target is a Public Service Portal/API integration. In parallel, the project maintains an execution mapping for an n8n-oriented workflow building block so that the same canonical definition can drive both publication and orchestration.

## Current status

| Artifact | Status |
|---|---|
| Workflow schema v2 | Draft-stable |
| Fee schema v2 (cost + pricing merged) | Draft-stable |
| Root standard document | Expanded draft |
| Public API profile | Defined |
| Execution mapping guide | Defined (v1) |

## Next milestone

The next milestone is to freeze `2.0.0-rc1` with a formal quality gate checklist, three canonical examples (valid internal, valid public, invalid), and a first end-to-end implementation using one real procedure in both portal and workflow execution.
