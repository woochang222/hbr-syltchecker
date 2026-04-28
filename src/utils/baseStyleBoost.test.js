import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildBaseStyleOwnershipByCharacter,
  hasBaseStyleLimitBreakBoost,
  isBaseStyle
} from './baseStyleBoost.js'

const styles = [
  { id: 'ruka_base', character_name: '루카', style_name: '기본' },
  { id: 'ruka_ss', character_name: '루카', style_name: 'SS 스타일' },
  { id: 'yuki_base_res', character_name: '유키', style_name: '기본 (레조넌스)' },
  { id: 'yuki_ss', character_name: '유키', style_name: 'SS 스타일' }
]

describe('isBaseStyle', () => {
  it('treats base and base resonance styles as base styles', () => {
    assert.equal(isBaseStyle(styles[0]), true)
    assert.equal(isBaseStyle(styles[2]), true)
    assert.equal(isBaseStyle(styles[1]), false)
  })
})

describe('hasBaseStyleLimitBreakBoost', () => {
  it('highlights a four-break style when the same character base style is also four-break', () => {
    const baseOwnership = buildBaseStyleOwnershipByCharacter(styles, {
      ruka_base: 4,
      ruka_ss: 4
    })

    assert.equal(hasBaseStyleLimitBreakBoost(styles[1], 4, baseOwnership), true)
  })

  it('does not highlight when either the current style or base style is not four-break', () => {
    const baseOwnership = buildBaseStyleOwnershipByCharacter(styles, {
      ruka_base: 3,
      ruka_ss: 4,
      yuki_base_res: 4,
      yuki_ss: 3
    })

    assert.equal(hasBaseStyleLimitBreakBoost(styles[1], 4, baseOwnership), false)
    assert.equal(hasBaseStyleLimitBreakBoost(styles[3], 3, baseOwnership), false)
  })
})
