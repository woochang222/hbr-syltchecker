import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DAPHNE_STATUS_APPLIED, DAPHNE_STATUS_UNAPPLIED } from './daphneStyles.js'
import { buildFilterSummary, countMatchingStyles, getRenderableStyles } from './filterSummary.js'

describe('buildFilterSummary', () => {
  const metaTeams = [
    { id: 'light_meta', name: '광 최고 조합', styles: ['shirakawa_yuina_white_suit_res'] },
    { id: 'fire_meta', name: '화 최고 조합', styles: ['kayamori_ruka_unison_res'] }
  ]

  it('shows the default all-styles summary when no filters are active', () => {
    const result = buildFilterSummary({
      filters: { elements: [], units: [], tiers: [] },
      activeMetaTeam: null,
      metaTeams,
      viewMode: 'dim',
      visibleCount: 120
    })

    assert.deepEqual(result, ['전체 스타일', '흐림 모드', '결과 120개'])
  })

  it('puts the active preset first and summarizes selected filters', () => {
    const result = buildFilterSummary({
      filters: { elements: ['광'], units: ['31A', '31B'], tiers: [0], ownershipRange: [2, 4] },
      activeMetaTeam: 'light_meta',
      metaTeams,
      viewMode: 'hide',
      visibleCount: 18
    })

    assert.deepEqual(result, ['광 최고 조합', '광', '부대 2개', 'T0', '돌파 2개 이상', '숨김 모드', '결과 18개'])
  })

  it('falls back to a stable label for an unknown preset id', () => {
    const result = buildFilterSummary({
      filters: { elements: [], units: [], tiers: [] },
      activeMetaTeam: 'missing_meta',
      metaTeams,
      viewMode: 'dim',
      visibleCount: 0
    })

    assert.deepEqual(result, ['선택한 조합', '흐림 모드', '결과 0개'])
  })

  it('shows a Daphne applied label when only applied status is selected', () => {
    const result = buildFilterSummary({
      filters: {
        elements: [],
        units: [],
        tiers: [],
        daphneStatuses: [DAPHNE_STATUS_APPLIED]
      },
      activeMetaTeam: null,
      metaTeams,
      viewMode: 'dim',
      visibleCount: 12
    })

    assert.deepEqual(result, ['다프네 적용', '흐림 모드', '결과 12개'])
  })

  it('shows a Daphne unapplied label when only unapplied status is selected', () => {
    const result = buildFilterSummary({
      filters: {
        elements: [],
        units: [],
        tiers: [],
        daphneStatuses: [DAPHNE_STATUS_UNAPPLIED]
      },
      activeMetaTeam: null,
      metaTeams,
      viewMode: 'dim',
      visibleCount: 108
    })

    assert.deepEqual(result, ['다프네 미적용', '흐림 모드', '결과 108개'])
  })

  it('omits the Daphne label when both Daphne statuses are selected', () => {
    const result = buildFilterSummary({
      filters: {
        elements: [],
        units: [],
        tiers: [],
        daphneStatuses: [DAPHNE_STATUS_APPLIED, DAPHNE_STATUS_UNAPPLIED]
      },
      activeMetaTeam: null,
      metaTeams,
      viewMode: 'dim',
      visibleCount: 120
    })

    assert.deepEqual(result, ['전체 스타일', '흐림 모드', '결과 120개'])
  })
})

describe('countMatchingStyles', () => {
  it('excludes cards that failed the active filters even when they are dimmed instead of hidden', () => {
    const styles = [
      { id: 'a', matchesFilters: true, isHidden: false, isDimmed: false },
      { id: 'b', matchesFilters: false, isHidden: false, isDimmed: true },
      { id: 'c', matchesFilters: false, isHidden: true, isDimmed: false }
    ]

    assert.equal(countMatchingStyles(styles), 1)
  })

  it('treats legacy style objects without a match flag as matching', () => {
    const styles = [{ id: 'a' }, { id: 'b', matchesFilters: true }]

    assert.equal(countMatchingStyles(styles), 2)
  })
})

describe('getRenderableStyles', () => {
  const styles = [
    { id: 'matching', matchesFilters: true },
    { id: 'excluded', matchesFilters: false }
  ]

  it('keeps every style in dim mode so excluded cards can be dimmed', () => {
    assert.deepEqual(getRenderableStyles(styles, 'dim').map(style => style.id), ['matching', 'excluded'])
  })

  it('removes filter-excluded styles before rendering in hide mode', () => {
    assert.deepEqual(getRenderableStyles(styles, 'hide').map(style => style.id), ['matching'])
  })
})
