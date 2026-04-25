import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))
const manifest = JSON.parse(readFileSync(new URL('./style_manifest.json', import.meta.url), 'utf8'))

const styleMap = new Map(styles.map(style => [style.id, style]))
const manuallyReviewedStyleIds = [
  'kunimi_tama_magical_elemental',
  'minase_ichigo_idol',
  'aoi_erika_idol',
  'maria_de_angelis_fleeting_encounter',
  'charlotta_eternal_feelings',
  'tsukishiro_monaka_cover',
  'tenne_miko_magical_cat',
  'murofushi_risa_smile_technical_exchange',
  'bungo_yayoi_happy_legion',
  'yamawaki_holy_knight',
  'asakura_karen_scarlet_rebellion',
  'kayamori_ruka_cardinal_echo',
  'aikawa_megumi_one_night_dream',
  'kayamori_ruka_circuit_burst'
]

describe('style manifest', () => {
  it('references only styles that exist in styles.json', () => {
    const missingStyleIds = Object.keys(manifest)
      .filter(styleId => !styleMap.has(styleId))

    assert.deepEqual(missingStyleIds, [])
  })

  it('covers manually reviewed renamed styles in the manifest', () => {
    const missingManifestIds = manuallyReviewedStyleIds
      .filter(styleId => !manifest[styleId])

    assert.deepEqual(missingManifestIds, [])
  })

  it('matches manifest-backed units, elements, and image URLs', () => {
    const mismatches = Object.entries(manifest)
      .flatMap(([styleId, expected]) => {
        const style = styleMap.get(styleId)
        if (!style) return []

        const styleMismatches = []
        if (style.unit !== expected.expectedUnit) {
          styleMismatches.push({
            id: styleId,
            field: 'unit',
            actual: style.unit,
            expected: expected.expectedUnit
          })
        }

        if (style.element !== expected.expectedElements[0]) {
          styleMismatches.push({
            id: styleId,
            field: 'element',
            actual: style.element,
            expected: expected.expectedElements[0]
          })
        }

        if (JSON.stringify(style.elements) !== JSON.stringify(expected.expectedElements)) {
          styleMismatches.push({
            id: styleId,
            field: 'elements',
            actual: style.elements,
            expected: expected.expectedElements
          })
        }

        if (style.image_url !== expected.expectedImageUrl) {
          styleMismatches.push({
            id: styleId,
            field: 'image_url',
            actual: style.image_url,
            expected: expected.expectedImageUrl
          })
        }

        return styleMismatches
      })

    assert.deepEqual(mismatches, [])
  })

  it('uses existing image files for manifest-backed styles', () => {
    const missingImageFiles = Object.entries(manifest)
      .filter(([, expected]) => !existsSync(new URL(`../../public${expected.expectedImageUrl}`, import.meta.url)))
      .map(([styleId, expected]) => ({
        id: styleId,
        image_url: expected.expectedImageUrl
      }))

    assert.deepEqual(missingImageFiles, [])
  })
})
