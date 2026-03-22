# 0. Document Control

- **Specification:** Administrative Process Schema Standard
- **Status:** Draft
- **Current version:** 2.0.0-draft.2
- **Maintainer:** Administrative Process Schema Working Group
- **Last updated:** 2026-03-22

## 0.1 Objective

This specification defines a national, machine-readable standard for administrative procedures.

For years, digital government modernization mostly reproduced paper bureaucracy on screens: forms became web forms, offices became portals, and citizens remained the manual bridge across disconnected systems.

That portal-first paradigm is no longer sufficient.

Public services now need to be consumable not only by humans through UI, but by systems and software agents through explicit contracts. This standard provides that contract.

In practical architectural terms:
- procedure semantics MUST be explicit and versioned,
- publication contracts MUST be machine-validated,
- orchestration engines MUST execute canonical semantics rather than redefine them.

## 0.2 Normative language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative requirement levels.

## 0.3 Normative artifacts

The following schemas are normative references:
- `./schema/administrative-procedure.schema.json` (root model)
- `./schema/workflow.schema.json` (workflow model)
- `./schema/fee.schema.json` (fee model)
- `./schema/document-requirement.schema.json` (document requirement model)

## 0.4 Governance reference

Schema evolution is managed by a small working group (see `2-conformance-and-governance.md`).
