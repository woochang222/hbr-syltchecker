import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getStyleElements, hasStyleElement } from './styleElements.js'

describe('style element helpers', () => {
  it('uses the elements array when a style has multiple elements', () => {
    const style = { element: '빙', elements: ['빙', '화'] }

    assert.deepEqual(getStyleElements(style), ['빙', '화'])
    assert.equal(hasStyleElement(style, ['화']), true)
  })

  it('falls back to the single element field for legacy styles', () => {
    const style = { element: '광' }

    assert.deepEqual(getStyleElements(style), ['광'])
    assert.equal(hasStyleElement(style, ['암']), false)
  })
})
