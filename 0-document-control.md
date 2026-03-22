# 0. Document Control

- **Specification:** Administrative Process Schema Standard
- **Status:** Draft
- **Current version:** 2.0.0-draft.2
- **Maintainer:** Administrative Process Schema Working Group
- **Last updated:** 2026-03-22

## 0.1 Objective

This specification defines a national, machine-readable contract for administrative procedures. It establishes how procedure semantics are represented, validated, published, and consumed across public systems.

The objective is to make procedure definitions explicit, stable, and reusable. A procedure definition MUST be versioned, publication payloads MUST be machine-validated, and orchestration engines MUST execute canonical semantics instead of redefining them.

## 0.2 Normative language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** indicate normative requirement levels and are interpreted in the RFC 2119 / RFC 8174 sense.

## 0.3 Normative artifacts

The normative artifacts of this specification are the schemas `./schema/administrative-procedure.schema.json` (root model), `./schema/workflow.schema.json` (workflow model), `./schema/fee.schema.json` (fee model), and `./schema/document-requirement.schema.json` (document requirement model).

## 0.4 Governance reference

Schema evolution is managed by a working group under the governance rules defined in `2-conformance-and-governance.md`.
