import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))

describe('style data integrity', () => {
  it('uses unique style ids', () => {
    const ids = styles.map(style => style.id)
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)

    assert.deepEqual(duplicateIds, [])
  })

  it('uses one local image file per style entry', () => {
    const imageUrls = styles.map(style => style.image_url)
    const duplicateImageUrls = imageUrls.filter((url, index) => imageUrls.indexOf(url) !== index)

    assert.deepEqual(duplicateImageUrls, [])
  })

  it('has no missing or unreferenced style image files', () => {
    const imageUrls = new Set(styles.map(style => style.image_url))
    const missingFiles = [...imageUrls]
      .filter(url => !existsSync(new URL(`../../public${url}`, import.meta.url)))

    const referencedFileNames = new Set([...imageUrls].map(url => url.split('/').at(-1)))
    const imageFiles = readdirSync(new URL('../../public/images/styles', import.meta.url))
      .filter(file => file.endsWith('.webp') || file.endsWith('.png'))
    const unreferencedFiles = imageFiles.filter(file => !referencedFileNames.has(file))

    assert.deepEqual({ missingFiles, unreferencedFiles }, { missingFiles: [], unreferencedFiles: [] })
  })

  it('keeps only the SS and SS resonance Ogasawara Hisame styles', () => {
    const styleMap = new Map(styles.map(style => [style.id, style]))
    const hisameStyles = styles.filter(style => style.character_name === '오가사와라 히사메')

    assert.deepEqual(
      [
        styleMap.get('ogasawara_hisame_bunny_res'),
        styleMap.get('ogasawara_hisame_garnet'),
        styleMap.get('ogasawara_hisame_maid'),
        styleMap.get('ogasawara_hisame_cat_ears'),
        styleMap.get('ogasawara_hisame_initial')
      ].map(style => ({
        id: style?.id,
        character_name: style?.character_name,
        unit: style?.unit,
        image_url: style?.image_url
      })),
      [
        {
          id: 'ogasawara_hisame_bunny_res',
          character_name: '오가사와라 히사메',
          unit: '30G',
          image_url: '/images/styles/ogasawara_hisame_bunny_res.webp'
        },
        {
          id: 'ogasawara_hisame_garnet',
          character_name: '오가사와라 히사메',
          unit: '30G',
          image_url: '/images/styles/ogasawara_hisame_garnet.webp'
        },
        {
          id: 'ogasawara_hisame_maid',
          character_name: '오가사와라 히사메',
          unit: '30G',
          image_url: '/images/styles/ogasawara_hisame_maid.webp'
        },
        {
          id: 'ogasawara_hisame_cat_ears',
          character_name: '오가사와라 히사메',
          unit: '30G',
          image_url: '/images/styles/ogasawara_hisame_cat_ears.webp'
        },
        {
          id: 'ogasawara_hisame_initial',
          character_name: '오가사와라 히사메',
          unit: '30G',
          image_url: '/images/styles/ogasawara_hisame_initial.webp'
        }
      ]
    )
    assert.equal(hisameStyles.length, 5)
    assert.equal(styleMap.has('ogasawara_hisame_base'), false)
  })

  it('keeps Sakuraba Seira styles in 31C', () => {
    const seiraStyles = styles.filter(style => style.character_name === '사쿠라바 세이라')

    assert.deepEqual(
      seiraStyles.map(style => ({ id: style.id, unit: style.unit })),
      [
        { id: 'sakuraba_seira_servant', unit: '31C' },
        { id: 'sakuraba_seira_bride', unit: '31C' },
        { id: 'sakuraba_seira_new_year', unit: '31C' },
        { id: 'sakuraba_seira_base', unit: '31C' }
      ]
    )
  })

  it('keeps Sugawara Chie styles in 30G', () => {
    const chieStyles = styles.filter(style => style.character_name === '스가와라 치에')

    assert.deepEqual(
      chieStyles.map(style => ({ id: style.id, unit: style.unit })),
      [
        { id: 'sugawara_chie_ferity', unit: '30G' },
        { id: 'sugawara_chie_stoic', unit: '30G' },
        { id: 'sugawara_chie_pure_heart', unit: '30G' },
        { id: 'sugawara_chie_base', unit: '30G' }
      ]
    )
  })

  it('keeps Tenne Miko styles in 31C', () => {
    const mikoStyles = styles.filter(style => style.character_name === '텐네 미코')

    assert.deepEqual(
      mikoStyles.map(style => ({
        id: style.id,
        character_name: style.character_name,
        style_name: style.style_name,
        image_url: style.image_url,
        unit: style.unit
      })),
      [
        {
          id: 'tenne_miko_servant',
          character_name: '텐네 미코',
          style_name: 'servant',
          image_url: '/images/styles/tenne_miko_servant.webp',
          unit: '31C'
        },
        {
          id: 'tenne_miko_supreme',
          character_name: '텐네 미코',
          style_name: '지고',
          image_url: '/images/styles/tenne_miko_supreme.webp',
          unit: '31C'
        },
        {
          id: 'tenne_miko_magical_cat',
          character_name: '텐네 미코',
          style_name: '매지컬냥',
          image_url: '/images/styles/tenne_miko_magical_cat.webp',
          unit: '31C'
        },
        {
          id: 'tenne_miko_base',
          character_name: '텐네 미코',
          style_name: '기본',
          image_url: '/images/styles/tenne_miko_base.webp',
          unit: '31C'
        }
      ]
    )
  })

  it('keeps every character in the correct unit', () => {
    const expectedUnitsByCharacter = new Map([
      ['아사쿠라 카렌', '31A'],
      ['아이카와 메구미', '31A'],
      ['이즈미 유키', '31A'],
      ['카야모리 루카', '31A'],
      ['쿠니미 타마', '31A'],
      ['토죠 츠카사', '31A'],
      ['미나세 스모모', '31B'],
      ['미나세 이치고', '31B'],
      ['뱌코', '31B'],
      ['아오이 에리카', '31B'],
      ['히구치 세이카', '31B'],
      ['히이라기 코즈에', '31B'],
      ['분고 야요이', '31C'],
      ['사츠키 마리', '31C'],
      ['사쿠라바 세이라', '31C'],
      ['야마와키 본 이바르', '31C'],
      ['칸자키 아델하이드', '31C'],
      ['텐네 미코', '31C'],
      ['니카이도 미사토', '31D'],
      ['이시이 이로하', '31D'],
      ['미코토 후부키', '31D'],
      ['무로후시 리사', '31D'],
      ['다테 아카리', '31D'],
      ['미즈하라 아이나', '31D'],
      ['오오시마 니이나', '31E'],
      ['오오시마 무우아', '31E'],
      ['오오시마 미노리', '31E'],
      ['오오시마 요츠하', '31E'],
      ['오오시마 이스즈', '31E'],
      ['오오시마 이치코', '31E'],
      ['나츠메 이노리', '31F'],
      ['마루야마 카나타', '31F'],
      ['마츠오카 치로루', '31F'],
      ['야나기 미온', '31F'],
      ['쿠로사와 마키', '31F'],
      ['하나무라 시키', '31F'],
      ['리 잉시아', '31X'],
      ['마리아 데 안젤리스', '31X'],
      ['브리티카 발라크리슈난', '31X'],
      ['샬로타 스코폽스카야', '31X'],
      ['아이린 레드메인', '31X'],
      ['캐롤 리퍼', '31X'],
      ['스가와라 치에', '30G'],
      ['시라카와 유이나', '30G'],
      ['오가사와라 히사메', '30G'],
      ['츠키시로 모나카', '30G'],
      ['키류 미야', '30G'],
      ['쿠라 사토미', '30G'],
      ['나나세 나나미', '사령부'],
      ['테즈카 사키', '사령부'],
      ['나카무라 유리', 'AB'],
      ['이리에 미유키', 'AB'],
      ['요시오카 유이', 'AB'],
      ['이와사와 마사미', 'AB'],
      ['타치바나 카나데', 'AB']
    ])

    const mismatches = styles
      .filter(style => expectedUnitsByCharacter.has(style.character_name))
      .filter(style => style.unit !== expectedUnitsByCharacter.get(style.character_name))
      .map(style => ({
        id: style.id,
        character_name: style.character_name,
        actual: style.unit,
        expected: expectedUnitsByCharacter.get(style.character_name)
      }))
    const styleCharacters = new Set(styles.map(style => style.character_name))
    const missingCharacters = [...expectedUnitsByCharacter.keys()]
      .filter(characterName => !styleCharacters.has(characterName))

    assert.deepEqual({ mismatches, missingCharacters }, { mismatches: [], missingCharacters: [] })
  })

  it('uses a concrete element for every style', () => {
    const unknownElements = styles
      .filter(style => style.element === '미정')
      .map(style => style.id)

    assert.deepEqual(unknownElements, [])
  })

  it('adds one Irie Miyuki AB style with a local image', () => {
    const miyukiStyles = styles.filter(style => style.character_name === '이리에 미유키')

    assert.deepEqual(
      miyukiStyles.map(style => ({
        id: style.id,
        style_name: style.style_name,
        image_url: style.image_url,
        unit: style.unit,
        element: style.element
      })),
      [
        {
          id: 'irie_miyuki_faraway_eden',
          style_name: 'Faraway Eden',
          image_url: '/images/styles/irie_miyuki_faraway_eden.png',
          unit: 'AB',
          element: '빙'
        }
      ]
    )
  })

  it('keeps one Tezuka Saki command style and two Tachibana Kanade AB styles', () => {
    const tezukaStyles = styles.filter(style => style.character_name === '테즈카 사키')
    const kanadeStyles = styles.filter(style => style.character_name === '타치바나 카나데')

    assert.deepEqual(
      {
        tezuka: tezukaStyles.map(style => ({
          id: style.id,
          image_url: style.image_url,
          unit: style.unit
        })),
        kanade: kanadeStyles.map(style => ({
          id: style.id,
          style_name: style.style_name,
          image_url: style.image_url,
          unit: style.unit,
          element: style.element
        }))
      },
      {
        tezuka: [
          {
            id: 'tezuka_saki_base_res',
            image_url: '/images/styles/tezuka_saki_base_res.webp',
            unit: '사령부'
          }
        ],
        kanade: [
          {
            id: 'tachibana_kanade_earth_angel',
            style_name: 'Earth Angel',
            image_url: '/images/styles/tachibana_kanade_earth_angel.png',
            unit: 'AB',
            element: '광'
          },
          {
            id: 'tachibana_kanade_soaring_sword',
            style_name: '천상의 검',
            image_url: '/images/styles/tachibana_kanade_soaring_sword.webp',
            unit: 'AB',
            element: '빙'
          }
        ]
      }
    )
  })

  it('keeps Nakamura Yuri Rain Fire on the fire image asset', () => {
    const rainFire = styles.find(style => style.id === 'nakamura_yuri_rain_fire')

    assert.deepEqual(
      {
        character_name: rainFire?.character_name,
        style_name: rainFire?.style_name,
        image_url: rainFire?.image_url,
        unit: rainFire?.unit,
        element: rainFire?.element,
        elements: rainFire?.elements
      },
      {
        character_name: '나카무라 유리',
        style_name: 'rain_fire',
        image_url: '/images/styles/nakamura_yuri_rain_fire.png',
        unit: 'AB',
        element: '화',
        elements: ['화']
      }
    )
  })

  it('keeps Kunimi Tama swimsuit on the light swimsuit image asset', () => {
    const swimsuit = styles.find(style => style.id === 'kunimi_tama_swimsuit')
    const elemental = styles.find(style => style.id === 'kunimi_tama_magical_elemental')

    assert.deepEqual(
      {
        character_name: swimsuit?.character_name,
        style_name: swimsuit?.style_name,
        image_url: swimsuit?.image_url,
        unit: swimsuit?.unit,
        element: swimsuit?.element,
        elements: swimsuit?.elements
      },
      {
        character_name: '쿠니미 타마',
        style_name: '수영복',
        image_url: '/images/styles/kunimi_tama_swimsuit.png',
        unit: '31A',
        element: '광',
        elements: ['광']
      }
    )
    assert.deepEqual(
      {
        character_name: elemental?.character_name,
        style_name: elemental?.style_name,
        image_url: elemental?.image_url,
        unit: elemental?.unit,
        element: elemental?.element,
        elements: elemental?.elements
      },
      {
        character_name: '쿠니미 타마',
        style_name: '마법의 나라의 엘리멘탈',
        image_url: '/images/styles/kunimi_tama_magical_elemental.webp',
        unit: '31A',
        element: '화',
        elements: ['화']
      }
    )
  })

  it('keeps Minase Ichigo idol on the fire image asset', () => {
    const idol = styles.find(style => style.id === 'minase_ichigo_idol')

    assert.deepEqual(
      {
        character_name: idol?.character_name,
        style_name: idol?.style_name,
        image_url: idol?.image_url,
        unit: idol?.unit,
        element: idol?.element,
        elements: idol?.elements
      },
      {
        character_name: '미나세 이치고',
        style_name: '아이돌',
        image_url: '/images/styles/minase_ichigo_idol.webp',
        unit: '31B',
        element: '화',
        elements: ['화']
      }
    )
  })

  it('keeps Aoi Erika idol on the fire image asset', () => {
    const idol = styles.find(style => style.id === 'aoi_erika_idol')

    assert.deepEqual(
      {
        character_name: idol?.character_name,
        style_name: idol?.style_name,
        image_url: idol?.image_url,
        unit: idol?.unit,
        element: idol?.element,
        elements: idol?.elements
      },
      {
        character_name: '아오이 에리카',
        style_name: '아이돌',
        image_url: '/images/styles/aoi_erika_idol.webp',
        unit: '31B',
        element: '화',
        elements: ['화']
      }
    )
  })

  it('keeps Maria de Angelis fleeting encounter on the thunder image asset', () => {
    const fleetingEncounter = styles.find(style => style.id === 'maria_de_angelis_fleeting_encounter')

    assert.deepEqual(
      {
        character_name: fleetingEncounter?.character_name,
        style_name: fleetingEncounter?.style_name,
        image_url: fleetingEncounter?.image_url,
        unit: fleetingEncounter?.unit,
        element: fleetingEncounter?.element,
        elements: fleetingEncounter?.elements
      },
      {
        character_name: '마리아 데 안젤리스',
        style_name: '찰나의 해후',
        image_url: '/images/styles/maria_de_angelis_fleeting_encounter.webp',
        unit: '31X',
        element: '뇌',
        elements: ['뇌']
      }
    )
  })

  it('keeps Charlotta eternal feelings on the thunder image asset', () => {
    const eternalFeelings = styles.find(style => style.id === 'charlotta_eternal_feelings')

    assert.deepEqual(
      {
        character_name: eternalFeelings?.character_name,
        style_name: eternalFeelings?.style_name,
        image_url: eternalFeelings?.image_url,
        unit: eternalFeelings?.unit,
        element: eternalFeelings?.element,
        elements: eternalFeelings?.elements
      },
      {
        character_name: '샬로타 스코폽스카야',
        style_name: '영원한 마음',
        image_url: '/images/styles/charlotta_eternal_feelings.webp',
        unit: '31X',
        element: '뇌',
        elements: ['뇌']
      }
    )
  })

  it('keeps Tsukishiro Monaka cover on the light image asset', () => {
    const cover = styles.find(style => style.id === 'tsukishiro_monaka_cover')

    assert.deepEqual(
      {
        character_name: cover?.character_name,
        style_name: cover?.style_name,
        image_url: cover?.image_url,
        unit: cover?.unit,
        element: cover?.element,
        elements: cover?.elements
      },
      {
        character_name: '츠키시로 모나카',
        style_name: '엄폐된 시간',
        image_url: '/images/styles/tsukishiro_monaka_cover.webp',
        unit: '30G',
        element: '광',
        elements: ['광']
      }
    )
  })

  it('keeps Murofushi Risa technical exchange on the neutral image asset', () => {
    const technicalExchange = styles.find(style => style.id === 'murofushi_risa_smile_technical_exchange')

    assert.deepEqual(
      {
        character_name: technicalExchange?.character_name,
        style_name: technicalExchange?.style_name,
        image_url: technicalExchange?.image_url,
        unit: technicalExchange?.unit,
        element: technicalExchange?.element,
        elements: technicalExchange?.elements
      },
      {
        character_name: '무로후시 리사',
        style_name: '잠입, 미소로 기술 교류회',
        image_url: '/images/styles/murofushi_risa_smile_technical_exchange.webp',
        unit: '31D',
        element: '무',
        elements: ['무']
      }
    )
  })

  it('keeps Bungo Yayoi Happy Legion on the light image asset', () => {
    const happyLegion = styles.find(style => style.id === 'bungo_yayoi_happy_legion')

    assert.deepEqual(
      {
        character_name: happyLegion?.character_name,
        style_name: happyLegion?.style_name,
        image_url: happyLegion?.image_url,
        unit: happyLegion?.unit,
        element: happyLegion?.element,
        elements: happyLegion?.elements
      },
      {
        character_name: '분고 야요이',
        style_name: 'Happy Legion',
        image_url: '/images/styles/bungo_yayoi_happy_legion.webp',
        unit: '31C',
        element: '광',
        elements: ['광']
      }
    )
  })

  it('keeps Yamawaki Holy Knight on the light image asset', () => {
    const holyKnight = styles.find(style => style.id === 'yamawaki_holy_knight')

    assert.deepEqual(
      {
        character_name: holyKnight?.character_name,
        style_name: holyKnight?.style_name,
        image_url: holyKnight?.image_url,
        unit: holyKnight?.unit,
        element: holyKnight?.element,
        elements: holyKnight?.elements
      },
      {
        character_name: '야마와키 본 이바르',
        style_name: 'Holy Knight',
        image_url: '/images/styles/yamawaki_holy_knight.webp',
        unit: '31C',
        element: '광',
        elements: ['광']
      }
    )
  })

  it('keeps Asakura Karen scarlet rebellion on the fire image asset', () => {
    const scarletRebellion = styles.find(style => style.id === 'asakura_karen_scarlet_rebellion')

    assert.deepEqual(
      {
        character_name: scarletRebellion?.character_name,
        style_name: scarletRebellion?.style_name,
        image_url: scarletRebellion?.image_url,
        unit: scarletRebellion?.unit,
        element: scarletRebellion?.element,
        elements: scarletRebellion?.elements
      },
      {
        character_name: '아사쿠라 카렌',
        style_name: '스칼렛 리벨리온',
        image_url: '/images/styles/asakura_karen_scarlet_rebellion.webp',
        unit: '31A',
        element: '화',
        elements: ['화']
      }
    )
  })

  it('keeps Kayamori Ruka cardinal echo on the light image asset', () => {
    const cardinalEcho = styles.find(style => style.id === 'kayamori_ruka_cardinal_echo')

    assert.deepEqual(
      {
        character_name: cardinalEcho?.character_name,
        style_name: cardinalEcho?.style_name,
        image_url: cardinalEcho?.image_url,
        unit: cardinalEcho?.unit,
        element: cardinalEcho?.element,
        elements: cardinalEcho?.elements
      },
      {
        character_name: '카야모리 루카',
        style_name: '잔향의 카디널',
        image_url: '/images/styles/kayamori_ruka_cardinal_echo.webp',
        unit: '31A',
        element: '광',
        elements: ['광']
      }
    )
  })

  it('keeps Aikawa Megumi one night dream on the light image asset', () => {
    const oneNightDream = styles.find(style => style.id === 'aikawa_megumi_one_night_dream')

    assert.deepEqual(
      {
        character_name: oneNightDream?.character_name,
        style_name: oneNightDream?.style_name,
        image_url: oneNightDream?.image_url,
        unit: oneNightDream?.unit,
        element: oneNightDream?.element,
        elements: oneNightDream?.elements
      },
      {
        character_name: '아이카와 메구미',
        style_name: '하룻밤의 꿈',
        image_url: '/images/styles/aikawa_megumi_one_night_dream.webp',
        unit: '31A',
        element: '광',
        elements: ['광']
      }
    )
  })

  it('keeps Kayamori Ruka circuit burst on the neutral image asset', () => {
    const circuitBurst = styles.find(style => style.id === 'kayamori_ruka_circuit_burst')

    assert.deepEqual(
      {
        character_name: circuitBurst?.character_name,
        style_name: circuitBurst?.style_name,
        image_url: circuitBurst?.image_url,
        unit: circuitBurst?.unit,
        element: circuitBurst?.element,
        elements: circuitBurst?.elements
      },
      {
        character_name: '카야모리 루카',
        style_name: '섬광의 서킷 버스트',
        image_url: '/images/styles/kayamori_ruka_circuit_burst.webp',
        unit: '31A',
        element: '무',
        elements: ['무']
      }
    )
  })

  it('keeps manually inspected image elements aligned with card icons', () => {
    const expectedElementsByStyle = new Map([
      ['tenne_miko_servant', { element: '암', elements: ['암'] }],
      ['yanagi_mion_admiral_res', { element: '무', elements: ['무'] }],
      ['yamawaki_unison_res', { element: '암', elements: ['암'] }],
      ['asakura_karen_free', { element: '화', elements: ['화', '빙'] }],
      ['aikawa_megumi_unison_res', { element: '빙', elements: ['빙', '뇌'] }],
      ['izumi_yuki_unison_res', { element: '암', elements: ['암', '화'] }],
      ['kayamori_ruka_unison_res', { element: '암', elements: ['암', '화'] }]
    ])

    const mismatches = [...expectedElementsByStyle].flatMap(([styleId, expected]) => {
      const style = styles.find(candidate => candidate.id === styleId)

      return JSON.stringify({ element: style?.element, elements: style?.elements }) === JSON.stringify(expected)
        ? []
        : [{ id: styleId, actual: { element: style?.element, elements: style?.elements }, expected }]
    })

    assert.deepEqual(mismatches, [])
  })

})
