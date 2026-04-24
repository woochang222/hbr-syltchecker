import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_FILTERS,
  DEFAULT_HIGHLIGHT_LATEST,
  resetFilterState
} from './filterState.js'

describe('filter state defaults', () => {
  it('resets every filter, search, and active meta team while preserving view mode', () => {
    const result = resetFilterState()

    assert.deepEqual(result.filters, DEFAULT_FILTERS)
    assert.equal(result.searchTerm, '')
    assert.equal(result.activeMetaTeam, null)
  })

  it('highlights latest styles by default', () => {
    assert.equal(DEFAULT_HIGHLIGHT_LATEST, true)
  })
})
