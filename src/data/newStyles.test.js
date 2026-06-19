import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))
const styleMap = new Map(styles.map(style => [style.id, style]))

const readWebpDimensions = imageUrl => {
  const bytes = readFileSync(new URL(`../../public${imageUrl}`, import.meta.url))
  const type = bytes.toString('ascii', 12, 16)

  if (type === 'VP8X') {
    return {
      width: 1 + bytes.readUIntLE(24, 3),
      height: 1 + bytes.readUIntLE(27, 3)
    }
  }

  if (type === 'VP8 ') {
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff
    }
  }

  if (type === 'VP8L') {
    const bits = bytes.readUInt32LE(21)
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    }
  }

  throw new Error(`Unsupported WebP type: ${type}`)
}

const assertSquareStyleImage = style => {
  const { width, height } = readWebpDimensions(style.image_url)

  assert.equal(width, height)
  assert.equal(width >= 250 && width <= 500, true)
}

describe('new resonance styles', () => {
  it('marks only the newest released style as latest', () => {
    const latestStyleIds = styles
      .filter(style => style.isLatest)
      .map(style => style.id)

    assert.deepEqual(latestStyleIds, [
      'charlotta_princess_res',
      'ri_yunfa_haochi'
    ])
  })

  it('adds Charlotta princess resonance with fire element and verified local image', () => {
    const style = styleMap.get('charlotta_princess_res')

    assert.equal(style?.character_name, '샬로타 스코폽스카야')
    assert.equal(style?.style_name, '이국의 프린쳇사 (레조넌스)')
    assert.equal(style?.unit, '31X')
    assert.equal(style?.element, '화')
    assert.deepEqual(style?.elements, ['화'])
    assert.equal(style?.isResonance, true)
    assert.equal(style?.isLimited, false)
    assert.equal(style?.isLatest, true)
    assert.equal(style?.image_url, '/images/styles/charlotta_princess_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/charlotta_princess_res.webp', import.meta.url)), true)
    assertSquareStyleImage(style)
  })

  it('adds Ri Yunfa Haochi with dark element and verified local image', () => {
    const style = styleMap.get('ri_yunfa_haochi')

    assert.equal(style?.character_name, '리 잉시아')
    assert.equal(style?.style_name, '하오츠♪ 포만감의 도원향')
    assert.equal(style?.unit, '31X')
    assert.equal(style?.element, '암')
    assert.deepEqual(style?.elements, ['암'])
    assert.equal(style?.isResonance, false)
    assert.equal(style?.isLimited, false)
    assert.equal(style?.isLatest, true)
    assert.equal(style?.image_url, '/images/styles/ri_yunfa_haochi.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/ri_yunfa_haochi.webp', import.meta.url)), true)
    assertSquareStyleImage(style)
  })

  it('adds Kayamori Ruka Joker with dark element and verified local image', () => {
    const style = styleMap.get('kayamori_ruka_joker_res')

    assert.equal(style?.character_name, '카야모리 루카')
    assert.equal(style?.style_name, 'TAKE YOUR HEART (레조넌스)')
    assert.equal(style?.unit, '31A')
    assert.equal(style?.element, '암')
    assert.deepEqual(style?.elements, ['암'])
    assert.equal(style?.isResonance, true)
    assert.equal(style?.isLimited, true)
    assert.equal(style?.isLatest, undefined)
    assert.equal(style?.image_url, '/images/styles/kayamori_ruka_joker_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/kayamori_ruka_joker_res.webp', import.meta.url)), true)
    assertSquareStyleImage(style)
  })

  it('adds Violet with light element and verified local image', () => {
    const style = styleMap.get('violet_faith_res')

    assert.equal(style?.character_name, '바이올렛')
    assert.equal(style?.style_name, '흔들림 없는 신념 (레조넌스)')
    assert.equal(style?.unit, 'P5R')
    assert.equal(style?.element, '광')
    assert.deepEqual(style?.elements, ['광'])
    assert.equal(style?.isResonance, true)
    assert.equal(style?.isLimited, true)
    assert.equal(style?.isLatest, undefined)
    assert.equal(style?.image_url, '/images/styles/violet_faith_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/violet_faith_res.webp', import.meta.url)), true)
    assertSquareStyleImage(style)
  })

  it('adds Queen with P5R unit and verified local image', () => {
    const style = styleMap.get('queen_persona_res')

    assert.equal(style?.character_name, '퀸')
    assert.equal(style?.style_name, '혜안의 여교황 (레조넌스)')
    assert.equal(style?.unit, 'P5R')
    assert.equal(style?.element, '무')
    assert.equal(style?.isResonance, true)
    assert.equal(style?.isLatest, undefined)
    assert.equal(style?.image_url, '/images/styles/queen_persona_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/queen_persona_res.webp', import.meta.url)), true)
  })

  it('adds Mona as the P5R event SS style with a verified local image', () => {
    const style = styleMap.get('mona_morgana')

    assert.equal(style?.character_name, '모나')
    assert.equal(style?.style_name, '여명의 마술사')
    assert.equal(style?.unit, 'P5R')
    assert.equal(style?.element, '암')
    assert.equal(style?.isResonance, false)
    assert.equal(style?.isLatest, undefined)
    assert.equal(style?.image_url, '/images/styles/mona_morgana.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/mona_morgana.webp', import.meta.url)), true)
  })

  it('adds Tojo Tsukasa persona with fire element and verified local image', () => {
    const style = styleMap.get('tojo_tsukasa_persona_res')

    assert.equal(style?.character_name, '토죠 츠카사')
    assert.equal(style?.style_name, '격정의 팜 파탈 (레조넌스)')
    assert.equal(style?.unit, '31A')
    assert.equal(style?.element, '화')
    assert.deepEqual(style?.elements, ['화'])
    assert.equal(style?.isResonance, true)
    assert.equal(style?.isLatest, undefined)
    assert.equal(style?.image_url, '/images/styles/tojo_tsukasa_persona_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/tojo_tsukasa_persona_res.webp', import.meta.url)), true)
  })

  it('adds Byakko with dark element and verified local image', () => {
    const style = styleMap.get('byakko_white_fang_res')

    assert.equal(style?.character_name, '뱌코')
    assert.equal(style?.style_name, '전장의 하얀 송곳니 (레조넌스)')
    assert.equal(style?.unit, '31B')
    assert.equal(style?.element, '암')
    assert.equal(style?.isResonance, true)
    assert.equal(style?.isLatest, undefined)
    assert.equal(style?.image_url, '/images/styles/byakko_white_fang_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/byakko_white_fang_res.webp', import.meta.url)), true)
  })

  it('adds Natsume Inori with ice element and composited icon image', () => {
    const style = styleMap.get('natsume_inori_hanakage_res')

    assert.equal(style?.character_name, '나츠메 이노리')
    assert.equal(style?.style_name, '화영 (레조넌스)')
    assert.equal(style?.unit, '31F')
    assert.equal(style?.element, '빙')
    assert.equal(style?.isResonance, true)
    assert.equal(style?.isLatest, undefined)
    assert.equal(style?.image_url, '/images/styles/natsume_inori_hanakage_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/natsume_inori_hanakage_res.webp', import.meta.url)), true)
  })

  it('adds Kurosawa Maki with thunder element and composited icon image', () => {
    const style = styleMap.get('kurosawa_maki_empress_res')

    assert.equal(style?.character_name, '쿠로사와 마키')
    assert.equal(style?.style_name, '여제 (레조넌스)')
    assert.equal(style?.unit, '31F')
    assert.equal(style?.element, '뇌')
    assert.equal(style?.isResonance, true)
    assert.equal(style?.isLatest, undefined)
    assert.equal(style?.image_url, '/images/styles/kurosawa_maki_empress_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/kurosawa_maki_empress_res.webp', import.meta.url)), true)
  })
})
