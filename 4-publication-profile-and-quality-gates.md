# 4. Public API Profile and Quality Gates

## 4.1 Objective

This section defines the publishability policy for records exposed through public portals and APIs.

## 4.2 Mandatory publication checks

A record is publishable only when structural validation passes, the workflow is non-empty, workflow labels are not placeholders, no blocking quality conditions remain unresolved, review status is in a publishable state, and the fee model is coherent with its rules.

## 4.3 Blocking quality conditions

By default, publication is blocked for empty workflows, unresolved manual-required workflow states, invalid step ordering, invalid fee rule structures, and unresolved critical ambiguity in document requirements.

## 4.4 Non-blocking conditions

Some conditions MAY be published with warnings according to policy. Typical examples include missing non-critical optional metadata, an unknown channel accompanied by a manual review note, or incomplete support contact details.

## 4.5 Publication checklist

- [ ] Schema validation pass
- [ ] Business rules pass
- [ ] Quality gate pass
- [ ] Review status pass
- [ ] Changelog updated (if schema changed)

## 4.6 Traceability requirements

Published records SHOULD preserve traceability metadata, including generation timestamp, source reference, parser/version reference, and review decision reference.
