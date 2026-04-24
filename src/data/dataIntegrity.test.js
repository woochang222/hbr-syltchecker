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
      .filter(file => file.endsWith('.webp'))
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
          id: 'amane_miko_servant',
          character_name: '텐네 미코',
          style_name: 'servant',
          image_url: '/images/styles/tenne_miko_servant.webp',
          unit: '31C'
        },
        {
          id: 'amane_miko_supreme',
          character_name: '텐네 미코',
          style_name: '지고',
          image_url: '/images/styles/tenne_miko_supreme.webp',
          unit: '31C'
        },
        {
          id: 'amane_miko_style_385069754',
          character_name: '텐네 미코',
          style_name: '매지컬냥',
          image_url: '/images/styles/tenne_miko_magical_cat.webp',
          unit: '31C'
        },
        {
          id: 'amane_miko_base',
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
})
