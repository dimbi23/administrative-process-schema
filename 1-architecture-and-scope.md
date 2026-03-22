# 1. Architecture and Scope

## 1.1 Standard layers

This standard separates 3 layers:

1. **Design-time (normative):**
   - `AdministrativeProcedure` model
   - `workflow` model
   - `fee` model
   - document requirements model

2. **Run-time (execution):**
   - case lifecycle (`caseId`, state, audit trail)
   - step execution events
   - notifications

3. **Exchange/publication:**
   - Public portal/API payload profile
   - interoperability contract for external systems

## 1.2 Scope

In scope:
- procedure identity and ownership,
- documents, fees, workflow,
- review and quality indicators,
- publication constraints.

Out of scope:
- legal drafting text,
- UI detail specifications,
- ministry internal org redesign.

## 1.3 Canonical process principle

A procedure definition MUST be stable and versioned.
A case execution MUST reference the procedure version it was started with.

## 1.4 Building block vision alignment

For workflow building block implementation:
- portal form submits data for one `serviceId`,
- orchestrator loads canonical workflow,
- steps execute through connectors,
- user receives status notifications,
- audit trail records each state transition.

Architectural principle:
- **Schema is policy-bearing logic** (what must happen),
- **Orchestrator is execution machinery** (how it happens in runtime),
- **Case API is legal-operational memory** (what actually happened).

This separation is essential for public accountability: workflow engines may change over time, but normative procedure semantics and decision traceability MUST remain stable and inspectable.
