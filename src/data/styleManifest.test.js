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
  'aoi_erika_swimsuit_res',
  'oshima_minori_midnight_res',
  'kayamori_ruka_pawapuro_res',
  'carol_reaper_white_suit_res',
  'kiryu_miya_swimsuit_res',
  'kura_satomi_swimsuit_res',
  'yamawaki_white_suit_res',
  'nanase_nanami_base_res',
  'shirakawa_yuina_unison_res',
  'irie_miyuki_faraway_eden',
  'maria_de_angelis_chef',
  'carol_reaper_chef',
  'yamawaki_loneliness',
  'eileen_redmain_foggy_city',
  'oshima_isuzu_night_talk',
  'minase_sumomo_halloween',
  'charlotta_chef',
  'vritika_balakrishnan_chef',
  'oshima_muua_summer_clothes',
  'oshima_niina_summer_clothes',
  'hiiragi_kozue_swimsuit',
  'ri_yunfa_bride',
  'ishii_iroha_bride',
  'matsuoka_chiroru_heroic',
  'oshima_yotsuba_yukata',
  'eileen_redmain_breeze',
  'maria_de_angelis_elegante',
  'tsukishiro_monaka_spring_blizzard',
  'sugawara_chie_ferity',
  'asakura_karen_free',
  'date_akari_new_year',
  'murofushi_risa_new_year',
  'yoshioka_yui_base',
  'iwasawa_masami_base',
  'kayamori_ruka_diva',
  'hanamura_shiki_resplendent',
  'mikoto_fubuki_santa',
  'ishii_iroha_overflow',
  'mizuhara_aina_deep_sea',
  'aoi_erika_admiral',
  'higuchi_seika_catharsis',
  'minase_sumomo_compassion',
  'minase_ichigo_cold_beauty',
  'carol_reaper_carnival',
  'oshima_isuzu_magician',
  'oshima_minori_yukata',
  'ogasawara_hisame_garnet',
  'natsume_inori_lapis_lazuli',
  'matsuoka_chiroru_secret',
  'kurosawa_maki_soushisouai',
  'asakura_karen_swimsuit',
  'aikawa_megumi_swimsuit',
  'satsuki_mari_swimsuit',
  'kanzaki_adelheid_swimsuit',
  'charlotta_bride',
  'sakuraba_seira_bride',
  'vritika_balakrishnan_dancer',
  'eileen_redmain_moonlight',
  'maruyama_kanata_bloom',
  'kiryu_miya_dream_fire',
  'sugawara_chie_stoic',
  'ri_yunfa_spring_evening',
  'hiiragi_kozue_waitress',
  'tenne_miko_supreme',
  'bungo_yayoi_hanami',
  'yamawaki_one_piece',
  'izumi_yuki_ruby',
  'nakamura_yuri_extraordinary',
  'oshima_muua_new_year',
  'oshima_yotsuba_new_year',
  'aikawa_megumi_suit',
  'kunimi_tama_suit',
  'nikaido_misato_santa',
  'date_akari_santa',
  'ri_yunfa_celestial_nymph',
  'kanzaki_adelheid_girl',
  'oshima_isuzu_yukata',
  'oshima_niina_yukata',
  'izumi_yuki_dress',
  'kiryu_miya_houraku',
  'yanagi_mion_night_breeze',
  'natsume_inori_butterfly',
  'asakura_karen_suit',
  'tojo_tsukasa_suit',
  'shirakawa_yuina_swimsuit',
  'date_akari_base',
  'oshima_ichiko_bride',
  'satsuki_mari_bride',
  'vritika_balakrishnan_base',
  'charlotta_base',
  'mizuhara_aina_base',
  'ogasawara_hisame_maid',
  'aoi_erika_maid',
  'byakko_queen',
  'kura_satomi_young_landlady',
  'aikawa_megumi_miko',
  'satsuki_mari_assassin',
  'kanzaki_adelheid_ice_flower',
  'mikoto_fubuki_base',
  'sugawara_chie_pure_heart',
  'oshima_yotsuba_base',
  'oshima_muua_base',
  'ogasawara_hisame_cat_ears',
  'ogasawara_hisame_initial',
  'izumi_yuki_suit',
  'kayamori_ruka_suit',
  'maria_de_angelis_base',
  'ri_yunfa_base',
  'sakuraba_seira_new_year',
  'kunimi_tama_new_year',
  'kurosawa_maki_base',
  'natsume_inori_base',
  'oshima_minori_base',
  'oshima_niina_base',
  'higuchi_seika_exploration',
  'hiiragi_kozue_finale',
  'murofushi_risa_base',
  'ishii_iroha_base',
  'shirakawa_yuina_infernal',
  'kiryu_miya_base',
  'matsuoka_chiroru_base',
  'hanamura_shiki_base',
  'eileen_redmain_base',
  'carol_reaper_base',
  'minase_sumomo_swimsuit',
  'tojo_tsukasa_swimsuit',
  'izumi_yuki_yukata',
  'aoi_erika_base',
  'oshima_isuzu_base',
  'kanzaki_adelheid_base',
  'oshima_ichiko_base',
  'hiiragi_kozue_base',
  'yanagi_mion_base',
  'maruyama_kanata_base',
  'kura_satomi_base',
  'shirakawa_yuina_base',
  'nikaido_misato_base',
  'minase_sumomo_base',
  'minase_ichigo_base',
  'tsukishiro_monaka_base',
  'yamawaki_base',
  'satsuki_mari_base',
  'kayamori_ruka_base',
  'izumi_yuki_base',
  'aikawa_megumi_base',
  'tojo_tsukasa_base',
  'asakura_karen_base',
  'kunimi_tama_base',
  'higuchi_seika_base',
  'byakko_base',
  'sakuraba_seira_base',
  'tenne_miko_base',
  'bungo_yayoi_base',
  'sugawara_chie_base'
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
