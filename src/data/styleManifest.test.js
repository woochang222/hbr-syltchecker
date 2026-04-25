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
  'kayamori_ruka_circuit_burst',
  'aikawa_megumi_unison_res',
  'asakura_karen_unison_res',
  'izumi_yuki_unison_res',
  'kayamori_ruka_unison_res',
  'bungo_yayoi_unison_res',
  'yamawaki_unison_res',
  'nikaido_misato_admiral_res',
  'nanase_nanami_admiral_res',
  'shirakawa_yuina_admiral_res',
  'kayamori_ruka_admiral_res',
  'yanagi_mion_admiral_res',
  'sakuraba_seira_servant',
  'satsuki_mari_servant',
  'tenne_miko_servant',
  'nikaido_misato_white_suit_res',
  'higuchi_seika_swimsuit',
  'ogasawara_hisame_bunny_res',
  'tojo_tsukasa_sorrow',
  'kunimi_tama_halloween_res',
  'aoi_erika_white_suit_res',
  'mizuhara_aina_swimsuit_res',
  'maruyama_kanata_regalia_res',
  'shirakawa_yuina_white_suit_res',
  'date_akari_sports_day_res',
  'minase_ichigo_pawapuro_res',
  'oshima_ichiko_white_suit_res',
  'tojo_tsukasa_bunny',
  'mizuhara_aina_pirate',
  'kanzaki_adelheid_servant_res',
  'aoi_erika_swimsuit_res'
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
