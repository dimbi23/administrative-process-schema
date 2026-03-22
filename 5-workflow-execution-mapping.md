# 5. Workflow Execution Mapping (n8n-oriented)

## 5.1 Design-time vs run-time

- Schema defines process semantics (design-time).
- n8n executes case instances (run-time).
- Runtime MUST preserve schema meaning and auditability.

## 5.2 Execution mapping concept

Each workflow step SHOULD map to an executable action profile:
- `submission` -> intake/register case
- `verification` -> automated/manual checks
- `payment` -> payment connector invocation
- `decision` -> authority decision checkpoint
- `notification` -> outbound message

## 5.3 Recommended execution extension

For each step, implementations MAY use:
- `execution.action`
- `execution.connector`
- `execution.inputMapping`
- `execution.outputMapping`
- `execution.retryPolicy`
- `execution.timeout`
- `execution.humanTask`

## 5.4 State machine (minimum)

`submitted -> in_review -> waiting_external -> decided -> notified -> closed`

Error branches:
`failed -> retrying -> manual_intervention`

## 5.5 Non-functional requirements

- Idempotency for all external actions,
- deterministic retries,
- full event audit trail,
- strict access control on case updates,
- citizen notification consistency.
