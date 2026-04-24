import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ELEMENTS } from './elements.js'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))
const metaTeams = JSON.parse(readFileSync(new URL('./meta_teams.json', import.meta.url), 'utf8'))

const styleIds = new Set(styles.map(style => style.id))
const stylesById = new Map(styles.map(style => [style.id, style]))

describe('element labels', () => {
  it('uses one-character element labels in filter order', () => {
    assert.deepEqual(ELEMENTS, ['무', '화', '빙', '뇌', '빛', '암'])
  })
})

describe('meta teams', () => {
  it('defines one best-team preset per supported element', () => {
    assert.deepEqual(
      metaTeams.map(team => [team.id, team.name]),
      [
        ['neutral_meta', '무 최고 조합'],
        ['fire_meta', '화 최고 조합'],
        ['ice_meta', '빙 최고 조합'],
        ['thunder_meta', '뇌 최고 조합'],
        ['light_meta', '빛 최고 조합'],
        ['dark_meta', '암 최고 조합']
      ]
    )
  })

  it('references only style ids that exist in styles.json', () => {
    const missingStyleIds = metaTeams
      .flatMap(team => team.styles)
      .filter(id => !styleIds.has(id))

    assert.deepEqual(missingStyleIds, [])
  })

  it('uses known one-character elements for every referenced meta style', () => {
    const invalidMetaStyleElements = metaTeams
      .flatMap(team => team.styles)
      .map(id => stylesById.get(id))
      .filter(style => !ELEMENTS.includes(style.element))
      .map(style => [style.id, style.element])

    assert.deepEqual(invalidMetaStyleElements, [])
  })
})
