#!/usr/bin/env node
'use strict'

const Ajv = require('ajv/dist/2020')
const addFormats = require('ajv-formats')
const fs = require('fs')
const path = require('path')

const SCHEMA_DIR = path.join(__dirname, '..', 'schema')

// ─── Terminal colours ─────────────────────────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
}

const icon = {
  pass: `${C.green}✓${C.reset}`,
  fail: `${C.red}✗${C.reset}`,
  warn: `${C.yellow}⚠${C.reset}`,
  info: `${C.cyan}i${C.reset}`,
}

// ─── Schema detection ─────────────────────────────────────────────────────────

function detectSchemaType(record) {
  if (record.workflow !== undefined && record.fee !== undefined) return 'catalog'
  if (record.fields !== undefined && record.catalogSchemaVersion !== undefined) return 'form-definition'
  if (record.mappingVersion !== undefined && record.steps !== undefined) return 'execution-mapping'
  return null
}

const SCHEMA_IDS = {
  'catalog':           'https://dimbinirina.dev/schemas/procedures/administrative-procedure.schema.json',
  'form-definition':   'https://dimbinirina.dev/schemas/procedures/form-definition.schema.json',
  'execution-mapping': 'https://dimbinirina.dev/schemas/procedures/execution-mapping.schema.json',
}

const SCHEMA_FILES = [
  'administrative-procedure.schema.json',
  'workflow.schema.json',
  'fee.schema.json',
  'document-requirement.schema.json',
  'form-definition.schema.json',
  'execution-mapping.schema.json',
]

// ─── AJV setup ────────────────────────────────────────────────────────────────

function buildValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  for (const file of SCHEMA_FILES) {
    const schema = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8'))
    ajv.addSchema(schema)
  }
  return ajv
}

// ─── Taxonomy loader ──────────────────────────────────────────────────────────

/**
 * Parse document_taxonomy.csv and return a Set of active documentCode values.
 * Assumes documentCode is always the first column (no commas in that field).
 */
function loadTaxonomy(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n')
  const codes = new Set()
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',')
    const code   = fields[0].trim()
    const active = (fields[11] || '').trim()
    if (code && active === 'true') codes.add(code)
  }
  return codes
}

// ─── Business rules ───────────────────────────────────────────────────────────

const PLACEHOLDER_RE = /^étape sans libellé/i
const BLOCKING_FLAGS = new Set(['missing_label_autofilled'])

/**
 * Each violation: { rule, message, level }
 * level defaults to 'BLOCK'; use 'WARNING' for non-blocking.
 */
