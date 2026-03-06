#!/usr/bin/env node
/**
 * Contract Copilot — QA Evaluation Runner
 *
 * Usage:
 *   node docs/eval-runner.js --doc <documentId> [--set <evalSetPath>]
 *
 * Prerequisites:
 *   - Backend running at http://localhost:4000
 *   - A document already uploaded and analyzed (get its ID from the dashboard)
 *
 * Metrics reported:
 *   - Answer rate      : % of questions that returned a non-empty answer
 *   - Citation rate    : % of answers that included at least one citation
 *   - Clause keyword hit : % of answers where the expected clause keyword appears
 *                          in the answer text or citation snippets
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, isAbsolute, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'http://localhost:4000'

// ---- Parse args ----
const args = process.argv.slice(2)

function getArgValue(flag) {
  const idx = args.indexOf(flag)
  return idx === -1 ? undefined : args[idx + 1]
}

const documentId = getArgValue('--doc')
const setArg = getArgValue('--set')

if (!documentId) {
  console.error('Usage: node docs/eval-runner.js --doc <documentId> [--set <evalSetPath>]')
  process.exit(1)
}

// ---- Load eval set ----
const evalSetPath = setArg
  ? (isAbsolute(setArg) ? setArg : resolve(process.cwd(), setArg))
  : join(__dirname, 'eval-set.json')

let evalSet
try {
  evalSet = JSON.parse(readFileSync(evalSetPath, 'utf-8'))
} catch (e) {
  console.error(`Failed to load eval set from: ${evalSetPath}`)
  console.error(`Error: ${e.message}`)
  process.exit(1)
}

// ---- Run ----
console.log(`\nEval runner — document: ${documentId}`)
console.log(`Eval set: ${evalSetPath}`)
console.log(`Questions: ${evalSet.length}\n`)
console.log('─'.repeat(60))

let answered = 0
let hasCitations = 0
let clauseHit = 0

for (const item of evalSet) {
  console.log(`\nQ: ${item.question}`)
  console.log(`   Expected clause: "${item.expectedClause}"`)

  let result
  try {
    const res = await fetch(`${BASE_URL}/api/documents/${documentId}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: item.question }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      console.log(`   ERROR ${res.status}: ${err.error}`)
      continue
    }
    result = await res.json()
  } catch (e) {
    console.log(`   NETWORK ERROR: ${e.message}`)
    continue
  }

  const { answer, citations = [] } = result

  if (answer && answer.trim().length > 0) answered++
  if (citations.length > 0) hasCitations++

  // Clause keyword hit: check answer text + all citation snippets
  const keyword = item.expectedClause.toLowerCase()
  const searchText = [answer, ...citations.map((c) => c.snippet)].join(' ').toLowerCase()
  const hit = searchText.includes(keyword)
  if (hit) clauseHit++

  console.log(`   Answer: ${answer?.slice(0, 120)}${answer?.length > 120 ? '…' : ''}`)
  console.log(`   Citations: ${citations.length}   Clause keyword hit: ${hit ? 'YES' : 'NO'}`)
}

// ---- Summary ----
const n = evalSet.length
console.log('\n' + '─'.repeat(60))
console.log('RESULTS')
console.log('─'.repeat(60))
console.log(`Answer rate        : ${answered}/${n} (${pct(answered, n)}%)`)
console.log(`Citation rate      : ${hasCitations}/${n} (${pct(hasCitations, n)}%)`)
console.log(`Clause keyword hit : ${clauseHit}/${n} (${pct(clauseHit, n)}%)`)
console.log('')

function pct(num, den) {
  return den === 0 ? 0 : Math.round((num / den) * 100)
}
