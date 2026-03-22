# 2. Conformance and Governance

## 2.1 Normative language

The terms MUST, SHOULD, and MAY are normative requirement levels used throughout this specification.

## 2.2 Conformance profiles

### Internal Profile

The Internal Profile is intended for ingestion, normalization, and review workflows before publication. Records MAY include states such as `review_required` or `manual_required`, and MAY contain quality flags or temporary placeholders while issues are being resolved. Even in this profile, records MUST pass structural schema validation.

### Public API Profile

The Public API Profile is intended for external publication and consumption. A record in this profile MUST pass structural validation and business rule validation, MUST NOT expose placeholder workflow labels, MUST NOT include empty workflow steps, and MUST satisfy publication quality gates.

## 2.3 Conformance checks

A record is conformant only when the root object validates, nested `workflow` and `fee` objects validate, and implementation-level business rules pass.

## 2.4 Governance model

The schema is governed by a **small working group**.

The working group approves schema changes, maintains normative documentation, defines blocking and non-blocking quality conditions, and approves publication profile policy.

## 2.5 Versioning and release policy

This repository uses Semantic Versioning. MAJOR versions introduce breaking changes, MINOR versions add backward-compatible capabilities, and PATCH versions include non-breaking clarifications or fixes.

Each release MUST publish schema artifacts and an updated changelog. Migration notes are mandatory for MAJOR releases and recommended for MINOR releases.