function checkCatalogRules(record, profile, taxonomy) {
  const v = []
  const { workflow, fee } = record

  // BR-001 — active procedure must have executable workflow
  if (profile === 'public' && record.status === 'active') {
    if (!workflow.steps || workflow.steps.length < 1) {
      v.push({ rule: 'BR-001', message: 'Active procedure must have at least one workflow step.' })
    }
  }

  const orders = (workflow.steps || []).map(s => s.order)

  // BR-002 — step order uniqueness
  if (new Set(orders).size !== orders.length) {
    v.push({ rule: 'BR-002', message: `Duplicate step order values detected: [${orders.join(', ')}].` })
  }

  // BR-003 — step order monotonicity
  for (let i = 1; i < orders.length; i++) {
    if (orders[i] <= orders[i - 1]) {
      v.push({ rule: 'BR-003', message: `Step orders are not strictly increasing at position ${i}: ${orders[i - 1]} → ${orders[i]}.` })
      break
    }
  }

  // BR-004 — no placeholder labels in public profile
  if (profile === 'public') {
    for (const step of workflow.steps || []) {
      if (PLACEHOLDER_RE.test(step.label)) {
        v.push({ rule: 'BR-004', message: `Step "${step.stepId}" has a placeholder label: "${step.label}".` })
      }
    }
  }

  // BR-005 — fee rule count consistency
  const actualCount = (fee.rules || []).length
  if (fee.summary.ruleCount !== actualCount) {
    v.push({
      rule: 'BR-005',
      message: `fee.summary.ruleCount is ${fee.summary.ruleCount} but fee.rules contains ${actualCount} item(s).`,
    })
  }

  // BR-006 — monetary values >= 0
  const monetaryChecks = [
    ['fee.summary.minAmount',     fee.summary.minAmount],
    ['fee.summary.maxAmount',     fee.summary.maxAmount],
    ['fee.summary.defaultAmount', fee.summary.defaultAmount],
  ]
  for (const rule of fee.rules || []) {
    monetaryChecks.push([`fee.rules[${rule.ruleId}].amount`,    rule.amount])
    monetaryChecks.push([`fee.rules[${rule.ruleId}].minAmount`, rule.minAmount])
    monetaryChecks.push([`fee.rules[${rule.ruleId}].maxAmount`, rule.maxAmount])
  }
  for (const [field, val] of monetaryChecks) {
    if (val !== null && val !== undefined && val < 0) {
      v.push({ rule: 'BR-006', message: `${field} is negative (${val}).` })
    }
  }

  // BR-007 — range coherence
  const rangePairs = [
    ['fee.summary', fee.summary.minAmount, fee.summary.maxAmount],
    ...((fee.rules || []).map(r => [`fee.rules[${r.ruleId}]`, r.minAmount, r.maxAmount])),
  ]
  for (const [label, min, max] of rangePairs) {
    if (min !== null && min !== undefined && max !== null && max !== undefined && max < min) {
      v.push({ rule: 'BR-007', message: `${label}: maxAmount (${max}) is less than minAmount (${min}).` })
    }
  }

  // BR-008 — publishable review status
  if (profile === 'public' && workflow.reviewStatus !== 'approved_auto') {
    v.push({
      rule: 'BR-008',
      message: `workflow.reviewStatus is "${workflow.reviewStatus}". Only "approved_auto" is publishable in the Public API Profile.`,
    })
  }

  // BR-009 — no unresolved blocking quality flags
  if (profile === 'public') {
    for (const step of workflow.steps || []) {
      for (const flag of step.qualityFlags || []) {
        if (BLOCKING_FLAGS.has(flag)) {
          v.push({
            rule: 'BR-009',
            message: `Step "${step.stepId}" has unresolved blocking quality flag: "${flag}".`,
          })
        }
      }
    }
  }

  // BR-012 — transition targetStepId references a known stepId or END
  const stepIds = new Set((workflow.steps || []).map(s => s.stepId))
  for (const step of workflow.steps || []) {
    for (const t of step.transitions || []) {
      if (t.targetStepId !== 'END' && !stepIds.has(t.targetStepId)) {
        v.push({
          rule: 'BR-012',
          message: `Step "${step.stepId}" has a transition "${t.transitionId}" pointing to unknown targetStepId "${t.targetStepId}".`,
        })
      }
    }
  }

  // BR-013 — documentTypeCode taxonomy conformance
  if (taxonomy === null) {
    v.push({
      rule: 'BR-013',
      level: 'WARNING',
      message: 'No --taxonomy file provided. Cannot verify documentTypeCode taxonomy conformance.',
    })
  } else {
    for (const doc of record.documentsRequired || []) {
      if (!taxonomy.has(doc.documentTypeCode)) {
        v.push({
          rule: 'BR-013',
          message: `documentsRequired entry "${doc.documentTypeCode}" is not a known active code in the document taxonomy.`,
        })
      }
    }
  }

  // BR-010 — unknown fee model with payment step
  if (profile === 'public' && fee.model === 'unknown') {
    const paymentSteps = (workflow.steps || []).filter(
      s => s.stepType === 'payment' || s.requiresPayment === true
    )
    if (paymentSteps.length > 0) {
      const isHard = paymentSteps.some(s => s.requiresPayment === true)
      v.push({
        rule: 'BR-010',
        level: isHard ? 'BLOCK' : 'WARNING',
        message: `fee.model is "unknown" but procedure has payment step(s): [${paymentSteps.map(s => s.stepId).join(', ')}].`,
      })
    }
  }

  return v
}

function checkSatelliteRules(record, catalog) {
  const v = []

  // BR-011 — satellite referential integrity
  if (catalog === null) {
    v.push({
      rule: 'BR-011',
      level: 'WARNING',
      message: 'No --catalog file provided. Cannot verify serviceId referential integrity.',
    })
  } else if (record.serviceId !== catalog.serviceId) {
    v.push({
      rule: 'BR-011',
      message: `serviceId "${record.serviceId}" does not match catalog serviceId "${catalog.serviceId}".`,
    })
  }

  return v
}

// ─── Reporting ────────────────────────────────────────────────────────────────

function printSchemaErrors(errors) {
  for (const err of errors) {
    const loc = err.instancePath || '(root)'
    console.log(`     ${C.dim}${loc}${C.reset} — ${err.message}`)
    if (err.params && Object.keys(err.params).length) {
      console.log(`     ${C.dim}  → ${JSON.stringify(err.params)}${C.reset}`)
    }
  }
}

