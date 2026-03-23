# 1. Architecture and Scope

## 1.1 Standard layers

This standard separates five layers with distinct responsibilities.

At **normalization time**, raw institutional data (spreadsheets, paper forms, legacy records) is parsed, validated, and transformed into a conformant `AdministrativeProcedure` record. Confidence scoring and quality flags are produced at this stage.

At **design time**, the normative catalog schemas define what a procedure means: the `AdministrativeProcedure` root model, the `workflow` model, the `fee` model, and the document requirements model. Satellite schemas extend this design-time contract for downstream consumers.

At **form time**, the `form-definition` satellite schema defines the citizen-facing form fields derived from the procedure definition. This layer is a machine-readable contract for form generators and portals — it defines field types, labels, validation rules, and conditional logic, not visual rendering.

At **run time**, execution systems manage case lifecycle behavior, including `caseId`, state transitions, audit events, and notifications. The `execution-mapping` satellite schema provides the per-step mapping from canonical workflow semantics to orchestration engine actions.

At **exchange/publication time**, systems expose a strict payload profile for public portals and APIs so external consumers receive consistent, interoperable data.

## 1.2 Scope

This specification covers:
- Procedure identity, ownership, and metadata
- Required documents and fee representation
- Workflow step modeling and quality indicators
- Publication constraints for conformant records
- Citizen form field definitions as a machine-readable schema contract
- Per-step execution mapping for workflow orchestration

This specification does not define legal drafting text, visual rendering or CSS-level interface behavior, or internal ministry organization redesign.

## 1.3 Canonical process principle

A procedure definition MUST be stable and versioned.
A case execution MUST reference the procedure version it was started with.
Satellite schema records MUST reference the same `serviceId` as the root catalog record they extend.

## 1.4 Building block vision alignment

The full pipeline flows as follows:

```
Institution (raw data)
    │ normalization
    ▼
AdministrativeProcedure catalog record          ← this spec (root + satellite schemas)
    │ publication
    ▼
Procedures API  ◄──►  Portal
    │ form generation
    ▼
Citizen form  ← driven by form-definition satellite
    │ case submission
    ▼
Case API  ← case lifecycle, state machine, audit trail
    │ POST /processes/{serviceId}/start   [GovStack WBB signature]
    ▼
WBB Service  ← GovStack WBB contract, process derivation, execution engine adapter
    │ execution engine   [internal — never exposed outside WBB Service]
    ▼
Workflow execution engine  ← internal implementation detail
    │ callback webhook
    ▼
Case API  ← state update + audit event
```

The architecture follows a strict separation of concerns. The catalog schema carries policy-bearing logic (what must happen). The satellite schemas extend that contract for specific downstream consumers without modifying the catalog. The WBB Service implements the GovStack workflow contract and delegates execution internally to a workflow engine. The Case API preserves legal-operational memory (what actually happened).

This separation protects public accountability: execution engine internals and form renderers may evolve independently, but normative procedure semantics and case traceability MUST remain stable and inspectable.

## 1.5 Service topology

The platform is organized as four independently deployable services backed by shared libraries.

```
Services:
  Procedures API   REST API — catalog read, satellite serving (public + internal profiles)
  Case API         REST API — case lifecycle, state machine, audit trail
  WBB Service      REST API — GovStack WBB contract, process derivation, execution engine adapter
  Portal           Web application — citizen portal + administration back-office

Shared libraries:
  schemas          types generated from the JSON Schemas in this spec
  dto              shared request/response contracts between services
  events           inter-service event contracts (case.started, process.completed, etc.)
```

**Dependency rules:**
- Services MUST NOT depend directly on other services' internals.
- The WBB Service is the sole service with access to the workflow execution engine; no other service communicates with it directly.

**Inter-service communication:**
- Case API → WBB Service: synchronous HTTP using GovStack WBB API signatures.
- WBB Service → Case API: webhook callback for async execution events (outbox pattern, HTTP 202).

## 1.6 Procedure → process derivation

An `AdministrativeProcedure` (institutional definition) and a `ProcessDefinition` (GovStack WBB executable) are distinct objects at different abstraction levels. Our standard is the derivation chain that connects them:

```
AdministrativeProcedure  (institutional layer — this spec)
    └── ExecutionMapping ─── derives ──► ProcessDefinition  (WBB layer — GovStack)
                                              │
                                              ▼
                                         ProcessInstance  (runtime — Case API + execution engine)
```

The `ExecutionMapping` satellite is the derivation artifact. It carries the per-step execution semantics needed by the WBB Service to register and activate a `ProcessDefinition`. A procedure definition MUST exist and be `status: active` before an `ExecutionMapping` can be deployed. A case instance MUST reference the `catalogSchemaVersion` of the procedure it was started with, so in-flight cases are not affected by subsequent procedure version changes.

## 1.7 Satellite schema architecture

The two satellite schemas (`form-definition.schema.json` and `execution-mapping.schema.json`) are linked to the root catalog by the `serviceId` field. This is the authoritative linking key across all three schema domains.

**Ownership boundaries:**
- The catalog schema is owned by the working group and reflects the institutional definition of a procedure.
- The form-definition schema is co-owned by the portal and form generation teams and reflects the citizen interaction design.
- The execution-mapping schema is co-owned by the WBB Service team and reflects the process execution contract.

**Access control:**
- The `form-definition` satellite is served publicly by the Procedures API (citizen portal consumption).
- The `execution-mapping` satellite MUST NOT be served in the Public API Profile. It is an internal artifact consumed only by the WBB Service. Exposing it would leak execution infrastructure details.

Each satellite schema is independently versioned but MUST declare the `serviceId` and the catalog `schemaVersion` it was derived from. A satellite record without a corresponding root catalog record is invalid (see BR-011).
