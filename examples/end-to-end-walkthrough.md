# End-to-End Example Walkthrough — MID-EXAMPLE-002

This walkthrough shows how the three schema artifacts for a single procedure relate to each other. All three files share the same `serviceId: "MID-EXAMPLE-002"`.

---

## Files

| File | Schema | Profile |
|---|---|---|
| `valid-public.json` | `administrative-procedure.schema.json` | Public API |
| `valid-form-definition.json` | `form-definition.schema.json` | Form (public) |
| `valid-execution-mapping.json` | `execution-mapping.schema.json` | Execution (internal only) |

---

## Linking key: serviceId

```
valid-public.json              serviceId: "MID-EXAMPLE-002"
valid-form-definition.json     serviceId: "MID-EXAMPLE-002"  ← same
valid-execution-mapping.json   serviceId: "MID-EXAMPLE-002"  ← same
```

The `serviceId` is the authoritative cross-schema linking key (BR-011). A satellite record whose `serviceId` does not match a known catalog record is invalid.

---

## Version anchor: catalogSchemaVersion

Both satellites declare which version of the catalog they were derived from:

```
valid-public.json              schemaVersion: "2.0.0"
valid-form-definition.json     catalogSchemaVersion: "2.0.0"  ← derived from 2.0.0
valid-execution-mapping.json   catalogSchemaVersion: "2.0.0"  ← derived from 2.0.0
```

If the catalog is later updated to `2.1.0`, the satellites remain valid for in-flight cases. New cases started against `2.1.0` require updated satellites declaring `catalogSchemaVersion: "2.1.0"`.

---

## Workflow step linkage

The three catalog steps are the spine that both satellites reference:

```
Catalog workflow steps
  step_1  "Soumission du dossier"    (submission)
  step_2  "Vérification administrative" (verification)
  step_3  "Notification de décision"   (notification)
```

**Form definition** — fields reference the step where their value is consumed:
```
field_nom              mapsToWorkflowStepId: "step_1"
field_cin              mapsToWorkflowStepId: "step_1"
field_type_demandeur   mapsToWorkflowStepId: "step_1"
field_num_stat         mapsToWorkflowStepId: "step_1"  (conditional on entreprise)
field_doc_cin          mapsToWorkflowStepId: "step_1"
field_doc_justificatif mapsToWorkflowStepId: "step_1"
```

**Execution mapping** — each step maps to a WBB Service action:
```
step_1  → case_intake       (connector: form)
step_2  → document_check    (connector: http, humanTask: agent_verificateur)
step_3  → notification_send (connector: email)
```

---

## Document type linkage

`documentsRequired` in the catalog declares the document type codes. Form fields reference these codes via `mapsToDocumentTypeCode`:

```
Catalog documentsRequired
  CIN_COPY       "Copie de la carte d'identité nationale"   required
  DOMICILE_PROOF "Justificatif de domicile"                 optional

Form fields
  field_doc_cin          mapsToDocumentTypeCode: "CIN_COPY"
  field_doc_justificatif mapsToDocumentTypeCode: "DOMICILE_PROOF"
```

The portal form renderer uses these links to display the correct label and upload requirement level alongside each file field.

---

## Derivation chain

```
valid-public.json  (AdministrativeProcedure, status: active)
    │
    ├── valid-form-definition.json
    │       Portal renders form → citizen submits case
    │
    └── valid-execution-mapping.json  (deploymentStatus: deployed)
            processId: "proc_mid_example_002_v1"
            WBB Service registered this as a ProcessDefinition
            Case API calls POST /processes/MID-EXAMPLE-002/start
            WBB Service executes via n8n internally
```

---

## Running the validator

```bash
# Validate catalog (public profile)
node validator/validate.js examples/valid-public.json

# Validate form definition (satellite)
node validator/validate.js examples/valid-form-definition.json --catalog examples/valid-public.json

# Validate execution mapping (satellite, internal profile)
node validator/validate.js examples/valid-execution-mapping.json --profile internal --catalog examples/valid-public.json
```

All three should exit `0` (VALID).
