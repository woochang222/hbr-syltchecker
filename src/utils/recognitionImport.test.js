import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRecognitionImport, mergeRecognitionImport } from './recognitionImport.js'

const styles = [{ id: 'a' }, { id: 'b' }]
const parse = rows => parseRecognitionImport(JSON.stringify({ format: 'hbr-style-recognition', version: 1, styles: rows }), styles)

test('merges zero and explicit false without losing unrelated or unread values', () => {
  const rows = parse([{ id: 'a', limitBreak: 0, daphne: false }, { id: 'b', limitBreak: null, daphne: null }])
  const owned = { a: 3, b: 4 }
  const daphne = { a: true, b: true }
  assert.deepEqual(mergeRecognitionImport(rows, owned, daphne), { ownedStyles: { a: 0, b: 4 }, daphneStyles: { b: true } })
  assert.equal(owned.a, 3)
  assert.equal(daphne.a, true)
})
test('deduplicates complementary results and rejects conflicts', () => {
  assert.deepEqual(parse([{ id: 'a', limitBreak: 2 }, { id: 'a', daphne: true }]), [{ id: 'a', limitBreak: 2, daphne: true }])
  assert.throws(() => parse([{ id: 'a', limitBreak: 2 }, { id: 'a', limitBreak: 3 }]))
})
test('rejects malformed data, unknown IDs and invalid values', () => {
  for (const row of [{ id: '__proto__', limitBreak: 1 }, { id: 'a', limitBreak: '2' }, { id: 'a', limitBreak: 5 }, { id: 'a', daphne: 'false' }]) assert.throws(() => parse([row]))
  assert.throws(() => parseRecognitionImport('{}', styles))
  assert.throws(() => parseRecognitionImport('not json', styles))
})
