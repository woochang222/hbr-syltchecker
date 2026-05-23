import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))
const styleMap = new Map(styles.map(style => [style.id, style]))

describe('new resonance styles', () => {
  it('marks only the newest released style as latest', () => {
    const latestStyleIds = styles
      .filter(style => style.isLatest)
      .map(style => style.id)

    assert.deepEqual(latestStyleIds, ['tojo_tsukasa_persona_res'])
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
    assert.equal(style?.isLatest, true)
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
