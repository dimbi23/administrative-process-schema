# Administrative Process Schema Standard

**A national, machine-readable standard for administrative procedures, designed for publication and execution.**

---

## Why this standard exists

For years, digital government modernization mostly reproduced paper bureaucracy on screens: forms became web forms, offices became portals, and citizens remained the manual bridge across disconnected systems.

That portal-first paradigm is no longer sufficient.

Public services now need to be consumable not only by humans through UI, but by systems and software agents through explicit contracts. This standard provides that contract: a canonical, machine-consumable representation of administrative procedures.

With this standard, procedures can be:

- published consistently in a public portal/API,
- validated with deterministic quality gates,
- orchestrated as executable workflows (e.g., n8n-based building block),
- improved through analytics (cost, delay, friction, quality),
- governed as versioned public infrastructure artifacts.

This is both:
- a **national standard** (primary role), and
- an **interchange layer** across systems.

---

## Repository structure (spec)

```
/spec
├── README.md
├── 0-document-control.md
├── 1-architecture-and-scope.md
├── 2-conformance-and-governance.md
├── 3-information-model-and-field-dictionary.md
├── 4-publication-profile-and-quality-gates.md
└── 5-workflow-execution-mapping.md
```

Normative schemas:
- `./schema/administrative-procedure.schema.json`
- `./schema/workflow.schema.json`
- `./schema/fee.schema.json`
- `./schema/document-requirement.schema.json`

---

## Core principles

1. **Schema is source of process truth** (design-time).
2. **Workflow engine executes** the schema (run-time) and MUST NOT redefine business semantics.
3. **Internal profile allows review states**; public profile is strict and publishable.
4. **Every release is versioned** and governed by a small working group.

---

## Implementation target (current)

Primary 90-day target: **Public Service Portal/API**.

Secondary target: workflow building block on top of n8n using schema-driven orchestration.

---

## Reading order

1. `0-document-control.md`
2. `1-architecture-and-scope.md`
3. `2-conformance-and-governance.md`
4. `3-information-model-and-field-dictionary.md`
5. `4-publication-profile-and-quality-gates.md`
6. `5-workflow-execution-mapping.md`

## Current status

| Artifact | Status |
|---|---|
| Workflow schema v2 | Draft-stable |
| Fee schema v2 (cost+pricing merged) | Draft-stable |
| Root standard document | Expanded draft |
| Public API profile | Defined |
| Execution mapping guide | Defined (v1) |

---

## Next milestone

Freeze `2.0.0-rc1` with:
- formal quality gate checklist,
- 3 canonical examples (valid internal / valid public / invalid),
- first implementation with one real procedure in portal+workflow.
