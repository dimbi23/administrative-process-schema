# 5. Workflow Execution Mapping

This section is the prose companion to `./schema/execution-mapping.schema.json`. It defines the normative contract for mapping canonical workflow steps to executable actions in the WBB Service. The machine-readable form of this mapping is defined in the satellite schema; this document provides the rationale, field semantics, and implementation requirements.

## 5.1 Design-time vs run-time

The catalog schema defines process semantics at design time: what steps exist, in what order, and what they mean. The `execution-mapping` satellite schema defines how those steps are executed at run time: which action to invoke, what data to pass, and what to do on failure.

These are separate artifacts linked by `serviceId`. The catalog schema MUST NOT be modified to carry run-time execution concerns. The execution mapping MUST NOT redefine the business semantics of any step.

The execution mapping is consumed exclusively by the **WBB Service** — the service that implements the GovStack Workflow Building Block API contract and delegates execution internally to a workflow execution engine. The mapping vocabulary (`action`, `connector`, `humanTask`) describes behavior at the WBB Service boundary; the WBB Service is responsible for translating that vocabulary to engine-specific constructs. The execution engine is an internal implementation detail of the WBB Service and is never exposed to other services.

## 5.2 Execution mapping structure

An execution mapping record is a satellite document with the following top-level fields:

| Field | Required | Description |
|---|---|---|
| `serviceId` | MUST | Links to the catalog record. MUST match a known `serviceId` (BR-011). |
| `catalogSchemaVersion` | MUST | The catalog `schemaVersion` this mapping was derived from. |
| `mappingVersion` | MUST | Semantic version of this mapping record. |
| `generatedAt` | MUST | ISO 8601 timestamp. |
| `steps` | MUST | Array of per-step execution definitions. One entry per workflow step. |

## 5.3 Per-step execution fields

Each entry in `steps` corresponds to one step in the catalog workflow, identified by `stepId`. The following fields define the execution behavior:

| Field | Required | Description |
|---|---|---|
| `stepId` | MUST | Matches the `stepId` in the catalog workflow. |
| `action` | MUST | The execution action type. See §5.4. |
| `connector` | SHOULD | Identifier of the WBB Service action handler or integration to invoke (e.g., `http`, `form`, `email`, `approval`). Required when `action` is `custom`. The WBB Service maps this to an engine-specific action internally. |
| `inputMapping` | SHOULD | Key-value map from case context variables to connector input parameters. |
| `outputMapping` | SHOULD | Key-value map from connector output to case context variables. |
| `retryPolicy` | MAY | Object with `maxAttempts` (integer) and `backoffSeconds` (integer). |
| `timeout` | MAY | Maximum execution time in seconds before the step is escalated. |
| `humanTask` | MAY | Object defining a human review task: `assigneeRole`, `dueDays`, `instructions`. |
| `onFailure` | MAY | Action to take on unrecoverable failure: `escalate`, `reject`, or `suspend`. |

## 5.4 Action types

The `action` field uses the following controlled vocabulary, aligned with the catalog `stepType` values:

| Action | Typical stepType | Description |
|---|---|---|
| `case_intake` | `submission` | Register the incoming case and assign a `caseId`. |
| `document_check` | `verification` | Validate submitted documents against requirements. |
| `inspection_schedule` | `inspection` | Schedule and record an on-site inspection. |
| `payment_request` | `payment` | Invoke payment connector and record receipt. |
| `instruction_deliver` | `instruction` | Deliver instructions or a pre-filled form to the citizen. |
| `approval_checkpoint` | `approval` | Route to a human approver with defined deadline. |
| `decision_record` | `decision` | Record the authority decision (approved/rejected/deferred). |
| `notification_send` | `notification` | Send outbound notification (email, SMS, portal). |
| `document_deliver` | `delivery` | Deliver the output document to the citizen. |
| `case_archive` | `archival` | Close the case and write to the audit trail. |
| `custom` | `other` | Custom action; `connector` and `inputMapping` are required when this value is used. |

## 5.5 Case state machine

The case lifecycle state machine defines the states a case instance transitions through during execution. Implementations MUST support the following states:

```
submitted
    ↓
in_review
    ↓           → needs_complement → submitted (loop)
    ↓
waiting_external
    ↓
decided ──────── rejected
    ↓
notified
    ↓
closed
```

Error branch (applicable at any state after `submitted`):
```
failed → retrying → manual_intervention → [resolved → resumes] or [abandoned → closed]
```

Cancellation branch (applicable before `decided`):
```
any_state → cancelled → closed
```

State transitions MUST be recorded in the audit trail with a timestamp and actor reference.

## 5.6 Deployment lifecycle

An `ExecutionMapping` transitions through four states from creation to production. The WBB Service is the authority for state transitions from `validated` onward; the normalization pipeline produces records in `draft` state.

| Status | Meaning | Who sets it |
|---|---|---|
| `draft` | Derived from catalog, not yet reviewed | Normalization pipeline |
| `validated` | Reviewed, ready to register in WBB Service | WBB Service operator |
| `deployed` | Registered as a ProcessDefinition; `processId` is set | WBB Service (automatic on activation) |
| `deprecated` | Superseded; no new instances may start | WBB Service operator |

**Version freeze rule:** When a case instance is created, the WBB Service MUST record the `mappingVersion` used to start it. In-flight instances MUST continue executing against the mapping version that created them, even after a newer `deployed` version exists.

**Procedure prerequisite:** A mapping MAY NOT reach `deployed` status if the referenced `AdministrativeProcedure` is not `status: active`.

## 5.7 Non-functional requirements

Execution environments implementing this mapping SHOULD enforce:

- **Idempotency**: External connector calls MUST be idempotent or protected by idempotency keys.
- **Retry determinism**: Retry behavior MUST be governed by the `retryPolicy` field; arbitrary retries are not permitted.
- **Audit completeness**: Every state transition MUST produce an audit event including `caseId`, `stepId`, previous state, new state, timestamp, and actor.
- **Access control**: Case state updates MUST be restricted to authorized actors as defined by the `actor` field in the catalog workflow step.
- **SLA enforcement**: If `slaDays` is defined on a step, the execution engine SHOULD trigger an escalation event when the deadline is exceeded without resolution.
