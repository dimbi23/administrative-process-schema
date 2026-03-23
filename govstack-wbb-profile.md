# GovStack Workflow Building Block — Implementation Profile

This document describes how the Administrative Process Schema Standard implements the [GovStack Workflow Building Block specification](https://workflow.govstack.global) (v1). It maps our concepts to GovStack/BPMN terminology, documents supported capabilities, and states what is deferred to a future version.

**GovStack WBB spec version:** 1.0
**This profile version:** 1.0 (aligned with spec v2.0.0-draft.3)

---

## 1. Concept mapping

| GovStack / BPMN concept | Our concept | Location |
|---|---|---|
| ProcessDefinition | `AdministrativeProcedure` | `administrative-procedure.schema.json` |
| Process (deployed) | Published catalog record | Procedures API `GET /procedures/:serviceId` |
| Activity | `workflow.steps[]` item | `workflow.schema.json` |
| Activity type (user/service) | `step.actor` + `step.stepType` | `workflow.schema.json` |
| Sequence Flow | Implicit: next step by `order` | Default sequential flow |
| Exclusive Gateway | `step.transitions[]` | `workflow.schema.json` (added v2.0.0-draft.3) |
| ProcessInstance | Case record with `caseId` | Case API |
| Instance ID | `caseId` | Case API `POST /cases` response |
| State (instance input) | `execution-mapping.steps[].inputMapping` | `execution-mapping.schema.json` |
| Instance status | Case state machine | Case API `GET /cases/:caseId` |
| Asynchronous initiation | Webhook + outbox pattern (HTTP 202) | Case API → n8n |
| Flow trigger | `trigger.type = event` | `execution-mapping.schema.json` |
| Cron/timer trigger | `trigger.type = cron` + `cronExpression` | `execution-mapping.schema.json` |
| API trigger | `trigger.type = api` | `execution-mapping.schema.json` |
| Audit log | Immutable audit trail | Case API |
| Process discovery | `GET /procedures` | Procedures API |
| `GET /processes/{id}` | `GET /procedures/:serviceId` | Procedures API |
| `POST /processes/{id}/start` | `POST /cases` | Case API |
| `GET /instances/{id}` | `GET /cases/:caseId` | Case API |
| `GET /instances` | `GET /cases?serviceId=X` | Case API |
| `POST /processes/{id}/stop` | `POST /cases/:caseId/cancel` | Case API |
| Error boundary event | `step.onFailure` (escalate/reject/suspend) | `execution-mapping.schema.json` |
| Timer intermediate event | `step.slaDays` + escalation trigger | `workflow.schema.json` + Case API |
| processStartedBy | Citizen/agent identity in case payload | Case API |
| instanceValues | Form submission data | Case API (from form-definition satellite) |

---

## 2. API alignment

GovStack WBB defines a REST API over process definitions and instances. Our implementation distributes these responsibilities across two services.

### Process definition endpoints (→ Procedures API)

| GovStack endpoint | Our endpoint | Notes |
|---|---|---|
| `GET /processes` | `GET /procedures` | Returns active catalog records (Public API Profile) |
| `GET /processes/{processId}` | `GET /procedures/:serviceId` | Full procedure definition |
| — | `GET /procedures/:serviceId/form` | Extension: form-definition satellite |
| — | `GET /procedures/:serviceId/execution` | Extension: execution-mapping satellite |

### Process instance endpoints (→ Case API)

| GovStack endpoint | Our endpoint | Notes |
|---|---|---|
| `POST /processes/{processId}/start` | `POST /cases` | Body includes `serviceId` + form data |
| `GET /instances` | `GET /cases?serviceId=X` | Filter by procedure |
| `GET /instances/{instanceId}` | `GET /cases/:caseId` | Instance status + current state |
| `POST /processes/{processId}/stop` | `POST /cases/:caseId/cancel` | Terminates the running instance |

### Data model alignment

| GovStack model | Our equivalent |
|---|---|
| `ProcessDefinition.name` | `AdministrativeProcedure.name` |
| `ProcessDefinition.version` | `AdministrativeProcedure.schemaVersion` |
| `ProcessDefinition.isExecutable` | `workflow.reviewStatus == "approved_auto"` |
| `ProcessInstance.id` | `caseId` |
| `ProcessInstance.processRef` | `case.serviceId` |
| `ProcessInstance.initTime` | `case.submittedAt` |
| `ProcessInstance.state` | Case state machine current state |
| `ProcessInstance.lastChangeTime` | Last audit event timestamp |
| `ProcessInstancePayload.processStartedBy` | `case.applicant.id` |
| `ProcessInstancePayload.instanceValues` | Form field values from form-definition satellite |

---

## 3. Execution model

### Trigger types

GovStack REQUIRES three execution methods. Our `execution-mapping.trigger` field covers all three:

| GovStack method | Our implementation | Field |
|---|---|---|
| Web API-based | `trigger.type = "api"` | Case API `POST /cases` → webhook to n8n |
| Manual interaction | `trigger.type = "api"` with human-initiated submission | Portal form submission |
| Time-based scheduling | `trigger.type = "cron"` + `trigger.cronExpression` | n8n cron node |
| Flow trigger | `trigger.type = "event"` + `trigger.eventType` | n8n event webhook from prior process |

### Branching (Exclusive Gateway)

GovStack REQUIRES exclusive gateway support. Our `step.transitions[]` models this:

```json
{
  "stepId": "step_decision",
  "stepType": "decision",
  "transitions": [
    {
      "transitionId": "trans_approved",
      "label": "Approuvé",
      "condition": "output.decision == 'approved'",
      "targetStepId": "step_delivery"
    },
    {
      "transitionId": "trans_rejected",
      "label": "Rejeté",
      "condition": "output.decision == 'rejected'",
      "targetStepId": "step_rejection_notif"
    },
    {
      "transitionId": "trans_complement",
      "label": "Complément requis",
      "condition": null,
      "targetStepId": "step_complement_request"
    }
  ]
}
```

Execution rules:
- If `transitions` is absent or empty → sequential flow (next step by `order`)
- First transition whose `condition` evaluates to true fires
- A transition with `condition: null` is the fallback (default path)
- `targetStepId: "END"` terminates the instance

### State machine

Our case lifecycle state machine maps to GovStack instance states:

```
submitted ──→ in_review ──→ waiting_external ──→ decided ──→ notified ──→ closed
                  │                                  │
                  └──→ needs_complement ──→ submitted (loop)
                                                   │
                                              rejected ──→ closed
                                              cancelled ──→ closed

Error branch (any state after submitted):
failed ──→ retrying ──→ manual_intervention ──→ resolved or abandoned ──→ closed
```

---

## 4. Supported capabilities (v1)

| GovStack requirement | Level | Status |
|---|---|---|
| Execute business processes | REQUIRED | ✅ Supported |
| Asynchronous API initiation (HTTP 202) | REQUIRED | ✅ Supported |
| Return unique instance ID | REQUIRED | ✅ `caseId` |
| Pass initial state with process | REQUIRED | ✅ `instanceValues` via form data |
| Synchronous API initiation | REQUIRED | ⚠️ Partial — Case API returns 202; sync variant planned |
| Process discovery API | REQUIRED | ✅ `GET /procedures` |
| Status monitoring | REQUIRED | ✅ `GET /cases/:caseId` |
| Audit logging | REQUIRED | ✅ Immutable audit trail in Case API |
| Flow trigger (prior process outcome) | REQUIRED | ✅ `trigger.type = "event"` |
| Cron/timer trigger | REQUIRED | ✅ `trigger.type = "cron"` |
| Exclusive gateway | RECOMMENDED | ✅ `step.transitions[]` |
| Private data protection | REQUIRED | ✅ Per-service DB, access-controlled Case API |
| Distributed system reliability | REQUIRED | ✅ Kubernetes + outbox pattern |
| REST with JSON | REQUIRED | ✅ All APIs |
| BPMN v2.0 process modeling | REQUIRED | ❌ Deferred — see §5 |
| BPMN diagram/XML generation | REQUIRED | ❌ Deferred — see §5 |
| Inclusive gateway | RECOMMENDED | ❌ Deferred |
| Parallel gateway | RECOMMENDED | ❌ Deferred |
| Event-based gateway | RECOMMENDED | ❌ Deferred |
| Sub-processes (nesting) | REQUIRED | ❌ Deferred |
| Cross-organization messaging (Info Mediator) | REQUIRED | ❌ Deferred |

---

## 5. Deferred capabilities and roadmap

The following GovStack WBB capabilities are not implemented in v1. They are documented here for roadmap planning.

### 5.1 BPMN 2.0 compliance (target: v2.1.0)

GovStack REQUIRES BPMN v2.0.2 process modeling with XML/JSON generation. Our workflow schema is currently a simplified representation.

**What is needed:**
- Extend `workflow.schema.json` to model BPMN flow objects natively (start/end events, tasks, gateways)
- Add BPMN XML export from the catalog record
- The admin UI (Payload) would need a BPMN diagram editor

**Interim mitigation:** The `workflow.steps[]` + `transitions[]` structure maps losslessly to BPMN in the sequential + exclusive gateway subset. A BPMN export utility can be written when needed.

### 5.2 Advanced gateways (target: v2.1.0)

Inclusive, Parallel, and Event-based gateways are not modeled in the current workflow schema.

**Interim mitigation:** Parallel behavior can be approximated in n8n using parallel branches within a single workflow, even without schema-level modeling.

### 5.3 Sub-processes / nesting (target: v2.2.0)

GovStack supports infinite nesting. Our model is flat.

**Interim mitigation:** Complex procedures can be broken into multiple `serviceId` procedures linked via `trigger.type = "event"`.

### 5.4 Cross-organization messaging via Information Mediator (target: v2.2.0)

GovStack requires cross-org message support via a GovStack Information Mediator Building Block.

**Interim mitigation:** Cross-ministry steps are currently modeled as `actor: "administration"` steps with a `processingLocation` pointing to the external ministry. Actual data exchange is handled manually or via direct API calls between ministries.

### 5.5 Synchronous process initiation (target: v2.0.0-rc1)

GovStack REQUIRES sync initiation. Currently all case submissions are async.

**What is needed:** Case API returns a synchronous response when the procedure completes within a short timeout (applicable to simple, fully automated procedures with no human tasks).

---

## 6. n8n as the WBB engine

n8n is used as the Workflow Building Block execution engine. This table shows how GovStack WBB concepts map to n8n constructs:

| GovStack / BPMN concept | n8n construct |
|---|---|
| Process definition | n8n Workflow |
| Activity (service task) | n8n Node (HTTP, Function, etc.) |
| Activity (user task) | n8n Wait node + Case API humanTask |
| Exclusive gateway | n8n IF node |
| Parallel gateway | n8n Split In Batches / parallel branches |
| Timer event | n8n Cron trigger node |
| API trigger | n8n Webhook trigger node |
| Error handling | n8n Error trigger node |
| Process instance | n8n Execution |
| Instance variables | n8n `$json` context variables |
| Audit event | n8n HTTP node → Case API `POST /cases/:caseId/events` |

---

## 7. Compliance declaration

This implementation claims **partial conformance** with the GovStack Workflow Building Block specification v1.

Supported: process execution, instance management, API-based/cron/event triggers, exclusive gateway branching, audit logging, process discovery, distributed deployment.

Not supported in v1: BPMN 2.0 diagram generation, inclusive/parallel/event-based gateways, sub-processes, cross-organization Information Mediator messaging.

Planned for v2.1.0: BPMN 2.0 compliance, advanced gateways.
Planned for v2.2.0: sub-processes, Information Mediator integration.
