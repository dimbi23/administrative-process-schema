# Schema Reference

Complete field-by-field reference for all normative schemas. Read alongside the specification documents — this page is the authoritative field dictionary for implementers.

All schemas use JSON Schema Draft 2020-12. `additionalProperties: false` is enforced on every object.

---

## Table of contents

1. [AdministrativeProcedure](#1-administrativeprocedure)
2. [Workflow](#2-workflow)
3. [Workflow — Step](#3-workflow--step)
4. [Fee](#4-fee)
5. [Fee — Rule](#5-fee--rule)
6. [DocumentRequirement](#6-documentrequirement)
7. [FormDefinition](#7-formdefinition)
8. [FormDefinition — Field](#8-formdefinition--field)
9. [ExecutionMapping](#9-executionmapping)
10. [ExecutionMapping — Step](#10-executionmapping--step)

---

## 1. AdministrativeProcedure

**Schema:** `schema/administrative-procedure.schema.json`
**Role:** Root catalog object. Source of truth for a procedure's identity, workflow, fee, and document requirements. Linked to satellite schemas by `serviceId`.

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | string | MUST | Semantic version of the catalog schema (e.g. `"2.0.0"`). Consumers validate against their supported version. |
| `generatedAt` | string (date-time) | MUST | ISO 8601 timestamp of when this record was generated or last normalized. |
| `serviceId` | string | MUST | Unique procedure identifier across the catalog. Cross-schema linking key — satellite schemas reference the same value. Convention: `MINISTRY-DOMAIN-NNN` (e.g. `"MID-AUTH-001"`). |
| `name` | string | MUST | Official procedure name as defined by the institution. Must be the canonical designation, not a portal abbreviation. |
| `owner` | object | MUST | Institutional ownership. See [Owner](#owner-object). |
| `status` | string (enum) | MUST | Lifecycle status. Values: `active`, `draft`, `deprecated`, `unknown`. Only `active` records may be published. |
| `workflow` | object | MUST | Workflow definition. See [Workflow](#2-workflow). |
| `fee` | object | MUST | Fee structure. See [Fee](#4-fee). Use `model=unknown` when cost information is unavailable. |
| `description` | string \| null | MAY | Free-text description of purpose and scope for portal display. |
| `type` | string \| null | MAY | Procedure type (e.g. `"autorisation"`, `"attestation"`). No controlled vocabulary enforced. |
| `department` | string \| null | MAY | Geographic scope. Null for nationally applicable procedures. |
| `audience` | string \| null | MAY | Target audience (e.g. `"Particuliers"`, `"Entreprises"`). Used for portal filtering. |
| `eligibility` | string \| null | MAY | Free-text eligibility conditions. Displayed in portal; not machine-evaluated. |
| `languages` | string[] | MAY | BCP 47 language codes available (e.g. `["fr", "mg"]`). Indicates availability, not translated content. |
| `tags` | string[] | MAY | Classification tags for portal search (e.g. `["identité", "urgent"]`). |
| `url` | string (uri) \| null | MAY | Canonical URL of the procedure's official page. |
| `access` | object | MAY | How the procedure is accessed. See [Access](#access-object). |
| `processingTime` | object | MAY | Indicative processing time. See [ProcessingTime](#processingtime-object). |
| `documentsRequired` | DocumentRequirement[] | MAY | Documents the applicant must submit. Empty array or absent = no documents required. |
| `metrics` | object | MAY | Computed quality indicators. See [Metrics](#metrics-object). |
| `supportContact` | object | MAY | Contact information for applicants. See [SupportContact](#supportcontact-object). |

### Owner object

| Field | Type | Required | Description |
|---|---|---|---|
| `ministry` | string | MUST | Short code or name of the owning ministry (e.g. `"MID"`). |
| `entity` | string \| null | MAY | Autonomous agency under the ministry. |
| `directorate` | string \| null | MAY | Directorate within the ministry or entity. |
| `serviceUnit` | string \| null | MAY | Service unit within the directorate. |

### Access object

| Field | Type | Required | Description |
|---|---|---|---|
| `channel` | string (enum) | MAY | `offline`, `online`, `hybrid`, `unknown`. |
| `submissionPoints` | string[] | MAY | Physical or digital submission locations. |

### ProcessingTime object

| Field | Type | Required | Description |
|---|---|---|---|
| `slaDays` | number \| null | MAY | Declared SLA in working days. Reference for delay analytics. |
| `rawText` | string \| null | MAY | Original processing time text from source. Preserved for traceability. |

### Metrics object

| Field | Type | Required | Description |
|---|---|---|---|
| `frictionScore` | number \| null | MAY | Composite burden score. Higher = more friction. |
| `documentsCount` | integer \| null | MAY | Length of `documentsRequired`. Denormalized for analytics. |
| `manualRequiredShare` | number \| null | MAY | Share of steps with `confidence=manual_required` (0.0–1.0). |

### SupportContact object

| Field | Type | Required | Description |
|---|---|---|---|
| `phone` | string \| null | MAY | Support desk phone number. |
| `email` | string (email) \| null | MAY | Inquiry email address. |
| `officeAddress` | string \| null | MAY | Physical address of the handling office. |

---

## 2. Workflow

**Schema:** `schema/workflow.schema.json`
**Role:** Defines the ordered sequence of steps for a procedure. Embedded in `AdministrativeProcedure.workflow`. The `execution-mapping` satellite maps each `stepId` to a concrete WBB Service action.

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | string | MUST | Semantic version of the workflow schema (e.g. `"2.0.0"`). |
| `version` | string | MUST | Version of this workflow within the procedure lifecycle (e.g. `"v2"`). Incremented when steps change. |
| `generatedAt` | string (date-time) | MUST | ISO 8601 generation timestamp. |
| `steps` | Step[] | MUST | Ordered steps. At least 1 required. Steps must have unique, strictly increasing `order` values (BR-002, BR-003). |
| `sourceRaw` | string \| null | MUST | Full raw text from the source document. Preserved verbatim for traceability. |
| `normalizationConfidence` | string (enum) | MUST | Overall confidence: `auto_high`, `auto_medium`, `manual_required`. Worst-case across all steps. |
| `reviewStatus` | string (enum) | MUST | Publication readiness. `approved_auto`: publishable. `review_required`: Internal Profile only. `manual_required`: Internal Profile only. Only `approved_auto` satisfies BR-008. |
| `generator` | string \| null | MAY | Tool or pipeline that produced this workflow (e.g. `"xls-normalizer-v1.2"`). |
| `defaultProcessingLocation` | object | MAY | Default location applied to steps without their own `processingLocation`. Same structure as step `processingLocation`. |
| `source` | object | MAY | Provenance metadata. `sourceFile`, `sourceRowId`, `parserVersion`. |

---

## 3. Workflow — Step

Each item in `workflow.steps`.

| Field | Type | Required | Description |
|---|---|---|---|
| `stepId` | string | MUST | Stable unique identifier. Pattern: `^step_[a-z0-9_-]+$`. Links to `execution-mapping` satellite. |
| `order` | integer ≥ 1 | MUST | Execution sequence position. All values must be unique and strictly increasing (BR-002, BR-003). |
| `label` | string | MUST | Human-readable step name. Must not be a placeholder in Public API Profile (BR-004). |
| `stepType` | string (enum) | MUST | Semantic classification. Drives execution action in `execution-mapping`. See table below. |
| `confidence` | string (enum) | MUST | `auto_high`, `auto_medium`, `manual_required`. Normalization confidence for this step's data. |
| `description` | string \| null | MAY | Detailed description for portal display or human reviewers. |
| `actor` | string (enum) | MAY | Who acts: `citizen`, `business`, `administration`, `mixed`, `unknown`. `unknown` sets `unknown_actor` quality flag. |
| `channel` | string (enum) | MAY | How it is performed: `offline`, `online`, `hybrid`, `unknown`. `unknown` sets `unknown_channel` quality flag. |
| `requiresPayment` | boolean | MAY | True if this step involves a payment transaction. Enforces BR-010 when true. |
| `documentsIn` | string[] | MAY | `documentTypeCode` values consumed at this step. |
| `documentsOut` | string[] | MAY | `documentTypeCode` values produced at this step. |
| `slaDays` | number \| null | MAY | Maximum working days allocated. Used for SLA monitoring and escalation. |
| `sourceText` | string \| null | MAY | Original source text fragment. Preserved for traceability. |
| `processingLocation` | object | MAY | Where this step is processed. Fields: `ministry`, `entity`, `directorate`, `serviceUnit`, `office`, `channelPoint`, `notes`. |
| `responsibleUnit` | string \| null | MAY | Short label for the responsible unit. Simplified alternative to `processingLocation`. |
| `handoffTo` | string \| null | MAY | Unit or actor receiving the case after this step. Documents inter-unit handoffs. |
| `qualityFlags` | string[] | MAY | Quality issues detected during normalization. Blocking flags prevent publication (BR-009). See below. |

### stepType values

| Value | WBB Service action | Description |
|---|---|---|
| `submission` | `case_intake` | Case intake and registration. |
| `verification` | `document_check` | Document or eligibility check. |
| `inspection` | `inspection_schedule` | Physical on-site visit. |
| `payment` | `payment_request` | Fee collection. |
| `instruction` | `instruction_deliver` | Delivering guidance or a pre-filled form to the citizen. |
| `approval` | `approval_checkpoint` | Internal authority sign-off. |
| `decision` | `decision_record` | Final determination (grant / reject / defer). |
| `notification` | `notification_send` | Outbound communication to the citizen. |
| `delivery` | `document_deliver` | Handing over the output document. |
| `archival` | `case_archive` | Closing and storing the case. |
| `other` | `custom` | Use `unknown_step_type` quality flag if genuinely unclassifiable. |

### qualityFlags values

| Flag | Meaning | Blocking? |
|---|---|---|
| `missing_sla` | `slaDays` not defined | No |
| `manual_step` | Step requires manual human processing | No |
| `unknown_actor` | `actor` is `unknown` | No |
| `unknown_channel` | `channel` is `unknown` | No |
| `unknown_step_type` | `stepType` is `other` due to unclassifiable source | No |
| `missing_documents` | Expected `documentsIn`/`documentsOut` not populated | No |
| `processing_location_missing` | No `processingLocation` and no `defaultProcessingLocation` | No |
| `missing_label_autofilled` | Label was auto-filled with a placeholder | Yes — blocks BR-004 |

---

## 4. Fee

**Schema:** `schema/fee.schema.json`
**Role:** Defines the fee structure for a procedure. Embedded in `AdministrativeProcedure.fee`.

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | string | MUST | Semantic version of the fee schema (e.g. `"2.0.0"`). |
| `generatedAt` | string (date-time) | MUST | ISO 8601 generation timestamp. |
| `currency` | string (enum) | MUST | Currency code. Currently `"MGA"` only. |
| `model` | string (enum) | MUST | Fee structure type: `fixed`, `conditional`, `range`, `composite`, `percentage`, `unknown`. See below. |
| `rules` | Rule[] | MUST | Fee rules. Count MUST equal `summary.ruleCount` (BR-005). |
| `summary` | object | MUST | Precomputed summary for display. See [Fee Summary](#fee-summary-object). |
| `source` | object | MAY | Provenance: `rawText`, `rawValues`, `sourceFile`, `sourceRowId`, `parserVersion`. |

### model values

| Value | Description |
|---|---|
| `fixed` | Single flat amount. |
| `conditional` | Amount depends on applicant or request attributes. |
| `range` | Amount falls within a min–max band. |
| `composite` | Multiple named components that sum together. |
| `percentage` | Amount is a percentage of a base value. |
| `unknown` | Fee information could not be extracted. Triggers BR-010 warning if a payment step exists. |

### Fee Summary object

| Field | Type | Required | Description |
|---|---|---|---|
| `isConditional` | boolean | MUST | True if the fee depends on applicant or request attributes. |
| `minAmount` | number \| null | MUST | Minimum possible fee in MGA. Null if not determinable. Must be ≤ `maxAmount` (BR-007). |
| `maxAmount` | number \| null | MUST | Maximum possible fee in MGA. Null if not determinable. Must be ≥ `minAmount` (BR-007). |
| `defaultAmount` | number \| null | MUST | Baseline fee for display (fixed: equals `amount`; conditional: most common case). Null if not determinable. |
| `ruleCount` | integer ≥ 0 | MUST | Number of rules in the `rules` array. MUST equal `len(rules)` exactly (BR-005). |

---

## 5. Fee — Rule

Each item in `fee.rules`.

| Field | Type | Required | Description |
|---|---|---|---|
| `ruleId` | string | MUST | Unique rule identifier. Pattern: `^rule_[a-zA-Z0-9_-]+$` (e.g. `"rule_fixed_base"`). |
| `type` | string (enum) | MUST | `fixed`, `range`, `percentage`, `component`, `unknown`. Determines which fields are required. |
| `amount` | number \| null | Cond. | Required when `type=fixed` or `type=component`. Must be ≥ 0 (BR-006). |
| `minAmount` | number \| null | Cond. | Required when `type=range`. Must be ≥ 0 (BR-006) and ≤ `maxAmount` (BR-007). |
| `maxAmount` | number \| null | Cond. | Required when `type=range`. Must be ≥ 0 (BR-006) and ≥ `minAmount` (BR-007). |
| `percentage` | number \| null | Cond. | Required when `type=percentage`. Range: 0–100. |
| `condition` | string \| null | MAY | When this rule applies (e.g. `"Pour les entreprises de plus de 10 salariés"`). |
| `appliesTo` | string \| null | MAY | What the fee is calculated on (e.g. `"Valeur déclarée du bien"`). |
| `componentLabel` | string \| null | MAY | Named component label for `type=component` (e.g. `"Frais de dossier"`). |
| `confidence` | string (enum) | MAY | `high`, `medium`, `low`. Normalization reliability for this rule. |
| `sourceText` | string \| null | MAY | Original source text. Preserved for traceability. |

---

## 6. DocumentRequirement

**Schema:** `schema/document-requirement.schema.json`
**Role:** One required document entry in `documentsRequired`. The `documentTypeCode` links to form fields in the `form-definition` satellite (via `field.mapsToDocumentTypeCode`).

| Field | Type | Required | Description |
|---|---|---|---|
| `documentTypeCode` | string | MUST | Canonical document type code from the document taxonomy (`document_taxonomy.csv`, `active=true`). Convention: `DOC_[CATEGORY]_[SUBCATEGORY]` (e.g. `"DOC_ID_CIN"`, `"DOC_RES_CERT"`). Cross-reference key to `form-definition` satellite (`field.mapsToDocumentTypeCode`). Enforced by BR-013. |
| `label` | string | MUST | Display name shown to the applicant (e.g. `"Copie de la carte d'identité nationale"`). |
| `requirementLevel` | string (enum) | MUST | `required`: always mandatory. `conditional`: mandatory only when `condition` is met. `optional`: not blocking. |
| `condition` | string \| null | MAY | When this document is required. Populated for `conditional` entries (e.g. `"Pour les demandeurs de nationalité étrangère"`). |
| `sourceText` | string \| null | MAY | Original source text. Preserved for traceability. |
| `confidence` | string (enum) | MAY | `auto_high`, `auto_medium`, `manual_required`. Normalization reliability. |

---

## 7. FormDefinition

**Schema:** `schema/form-definition.schema.json`
**Role:** Satellite schema defining citizen-facing form fields for dynamic form generation. Linked to the catalog by `serviceId`. Defines field types, validation, conditional display logic, and file constraints. Does not define visual rendering.

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | string | MUST | Semantic version of the form-definition schema (e.g. `"1.0.0"`). |
| `serviceId` | string | MUST | Links to the catalog record. Must match a known catalog `serviceId` (BR-011). |
| `catalogSchemaVersion` | string | MUST | Catalog `schemaVersion` this form was derived from. Used to detect catalog drift. |
| `generatedAt` | string (date-time) | MUST | ISO 8601 generation timestamp. |
| `fields` | Field[] | MUST | Form fields. At least 1 required. See [FormField](#8-formdefinition--field). |
| `version` | string \| null | MAY | Version of this form definition (e.g. `"v1"`). |
| `sections` | Section[] | MAY | Named groups for organizing fields in the UI. Fields reference sections by `sectionId`. |
| `source` | object | MAY | Provenance: `generator`, `sourceFile`, `parserVersion`. |

### Section object

| Field | Type | Required | Description |
|---|---|---|---|
| `sectionId` | string | MUST | Unique section identifier within this form. Referenced by `field.sectionId`. |
| `label` | string | MUST | Display name of the section (e.g. `"Identité du demandeur"`). |
| `order` | integer ≥ 1 | MUST | Display sequence position. |
| `description` | string \| null | MAY | Contextual text shown above the section fields. |

---

## 8. FormDefinition — Field

Each item in `formDefinition.fields`.

| Field | Type | Required | Description |
|---|---|---|---|
| `fieldId` | string | MUST | Unique field identifier. Pattern: `^field_[a-z0-9_-]+$` (e.g. `"field_nom"`). Referenced by `condition.fieldId` of dependent fields. |
| `type` | string (enum) | MUST | Field rendering type. See table below. |
| `label` | string | MUST | Display label shown to the applicant. |
| `required` | boolean | MUST | Whether the field must be filled to submit. May be overridden when a `condition` makes the field hidden. |
| `order` | integer ≥ 1 | MUST | Display sequence position within the section or form. |
| `description` | string \| null | MAY | Helper text displayed below the label. |
| `placeholder` | string \| null | MAY | Input placeholder text. |
| `sectionId` | string \| null | MAY | Groups this field under a named section. References `section.sectionId`. |
| `validation` | object | MAY | Validation constraints. See [Validation](#validation-object). |
| `options` | Option[] | MAY | Required when `type=select` or `type=multiselect`. List of selectable values. |
| `fileConstraints` | object | MAY | Required when `type=file`. See [FileConstraints](#fileconstraints-object). |
| `condition` | object | MAY | When present, field is only shown when the condition is satisfied. See [Condition](#condition-object). |
| `mapsToDocumentTypeCode` | string \| null | MAY | Links a `file` field to a `documentTypeCode` in `documentsRequired`. |
| `mapsToWorkflowStepId` | string \| null | MAY | Links this field to the workflow step where its value is consumed. |

### Field type values

| Value | Description |
|---|---|
| `text` | Single-line text input. |
| `textarea` | Multi-line text input. |
| `number` | Numeric input. |
| `date` | Date picker. |
| `select` | Single-choice dropdown. Requires `options`. |
| `multiselect` | Multiple-choice dropdown. Requires `options`. |
| `boolean` | Checkbox or toggle. |
| `file` | File upload. Requires `fileConstraints`. |
| `hidden` | Value passed silently (pre-filled from context, not shown to applicant). |

### Validation object

| Field | Type | Description |
|---|---|---|
| `minLength` | integer \| null | Minimum character count for text fields. |
| `maxLength` | integer \| null | Maximum character count for text fields. |
| `pattern` | string \| null | Regex the value must match (e.g. `"^[0-9]{12}$"`). |
| `min` | number \| null | Minimum value for number or date fields. |
| `max` | number \| null | Maximum value for number or date fields. |

### FileConstraints object

| Field | Type | Description |
|---|---|---|
| `acceptedTypes` | string[] | MIME types or extensions accepted (e.g. `["application/pdf", ".jpg"]`). |
| `maxSizeKb` | integer \| null | Maximum file size in kilobytes. |
| `multiple` | boolean | Whether multiple files can be uploaded. |

### Condition object

| Field | Type | Description |
|---|---|---|
| `fieldId` | string | `fieldId` of the controlling field. |
| `operator` | string (enum) | `equals`, `not_equals`, `contains`, `is_empty`, `is_not_empty`. |
| `value` | string \| number \| boolean \| null | Value to compare against. |

### Option object

| Field | Type | Description |
|---|---|---|
| `value` | string | Machine value submitted on selection. |
| `label` | string | Display text shown to the applicant. |

---

## 9. ExecutionMapping

**Schema:** `schema/execution-mapping.schema.json`
**Role:** Satellite schema defining how each workflow step maps to an executable action in the WBB Service. Linked to the catalog by `serviceId`. Provides action vocabulary, connector references, data mappings, retry policies, and human task configurations. **Internal Profile only — MUST NOT be served publicly.**

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | string | MUST | Semantic version of the execution-mapping schema (e.g. `"1.0.0"`). |
| `serviceId` | string | MUST | Links to the catalog record. Must match a known catalog `serviceId` (BR-011). |
| `catalogSchemaVersion` | string | MUST | Catalog `schemaVersion` this mapping was derived from. Used to detect catalog drift. |
| `mappingVersion` | string | MUST | Version of this mapping record (e.g. `"v1"`). |
| `generatedAt` | string (date-time) | MUST | ISO 8601 generation timestamp. |
| `steps` | MappingStep[] | MUST | Per-step execution definitions. At least 1 required. See [MappingStep](#10-executionmapping--step). |
| `deploymentStatus` | string (enum) | MAY | Lifecycle state in the WBB Service: `draft`, `validated`, `deployed`, `deprecated`. Set by the WBB Service operator. |
| `processId` | string \| null | MAY | GovStack ProcessDefinition ID assigned by the WBB Service on deployment. Null until `deploymentStatus=deployed`. |
| `trigger` | object | MAY | How this process is initiated. See [Trigger](#trigger-object). Defaults to `api` if absent. |
| `source` | object | MAY | Provenance: `generator`, `sourceFile`, `parserVersion`. |

---

## 10. ExecutionMapping — Step

Each item in `executionMapping.steps`. One entry per workflow step.

| Field | Type | Required | Description |
|---|---|---|---|
| `stepId` | string | MUST | Must match a `stepId` in the catalog workflow. Pattern: `^step_[a-z0-9_-]+$`. |
| `action` | string (enum) | MUST | Execution action type. See table below. `custom` requires `connector`. |
| `connector` | string \| null | SHOULD | WBB Service action handler or integration to invoke (e.g. `"http"`, `"email"`, `"form"`, `"approval"`). WBB Service maps this to an engine-specific action internally. Required when `action=custom`. |
| `inputMapping` | object | SHOULD | Key-value map: connector input parameter ← case context variable (e.g. `{"recipientEmail": "{{case.applicant.email}}"}`). |
| `outputMapping` | object | SHOULD | Key-value map: case context variable ← connector output (e.g. `{"caseId": "{{case.id}}"}`). |
| `retryPolicy` | object | MAY | Retry behavior on transient failure. `maxAttempts` (1–10), `backoffSeconds` (≥ 1). |
| `timeout` | integer \| null | MAY | Maximum execution time in seconds before escalation. |
| `humanTask` | object | MAY | Human review task definition. `assigneeRole` (MUST), `dueDays` (MAY), `instructions` (MAY). |
| `onFailure` | string (enum) | MAY | `escalate`: route to `manual_intervention`. `reject`: move case to rejected. `suspend`: pause pending external resolution. |
| `notes` | string \| null | MAY | Implementation notes for this step. Not exposed at runtime. |

### Trigger object

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string (enum) | MUST | Initiation method: `api` (case submission), `cron` (scheduled), `event` (prior process outcome). |
| `cronExpression` | string \| null | MAY | Cron schedule (e.g. `"0 8 * * 1-5"`). Required when `type=cron`. |
| `eventType` | string \| null | MAY | Event type (e.g. `"case.decided"`). Required when `type=event`. |
| `eventSourceProcessId` | string \| null | MAY | `serviceId` of the source process. Used when `type=event`. |

### action values

| Value | Typical stepType | Description |
|---|---|---|
| `case_intake` | `submission` | Register the incoming case and assign a `caseId`. |
| `document_check` | `verification` | Validate submitted documents against requirements. |
| `inspection_schedule` | `inspection` | Schedule and record an on-site inspection. |
| `payment_request` | `payment` | Invoke payment connector and record receipt. |
| `instruction_deliver` | `instruction` | Deliver instructions or a pre-filled form to the citizen. |
| `approval_checkpoint` | `approval` | Route to a human approver with defined deadline. |
| `decision_record` | `decision` | Record the authority decision (approved / rejected / deferred). |
| `notification_send` | `notification` | Send outbound notification (email, SMS, portal). |
| `document_deliver` | `delivery` | Deliver the output document to the citizen. |
| `case_archive` | `archival` | Close the case and write to the audit trail. |
| `custom` | `other` | Custom action — `connector` is required. |

---

## Business rules quick reference

| Rule | Applies to | Expression |
|---|---|---|
| BR-001 | Catalog / Public API | `status=active` → `len(workflow.steps) >= 1` |
| BR-002 | Catalog / Both | All `step.order` values unique |
| BR-003 | Catalog / Both | `step.order` strictly increasing |
| BR-004 | Catalog / Public API | No placeholder step labels |
| BR-005 | Catalog / Both | `fee.summary.ruleCount == len(fee.rules)` |
| BR-006 | Catalog / Both | All monetary values ≥ 0 |
| BR-007 | Catalog / Both | `maxAmount >= minAmount` when both present |
| BR-008 | Catalog / Public API | `workflow.reviewStatus == "approved_auto"` |
| BR-009 | Catalog / Public API | No unresolved blocking `qualityFlags` |
| BR-010 | Catalog / Public API | `fee.model != "unknown"` when `requiresPayment=true` |
| BR-011 | Satellites / Both | `serviceId` in satellite matches a catalog record |
| BR-012 | Catalog / Both | `step.transitions[].targetStepId` is `"END"` or a known `stepId` |
| BR-013 | Catalog / Both | every `documentTypeCode` in `documentsRequired` is an active code in the taxonomy |
