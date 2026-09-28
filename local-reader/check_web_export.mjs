import fs from 'node:fs'
import assert from 'node:assert/strict'
import { parseRecognitionImport, mergeRecognitionImport } from '../src/utils/recognitionImport.js'

const payload = fs.readFileSync(new URL('./build/smoke-payload.json', import.meta.url), 'utf8')
const catalog = JSON.parse(fs.readFileSync(new URL('../src/data/styles.json', import.meta.url), 'utf8'))
const rows = parseRecognitionImport(payload, catalog)
const next = mergeRecognitionImport(rows, { unrelated: 4 }, { kayamori_ruka_base: true })
assert.deepEqual(next, {
  ownedStyles: { unrelated: 4, kayamori_ruka_base: 0 },
  daphneStyles: { kayamori_ruka_base: true }
})
console.log('Desktop payload -> web parser -> preserved local state: PASS')
