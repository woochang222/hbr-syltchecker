import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DAPHNE_STATUS_APPLIED,
  DAPHNE_STATUS_UNAPPLIED,
  countDaphneStyles,
  hasDaphneStyle,
  matchesDaphneStatus,
  normalizeDaphneStyles,
  toggleDaphneStyle
} from './daphneStyles.js'

describe('normalizeDaphneStyles', () => {
  it('keeps only style ids with a true Daphne value', () => {
    assert.deepEqual(
      normalizeDaphneStyles({
        ruka_base: true,
        yuki_base: false,
        seira_base: 1,
        tama_base: 'true'
      }),
      { ruka_base: true }
    )
  })

  it('returns an empty object for invalid persisted values', () => {
    assert.deepEqual(normalizeDaphneStyles(null), {})
    assert.deepEqual(normalizeDaphneStyles(['ruka_base']), {})
  })
})

describe('toggleDaphneStyle', () => {
  it('adds a true value when a style does not have Daphne', () => {
    assert.deepEqual(toggleDaphneStyle({}, 'ruka_base'), { ruka_base: true })
  })

  it('removes a style when it already has Daphne', () => {
    assert.deepEqual(
      toggleDaphneStyle({ ruka_base: true, yuki_base: true }, 'ruka_base'),
      { yuki_base: true }
    )
  })
})

describe('hasDaphneStyle', () => {
  it('treats only true as applied', () => {
    assert.equal(hasDaphneStyle({ ruka_base: true }, 'ruka_base'), true)
    assert.equal(hasDaphneStyle({ ruka_base: false }, 'ruka_base'), false)
    assert.equal(hasDaphneStyle({}, 'ruka_base'), false)
  })
})

describe('countDaphneStyles', () => {
  it('counts true Daphne entries', () => {
    assert.equal(countDaphneStyles({ ruka_base: true, yuki_base: true }), 2)
  })
})

describe('matchesDaphneStatus', () => {
  it('does not filter when no Daphne status is selected', () => {
    assert.equal(matchesDaphneStatus(true, []), true)
    assert.equal(matchesDaphneStatus(false, []), true)
  })

  it('does not filter when both statuses are selected', () => {
    const statuses = [DAPHNE_STATUS_APPLIED, DAPHNE_STATUS_UNAPPLIED]

    assert.equal(matchesDaphneStatus(true, statuses), true)
    assert.equal(matchesDaphneStatus(false, statuses), true)
  })

  it('matches applied-only and unapplied-only filters', () => {
    assert.equal(matchesDaphneStatus(true, [DAPHNE_STATUS_APPLIED]), true)
    assert.equal(matchesDaphneStatus(false, [DAPHNE_STATUS_APPLIED]), false)
    assert.equal(matchesDaphneStatus(true, [DAPHNE_STATUS_UNAPPLIED]), false)
    assert.equal(matchesDaphneStatus(false, [DAPHNE_STATUS_UNAPPLIED]), true)
  })
})
