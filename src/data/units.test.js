import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { FILTER_UNITS } from './units.js'

describe('filter units', () => {
  it('includes the command unit in the unit filter list', () => {
    assert.deepEqual(
      FILTER_UNITS,
      ['31A', '31B', '31C', '30G', '31D', '31E', '31F', '31X', '사령부', 'AB']
    )
  })
})
