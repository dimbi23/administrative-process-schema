# 4. Public API Profile and Quality Gates

## 4.1 Objective

Define strict rules for records exposed in public portal/API.

## 4.2 Mandatory publication checks

A record is publishable only if:
1. structural validation passes,
2. workflow is non-empty,
3. no placeholder labels,
4. no blocking quality flags,
5. review status is publishable,
6. fee model is coherent with rules.

## 4.3 Blocking quality conditions

By default, these conditions are blocking:
- empty workflow,
- unresolved manual-required workflow,
- invalid step ordering,
- invalid fee rule structure,
- unresolved critical document requirement ambiguity.

## 4.4 Non-blocking conditions

These MAY be published with warning (policy-controlled):
- missing non-critical optional metadata,
- unknown channel with manual review note,
- incomplete support contact details.

## 4.5 Publication checklist

- [ ] Schema validation pass
- [ ] Business rules pass
- [ ] Quality gate pass
- [ ] Review status pass
- [ ] Changelog updated (if schema changed)

## 4.6 Traceability requirements

Published records SHOULD maintain traceability metadata:
- generation timestamp,
- source reference,
- parser/version reference,
- review decision reference.
