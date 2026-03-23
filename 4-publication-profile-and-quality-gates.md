# 4. Public API Profile and Quality Gates

## 4.1 Objective

This section defines the publishability policy for records exposed through public portals and APIs.

## 4.2 Mandatory publication checks

A catalog record is publishable only when structural validation passes, the workflow is non-empty, workflow labels are not placeholders, no blocking quality conditions remain unresolved, review status is in a publishable state (`approved_auto`), and the fee model is coherent with its rules.

## 4.3 Blocking quality conditions

By default, publication is blocked for empty workflows, unresolved `manual_required` workflow states, invalid step ordering, invalid fee rule structures, and unresolved critical ambiguity in document requirements.

## 4.4 Non-blocking conditions

Some conditions MAY be published with warnings according to policy. Typical examples include missing non-critical optional metadata, an unknown channel accompanied by a manual review note, or incomplete support contact details.

## 4.5 Publication checklist

**Catalog record:**
- [ ] Schema validation pass
- [ ] Business rules pass (BR-001 through BR-010)
- [ ] Quality gate pass
- [ ] Review status is `approved_auto`
- [ ] Changelog updated (if schema changed)

**Satellite records (policy decision):**
- [ ] A `form-definition` record SHOULD exist for any procedure published to a citizen-facing portal. Absence is a non-blocking warning at this stage of rollout.
- [ ] An `execution-mapping` record SHOULD exist for any procedure integrated with the workflow building block. Absence is a non-blocking warning until workflow integration is required.
- [ ] If satellite records exist, BR-011 (referential integrity) MUST pass.

## 4.6 Traceability requirements

Published records SHOULD preserve traceability metadata, including generation timestamp, source reference, parser/version reference, and review decision reference. Satellite records SHOULD declare the catalog `schemaVersion` they were derived from.
