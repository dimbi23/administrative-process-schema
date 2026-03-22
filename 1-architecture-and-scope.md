# 1. Architecture and Scope

## 1.1 Standard layers

This standard separates three layers with distinct responsibilities.

At design time, the normative models define what a procedure means: the `AdministrativeProcedure` root model, the `workflow` model, the `fee` model, and the document requirements model. At run time, execution systems manage case lifecycle behavior, including `caseId`, state transitions, audit events, and notifications. At exchange/publication time, systems expose a strict payload profile for public portals and APIs so external consumers receive consistent, interoperable data.

## 1.2 Scope

This specification covers procedure identity and ownership, required documents, fee and workflow representation, review and quality indicators, and publication constraints for conformant records.

This specification does not define legal drafting text, detailed user interface behavior, or internal ministry organization redesign.

## 1.3 Canonical process principle

A procedure definition MUST be stable and versioned.
A case execution MUST reference the procedure version it was started with.

## 1.4 Building block vision alignment

In a workflow building block implementation, the portal submits a case for one `serviceId`, the orchestrator loads the canonical workflow, steps execute through connectors, the user receives notifications, and the audit trail records every state transition.

The architecture follows a strict separation of concerns. The schema carries policy-bearing logic (what must happen), the orchestrator provides execution machinery (how it happens at run time), and the case API preserves legal-operational memory (what actually happened). This separation protects public accountability: workflow tooling may evolve, but normative semantics and traceability MUST remain stable and inspectable.
