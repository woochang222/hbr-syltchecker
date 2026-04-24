import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildFilterSummary, countVisibleStyles } from './filterSummary.js'

describe('buildFilterSummary', () => {
  const metaTeams = [
    { id: 'light_meta', name: '광속성 파티', styles: ['ruka_light_res'] },
    { id: 'fire_meta', name: '화염속성 파티', styles: ['yuki_fire_ss'] }
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
      filters: { elements: ['광'], units: ['31A', '31B'], tiers: [0] },
      activeMetaTeam: 'light_meta',
      metaTeams,
      viewMode: 'hide',
      visibleCount: 18
    })

    assert.deepEqual(result, ['광속성 파티', '광', '부대 2개', 'T0', '숨김 모드', '결과 18개'])
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

describe('countVisibleStyles', () => {
  it('excludes hidden cards from the visible count', () => {
    const styles = [
      { id: 'a', isHidden: false },
      { id: 'b', isHidden: true },
      { id: 'c', isHidden: false }
    ]

    assert.equal(countVisibleStyles(styles), 2)
  })
})
