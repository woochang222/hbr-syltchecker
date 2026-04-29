import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildOwnedStatusSummaryLabels,
  buildOwnedStatusTileClassName
} from './ownedStatusExportPresentation.js'

describe('buildOwnedStatusSummaryLabels', () => {
  it('includes Daphne count in the exported board summary', () => {
    assert.deepEqual(
      buildOwnedStatusSummaryLabels({
        totalOwned: 42,
        totalStyles: 120,
        ownershipRate: 35,
        daphneCount: 7
      }),
      ['보유 42 / 120', '35%', '다프네 7']
    )
  })
})

describe('buildOwnedStatusTileClassName', () => {
  it('marks exported tiles that have Daphne applied', () => {
    assert.equal(
      buildOwnedStatusTileClassName({
        isOwned: true,
        ownedCount: 4,
        hasBaseLimitBreakBoost: true,
        hasDaphne: true
      }),
      'owned-export-tile owned count-4 base-boosted has-daphne'
    )
  })
})