function printViolations(violations) {
  for (const v of violations) {
    const level = v.level === 'WARNING' ? icon.warn : icon.fail
    const ruleLabel = `${C.bold}${v.rule}${C.reset}`
    console.log(`     ${level} ${ruleLabel} ${v.message}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2)
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp()
    process.exit(0)
  }
  const filePath      = args[0]
  const profileIdx    = args.indexOf('--profile')
  const profile       = profileIdx !== -1 ? args[profileIdx + 1] : 'public'
  const catalogIdx    = args.indexOf('--catalog')
  const catalogPath   = catalogIdx !== -1 ? args[catalogIdx + 1] : null
  const taxonomyIdx   = args.indexOf('--taxonomy')
  const taxonomyPath  = taxonomyIdx !== -1 ? args[taxonomyIdx + 1] : null

  if (!['internal', 'public'].includes(profile)) {
    console.error(`${C.red}Error:${C.reset} Unknown profile "${profile}". Use "internal" or "public".`)
    process.exit(2)
  }
  return { filePath, profile, catalogPath, taxonomyPath }
}

function printHelp() {
  console.log(`
${C.bold}Administrative Procedure Validator${C.reset}

  Validates a JSON record against its schema and checks business rules BR-001–BR-013.

${C.bold}Usage:${C.reset}
  node validate.js <file> [options]

${C.bold}Options:${C.reset}
  --profile <internal|public>   Conformance profile to validate against (default: public)
  --catalog <file>              Catalog JSON for satellite BR-011 referential integrity check
  --taxonomy <file>             document_taxonomy.csv for BR-013 documentTypeCode conformance check
  --help, -h                    Show this help

${C.bold}Exit codes:${C.reset}
  0   Valid (no violations, warnings allowed)
  1   Invalid (schema errors or blocking rule violations)
  2   Execution error (file not found, parse error, unknown schema type)

${C.bold}Examples:${C.reset}
  node validate.js ../examples/valid-public.json --taxonomy ../taxonomy/document_taxonomy.csv
  node validate.js ../examples/valid-internal.json --profile internal
  node validate.js ../examples/valid-form-definition.json --catalog ../examples/valid-public.json
`)
}

function run({ filePath, profile, catalogPath, taxonomyPath }) {
  // Load record
  let record
  try {
    record = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (e) {
    console.error(`${C.red}Error:${C.reset} Cannot read "${filePath}": ${e.message}`)
    process.exit(2)
  }

  // Load catalog if provided
  let catalog = null
  if (catalogPath) {
    try {
      catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
    } catch (e) {
      console.error(`${C.red}Error:${C.reset} Cannot read catalog "${catalogPath}": ${e.message}`)
      process.exit(2)
    }
  }

  // Load taxonomy if provided
  let taxonomy = null
  if (taxonomyPath) {
    try {
      taxonomy = loadTaxonomy(taxonomyPath)
    } catch (e) {
      console.error(`${C.red}Error:${C.reset} Cannot read taxonomy "${taxonomyPath}": ${e.message}`)
      process.exit(2)
    }
  }

  // Detect schema type
  const schemaType = detectSchemaType(record)
  if (!schemaType) {
    console.error(`${C.red}Error:${C.reset} Cannot detect schema type for "${path.basename(filePath)}".`)
    process.exit(2)
  }

  // Header
  console.log()
  console.log(`${C.bold}File    :${C.reset} ${path.basename(filePath)}`)
  console.log(`${C.bold}Type    :${C.reset} ${schemaType}`)
  console.log(`${C.bold}Profile :${C.reset} ${profile}`)
  if (catalog) console.log(`${C.bold}Catalog :${C.reset} ${path.basename(catalogPath)}`)
  if (taxonomy) console.log(`${C.bold}Taxonomy:${C.reset} ${path.basename(taxonomyPath)} (${taxonomy.size} active codes)`)
  console.log()

  // 1. Structural schema validation
  let schemaValid
  try {
    const ajv = buildValidator()
    const validateFn = ajv.getSchema(SCHEMA_IDS[schemaType])
    schemaValid = validateFn(record)
    if (schemaValid) {
      console.log(`  ${icon.pass} Schema validation`)
    } else {
      console.log(`  ${icon.fail} Schema validation — ${validateFn.errors.length} error(s)`)
      printSchemaErrors(validateFn.errors)
    }
  } catch (e) {
    console.error(`  ${icon.fail} Schema validation — ${e.message}`)
    schemaValid = false
  }

  // 2. Business rules
  const violations = schemaType === 'catalog'
    ? checkCatalogRules(record, profile, taxonomy)
    : checkSatelliteRules(record, catalog)

  const blocks   = violations.filter(v => v.level !== 'WARNING')
  const warnings = violations.filter(v => v.level === 'WARNING')

  if (blocks.length === 0 && warnings.length === 0) {
    console.log(`  ${icon.pass} Business rules`)
  } else if (blocks.length === 0) {
    console.log(`  ${icon.warn} Business rules — ${warnings.length} warning(s)`)
    printViolations(warnings)
  } else {
    console.log(`  ${icon.fail} Business rules — ${blocks.length} violation(s)${warnings.length ? `, ${warnings.length} warning(s)` : ''}`)
    printViolations([...blocks, ...warnings])
  }

  // 3. Result
  const isValid = schemaValid && blocks.length === 0
  console.log()
  if (isValid && warnings.length === 0) {
    console.log(`  ${C.green}${C.bold}VALID${C.reset}`)
  } else if (isValid) {
    console.log(`  ${C.yellow}${C.bold}VALID${C.reset} ${C.dim}(with warnings)${C.reset}`)
  } else {
    console.log(`  ${C.red}${C.bold}INVALID${C.reset}`)
  }
  console.log()

  return isValid
}

const { filePath, profile, catalogPath, taxonomyPath } = parseArgs(process.argv)
const valid = run({ filePath, profile, catalogPath, taxonomyPath })
process.exit(valid ? 0 : 1)
