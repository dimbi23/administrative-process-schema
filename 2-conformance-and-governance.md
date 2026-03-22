# 2. Conformance and Governance

## 2.1 Normative language

MUST / SHOULD / MAY are normative requirement levels.

## 2.2 Conformance profiles

### Internal Profile
- MAY include `review_required`, `manual_required`.
- MAY include quality flags and temporary placeholders.
- MUST still pass structural schema validation.

### Public API Profile
- MUST pass full schema + business validation rules.
- MUST NOT include placeholder workflow labels.
- MUST NOT include empty workflow steps.
- MUST satisfy publication quality gates.

## 2.3 Conformance checks

A record is conformant only if:
1. root object validates,
2. nested `workflow` validates,
3. nested `fee` validates,
4. business rules pass.

## 2.4 Governance model

The schema is governed by a **small working group**.

Responsibilities:
- approve schema changes,
- maintain normative documentation,
- define blocking/non-blocking quality flags,
- approve publication profile policy.

## 2.5 Versioning and release policy

SemVer:
- MAJOR = breaking,
- MINOR = backward-compatible additions,
- PATCH = non-breaking clarifications/fixes.

Each release MUST publish:
- schema artifacts,
- changelog,
- migration notes (for MAJOR, SHOULD for MINOR).
