import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ELEMENTS } from './elements.js'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))
const metaTeams = JSON.parse(readFileSync(new URL('./meta_teams.json', import.meta.url), 'utf8'))

const styleIds = new Set(styles.map(style => style.id))
const stylesById = new Map(styles.map(style => [style.id, style]))
const expectedMetaTeams = [
  { id: 'neutral_meta', name: '무 최고 조합', element: '무' },
  { id: 'fire_meta', name: '화 최고 조합', element: '화' },
  { id: 'ice_meta', name: '빙 최고 조합', element: '빙' },
  { id: 'thunder_meta', name: '뇌 최고 조합', element: '뇌' },
  { id: 'light_meta', name: '광 최고 조합', element: '광' },
  { id: 'dark_meta', name: '암 최고 조합', element: '암' }
]

describe('element labels', () => {
  it('uses one-character element labels in filter order', () => {
    assert.deepEqual(ELEMENTS, ['무', '화', '빙', '뇌', '광', '암'])
  })
})

describe('meta teams', () => {
  it('defines one best-team preset per supported element', () => {
    assert.deepEqual(
      metaTeams.map(team => [team.id, team.name]),
      expectedMetaTeams.map(team => [team.id, team.name])
    )
  })

  it('uses exactly six unique styles per best-team preset', () => {
    const invalidTeams = metaTeams
      .map(team => ({
        id: team.id,
        count: team.styles.length,
        uniqueCount: new Set(team.styles).size
      }))
      .filter(team => team.count !== 6 || team.uniqueCount !== 6)

    assert.deepEqual(invalidTeams, [])
  })

  it('matches supported element ids and names', () => {
    assert.deepEqual(
      metaTeams.map(team => ({ id: team.id, name: team.name })),
      expectedMetaTeams.map(team => ({ id: team.id, name: team.name }))
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

  it('includes at least one style matching each preset element', () => {
    const teamsWithoutElementStyle = metaTeams
      .map(team => {
        const expectedTeam = expectedMetaTeams.find(expected => expected.id === team.id)
        const hasMatchingStyle = team.styles
          .map(styleId => stylesById.get(styleId))
          .some(style => style?.element === expectedTeam?.element || style?.elements?.includes(expectedTeam?.element))

        return {
          id: team.id,
          element: expectedTeam?.element,
          hasMatchingStyle
        }
      })
      .filter(team => !team.hasMatchingStyle)

    assert.deepEqual(teamsWithoutElementStyle, [])
  })
})
