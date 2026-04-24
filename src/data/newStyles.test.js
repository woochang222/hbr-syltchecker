import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))
const styleMap = new Map(styles.map(style => [style.id, style]))

describe('new resonance styles', () => {
  it('adds Natsume Inori with ice element and composited icon image', () => {
    const style = styleMap.get('natsume_inori_hanakage_res')

    assert.equal(style?.character_name, '나츠메 이노리')
    assert.equal(style?.style_name, '화영 (레조넌스)')
    assert.equal(style?.unit, '31F')
    assert.equal(style?.element, '빙')
    assert.equal(style?.isResonance, true)
    assert.equal(style?.image_url, '/images/styles/natsume_inori_hanakage_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/natsume_inori_hanakage_res.webp', import.meta.url)), true)
  })

  it('adds Kurosawa Maki with thunder element and composited icon image', () => {
    const style = styleMap.get('kurosawa_maki_empress_res')

    assert.equal(style?.character_name, '쿠로사와 마키')
    assert.equal(style?.style_name, '여제 (레조넌스)')
    assert.equal(style?.unit, '31E')
    assert.equal(style?.element, '뇌')
    assert.equal(style?.isResonance, true)
    assert.equal(style?.image_url, '/images/styles/kurosawa_maki_empress_res.webp')
    assert.equal(existsSync(new URL('../../public/images/styles/kurosawa_maki_empress_res.webp', import.meta.url)), true)
  })
})
