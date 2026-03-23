#!/usr/bin/env node
'use strict'

/**
 * Runs validate.js against all examples in the examples/ directory
 * using the expected profile and catalog for each file.
 *
 * Exit code 0: all pass. Exit code 1: one or more failures.
 */

const { execFileSync } = require('child_process')
const path = require('path')

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples')

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
}

// ─── Test manifest ────────────────────────────────────────────────────────────
// Each entry defines the expected outcome for one example file.
//
//   file     : filename in examples/
//   profile  : 'internal' | 'public'
//   catalog  : catalog file to use for satellite BR-011 check (optional)
//   expectValid : true = expect exit 0, false = expect exit 1

const MANIFEST = [
  {
    file:        'valid-public.json',
    profile:     'public',
    expectValid: true,
    description: 'Valid catalog record — Public API Profile',
  },
  {
    file:        'valid-internal.json',
    profile:     'internal',
    expectValid: true,
    description: 'Valid catalog record — Internal Profile',
  },
  {
    file:        'valid-internal.json',
    profile:     'public',
    expectValid: false,
    description: 'Internal record rejected under Public API Profile (BR-008)',
  },
  {
    file:        'invalid-explained.json',
    profile:     'public',
    expectValid: false,
    description: 'Invalid record — BR-004, BR-005, BR-008 expected',
  },
  {
    file:        'valid-form-definition.json',
    profile:     'public',
    catalog:     'valid-public.json',
    expectValid: true,
    description: 'Valid form-definition satellite with matching catalog',
  },
  {
    file:        'valid-execution-mapping.json',
    profile:     'public',
    catalog:     'valid-public.json',
    expectValid: true,
    description: 'Valid execution-mapping satellite with matching catalog',
  },
]

// ─── Runner ───────────────────────────────────────────────────────────────────

function runCase(entry) {
  const filePath    = path.join(EXAMPLES_DIR, entry.file)
  const catalogPath = entry.catalog ? path.join(EXAMPLES_DIR, entry.catalog) : null

  const nodeArgs = [
    path.join(__dirname, 'validate.js'),
    filePath,
    '--profile', entry.profile,
  ]
  if (catalogPath) nodeArgs.push('--catalog', catalogPath)

  let exitCode = 0
  let output = ''
  try {
    output = execFileSync(process.execPath, nodeArgs, { encoding: 'utf8' })
  } catch (err) {
    exitCode = err.status || 1
    output = err.stdout || ''
  }

  const passed = entry.expectValid ? exitCode === 0 : exitCode === 1

  return { passed, exitCode, output, entry }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log()
console.log(`${C.bold}Running example validation suite${C.reset}`)
console.log(`${C.dim}${MANIFEST.length} test case(s)${C.reset}`)
console.log()

let failures = 0

for (const entry of MANIFEST) {
  const { passed, exitCode, output, entry: e } = runCase(entry)

  const expectedLabel = e.expectValid ? 'VALID' : 'INVALID'
  const icon = passed
    ? `${C.green}✓${C.reset}`
    : `${C.red}✗${C.reset}`

  console.log(`${icon} ${e.description}`)
  console.log(`  ${C.dim}${e.file} [${e.profile}] — expected ${expectedLabel}${C.reset}`)

  if (!passed) {
    failures++
    console.log(`  ${C.red}Expected exit ${e.expectValid ? 0 : 1}, got ${exitCode}${C.reset}`)
    // Print indented output for debugging
    const lines = output.trim().split('\n')
    for (const line of lines) {
      console.log(`  ${C.dim}${line}${C.reset}`)
    }
  }

  console.log()
}

// ─── Summary ──────────────────────────────────────────────────────────────────

const total   = MANIFEST.length
const passing = total - failures

if (failures === 0) {
  console.log(`${C.green}${C.bold}All ${total} test(s) passed.${C.reset}`)
} else {
  console.log(`${C.red}${C.bold}${failures} of ${total} test(s) failed.${C.reset} (${passing} passed)`)
}
console.log()

process.exit(failures > 0 ? 1 : 0)
