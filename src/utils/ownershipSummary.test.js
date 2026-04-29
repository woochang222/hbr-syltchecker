import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatOwnershipSummary } from './ownershipSummary.js'

describe('formatOwnershipSummary', () => {
  it('formats owned, total, rate, visible style counts, and Daphne count', () => {
    assert.deepEqual(
      formatOwnershipSummary({
        totalOwned: 84,
        totalStyles: 212,
        ownershipRate: 39,
        visibleStyleCount: 120,
        daphneCount: 7
      }),
      {
        ownershipLabel: '보유 84 / 212',
        rateLabel: '39%',
        visibleLabel: '표시 120',
        daphneLabel: '다프네 7'
      }
    )
  })

  it('keeps zero counts stable', () => {
    assert.deepEqual(
      formatOwnershipSummary({
        totalOwned: 0,
        totalStyles: 0,
        ownershipRate: 0,
        visibleStyleCount: 0,
        daphneCount: 0
      }),
      {
        ownershipLabel: '보유 0 / 0',
        rateLabel: '0%',
        visibleLabel: '표시 0',
        daphneLabel: '다프네 0'
      }
    )
  })
})
