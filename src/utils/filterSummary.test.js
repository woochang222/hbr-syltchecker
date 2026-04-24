import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildFilterSummary, countMatchingStyles } from './filterSummary.js'

describe('buildFilterSummary', () => {
  const metaTeams = [
    { id: 'light_meta', name: '빛 최고 조합', styles: ['shirakawa_yuina_white_suit_res'] },
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
      filters: { elements: ['빛'], units: ['31A', '31B'], tiers: [0] },
      activeMetaTeam: 'light_meta',
      metaTeams,
      viewMode: 'hide',
      visibleCount: 18
    })

    assert.deepEqual(result, ['빛 최고 조합', '빛', '부대 2개', 'T0', '숨김 모드', '결과 18개'])
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
