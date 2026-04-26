import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { hasValidationWarnings } from './dataValidationReport.js'

describe('data validation report helpers', () => {
  it('treats empty warning sections as clean', () => {
    assert.equal(hasValidationWarnings({
      missingManifest: [],
      unverifiedImages: []
    }), false)
  })

  it('detects any populated warning section', () => {
    assert.equal(hasValidationWarnings({
      missingManifest: [],
      unverifiedImages: [{ id: 'style_id', imageStatus: 'needs-review' }]
    }), true)
  })
})
