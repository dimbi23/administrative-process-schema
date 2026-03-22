# 3. Information Model and Field Dictionary

## 3.1 Root entity: AdministrativeProcedure

The root entity is `AdministrativeProcedure`. At minimum, each record MUST include `schemaVersion`, `generatedAt`, `serviceId`, `name`, `status`, `owner`, `workflow`, and `fee`.

## 3.2 Workflow model

Each workflow object MUST include `schemaVersion`, `version`, `generatedAt`, `steps`, `sourceRaw`, `normalizationConfidence`, and `reviewStatus`. Each step MUST include `stepId`, `order`, `label`, `stepType`, and `confidence`. The `stepId` field follows the pattern `^step_[a-z0-9_-]+$`, and `order` starts at 1.

The `stepType`, `actor`, and `channel` fields use controlled vocabularies defined in the schema. These enums are normative and provide interoperability for publication and execution mapping.

## 3.3 Fee model (merged cost+pricing)

Each fee object MUST include `schemaVersion`, `generatedAt`, `currency`, `model`, `rules`, and `summary`. The current schema constrains `currency` to `MGA` and constrains `model` to `fixed`, `conditional`, `range`, `composite`, `percentage`, or `unknown`.

Rule-level conditional constraints are enforced by schema logic: `fixed` rules require `amount`, `range` rules require `minAmount` and `maxAmount`, and `percentage` rules require `percentage`.

## 3.4 Documents model

Each `documentsRequired[]` entry SHOULD include `documentTypeCode`, `label`, and `requirementLevel`, and MAY include `condition` when a requirement is context-dependent.

## 3.5 Business consistency rules (core)

Beyond structural schema checks, implementations MUST enforce a small set of consistency rules. The `fee.summary.ruleCount` value MUST match the number of items in `fee.rules`. Monetary values MUST be greater than or equal to zero, and where both minimum and maximum values are present, `maxAmount` MUST be greater than or equal to `minAmount`. As a policy rule, `status=active` SHOULD imply a non-empty and execution-ready workflow.
