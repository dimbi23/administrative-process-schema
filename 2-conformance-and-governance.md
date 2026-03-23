# 2. Conformance and Governance

## 2.1 Normative language

Normative language (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY) is defined in `0-document-control.md` §0.2 and applies throughout this specification.

## 2.2 Conformance profiles

### Internal Profile

The Internal Profile is intended for ingestion, normalization, and review workflows before publication. Records MAY include states such as `review_required` or `manual_required`, and MAY contain quality flags or temporary placeholders while issues are being resolved. Even in this profile, records MUST pass structural schema validation.

### Public API Profile

The Public API Profile is intended for external publication and consumption. A record in this profile MUST pass structural validation and business rule validation, MUST NOT expose placeholder workflow labels, MUST NOT include empty workflow steps, and MUST satisfy publication quality gates defined in `4-publication-profile-and-quality-gates.md`.

### Form Profile

The Form Profile applies to `form-definition` satellite records. A record in this profile MUST declare a valid `serviceId` referencing a published catalog record, MUST define at least one form field, and MUST pass satellite structural schema validation. All field `type` values MUST use the controlled vocabulary defined in `form-definition.schema.json`.

### Execution Profile

The Execution Profile applies to `execution-mapping` satellite records. A record in this profile MUST declare a valid `serviceId` referencing a published catalog record, MUST provide a mapping entry for each workflow step in the referenced catalog record, and MUST pass satellite structural schema validation.

The Execution Profile is an **Internal Profile only**. `execution-mapping` records MUST NOT be served via the Public API Profile or exposed to external consumers. They are consumed exclusively by the WBB Service. Serving an execution mapping publicly would expose internal execution infrastructure (connector identifiers, retry policies, service credentials) and is prohibited.

## 2.3 Conformance checks

A catalog record is conformant when the root object validates, nested `workflow` and `fee` objects validate, and implementation-level business rules pass.

A satellite record is conformant when it validates against its satellite schema and the referential integrity rule BR-011 is satisfied.

## 2.4 Governance model

The schema is governed by a **working group** composed of representatives from the institutional data team, the portal team, and the workflow building block team.

The working group approves schema changes to all normative artifacts (catalog and satellite schemas), maintains normative documentation, defines blocking and non-blocking quality conditions, and approves publication profile policy. Satellite schema changes that do not affect the catalog schema MAY be approved by the owning team with working group notification rather than full approval.

Satellite ownership is as follows: the `form-definition` satellite is co-owned by the portal team; the `execution-mapping` satellite is owned by the WBB Service team. Neither team may introduce changes to the catalog schema without working group approval.

## 2.5 Versioning and release policy

This repository uses Semantic Versioning. MAJOR versions introduce breaking changes, MINOR versions add backward-compatible capabilities, and PATCH versions include non-breaking clarifications or fixes.

Each release MUST publish schema artifacts and an updated changelog. Migration notes are mandatory for MAJOR releases and recommended for MINOR releases.

Satellite schemas are versioned independently of the catalog schema. Each satellite record MUST declare the catalog `schemaVersion` it was derived from. A satellite schema MAJOR version bump MUST be coordinated with the catalog schema release if it depends on catalog field changes.
