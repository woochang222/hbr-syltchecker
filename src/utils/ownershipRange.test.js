import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_OWNERSHIP_RANGE,
  buildOwnershipRangeLabel,
  matchesOwnershipRange,
  normalizeOwnershipRange
} from './ownershipRange.js'

describe('normalizeOwnershipRange', () => {
  it('keeps the full unowned-to-four range as the default', () => {
    assert.deepEqual(normalizeOwnershipRange([-1, 4]), DEFAULT_OWNERSHIP_RANGE)
  })

  it('sorts reversed slider handles', () => {
    assert.deepEqual(normalizeOwnershipRange([3, 1]), [1, 3])
  })

  it('clamps handles to the supported ownership range', () => {
    assert.deepEqual(normalizeOwnershipRange([-5, 7]), DEFAULT_OWNERSHIP_RANGE)
  })
})

describe('matchesOwnershipRange', () => {
  it('treats unowned styles as -1 and includes everything in the default range', () => {
    assert.equal(matchesOwnershipRange(undefined, [-1, 4]), true)
    assert.equal(matchesOwnershipRange(0, [-1, 4]), true)
    assert.equal(matchesOwnershipRange(4, [-1, 4]), true)
  })

  it('filters to owned styles with the zero-to-four range', () => {
    assert.equal(matchesOwnershipRange(undefined, [0, 4]), false)
    assert.equal(matchesOwnershipRange(0, [0, 4]), true)
    assert.equal(matchesOwnershipRange(4, [0, 4]), true)
  })

  it('supports above, below, and middle ranges', () => {
    assert.equal(matchesOwnershipRange(1, [2, 4]), false)
    assert.equal(matchesOwnershipRange(2, [2, 4]), true)
    assert.equal(matchesOwnershipRange(undefined, [-1, 1]), true)
    assert.equal(matchesOwnershipRange(2, [-1, 1]), false)
    assert.equal(matchesOwnershipRange(2, [1, 3]), true)
    assert.equal(matchesOwnershipRange(4, [1, 3]), false)
  })
})

describe('buildOwnershipRangeLabel', () => {
  it('omits the default full range', () => {
    assert.equal(buildOwnershipRangeLabel([-1, 4]), null)
  })

  it('labels common slider ranges', () => {
    assert.equal(buildOwnershipRangeLabel([0, 4]), '보유만')
    assert.equal(buildOwnershipRangeLabel([2, 4]), '돌파 2개 이상')
    assert.equal(buildOwnershipRangeLabel([-1, 1]), '돌파 1개 이하')
    assert.equal(buildOwnershipRangeLabel([1, 3]), '돌파 1~3개')
    assert.equal(buildOwnershipRangeLabel([-1, -1]), '미보유')
  })
})
