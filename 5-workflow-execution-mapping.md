# 5. Workflow Execution Mapping (n8n-oriented)

## 5.1 Design-time vs run-time

The schema defines process semantics at design time, while n8n executes concrete case instances at run time. Runtime behavior MUST preserve schema meaning and end-to-end auditability.

## 5.2 Execution mapping concept

Each workflow step SHOULD map to an executable action profile. For example, `submission` maps to case intake/registration, `verification` maps to automated or manual checks, `payment` maps to payment connector invocation, `decision` maps to an authority checkpoint, and `notification` maps to outbound communication.

## 5.3 Recommended execution extension

For each step, implementations MAY include an execution extension with fields such as `execution.action`, `execution.connector`, `execution.inputMapping`, `execution.outputMapping`, `execution.retryPolicy`, `execution.timeout`, and `execution.humanTask`. These fields are implementation-oriented and do not replace normative business semantics.

## 5.4 State machine (minimum)

`submitted -> in_review -> waiting_external -> decided -> notified -> closed`

Error branches:
`failed -> retrying -> manual_intervention`

## 5.5 Non-functional requirements

Execution environments SHOULD enforce idempotency for external actions, deterministic retry behavior, complete event audit trails, strict access control on case updates, and consistent citizen notifications across channels.
