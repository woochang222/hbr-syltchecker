import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildOwnedStatusFilename,
  formatExportDate,
  getExportImageUrl,
  groupStylesForOwnedStatusExport,
  isOwnedStyle
} from './ownedStatusExport.js'

const styles = [
  {
    id: 'ruka_base',
    unit: '31A',
    character_name: '카야모리 루카',
    style_name: '잔향의 카디널',
    image_url: '/images/styles/ruka_base.webp'
  },
  {
    id: 'ruka_suit',
    unit: '31A',
    character_name: '카야모리 루카',
    style_name: '수트',
    image_url: 'images/styles/ruka_suit.webp'
  },
  {
    id: 'yuki_base',
    unit: '31A',
    character_name: '이즈미 유키',
    style_name: '잔광',
    image_url: '/images/styles/yuki_base.webp'
  },
  {
    id: 'seira_base',
    unit: '31C',
    character_name: '사쿠라바 세이라',
    style_name: '별의 바다',
    image_url: '/images/styles/seira_base.webp'
  }
]

describe('isOwnedStyle', () => {
  it('treats any defined ownership value as owned, including zero', () => {
    assert.equal(isOwnedStyle(undefined), false)
    assert.equal(isOwnedStyle(0), true)
    assert.equal(isOwnedStyle(1), true)
    assert.equal(isOwnedStyle(4), true)
  })
})

describe('groupStylesForOwnedStatusExport', () => {
  it('groups styles by unit and then character while preserving order', () => {
    assert.deepEqual(
      groupStylesForOwnedStatusExport(
        styles,
        {
          ruka_base: 4,
          ruka_suit: 0,
          seira_base: 2
        },
        {
          ruka_suit: true
        }
      ),
      [
        {
          unit: '31A',
          total: 3,
          owned: 2,
          characters: [
            {
              characterName: '카야모리 루카',
              total: 2,
              owned: 2,
              styles: [
                {
                  id: 'ruka_base',
                  characterName: '카야모리 루카',
                  styleName: '잔향의 카디널',
                  imageUrl: '/images/styles/ruka_base.webp',
                  ownedCount: 4,
                  isOwned: true,
                  hasDaphne: false,
                  hasBaseLimitBreakBoost: false
                },
                {
                  id: 'ruka_suit',
                  characterName: '카야모리 루카',
                  styleName: '수트',
                  imageUrl: 'images/styles/ruka_suit.webp',
                  ownedCount: 0,
                  isOwned: true,
                  hasDaphne: true,
                  hasBaseLimitBreakBoost: false
                }
              ]
            },
            {
              characterName: '이즈미 유키',
              total: 1,
              owned: 0,
              styles: [
                {
                  id: 'yuki_base',
                  characterName: '이즈미 유키',
                  styleName: '잔광',
                  imageUrl: '/images/styles/yuki_base.webp',
                  ownedCount: undefined,
                  isOwned: false,
                  hasDaphne: false,
                  hasBaseLimitBreakBoost: false
                }
              ]
            }
          ]
        },
        {
          unit: '31C',
          total: 1,
          owned: 1,
          characters: [
            {
              characterName: '사쿠라바 세이라',
              total: 1,
              owned: 1,
              styles: [
                {
                  id: 'seira_base',
                  characterName: '사쿠라바 세이라',
                  styleName: '별의 바다',
                  imageUrl: '/images/styles/seira_base.webp',
                  ownedCount: 2,
                  isOwned: true,
                  hasDaphne: false,
                  hasBaseLimitBreakBoost: false
                }
              ]
            }
          ]
        }
      ]
    )
  })

  it('marks four-break styles when the same character base style is four-break', () => {
    const [unit] = groupStylesForOwnedStatusExport(
      [
        {
          id: 'ruka_base',
          unit: '31A',
          character_name: '카야모리 루카',
          style_name: '기본',
          image_url: '/images/styles/ruka_base.webp'
        },
        {
          id: 'ruka_ss',
          unit: '31A',
          character_name: '카야모리 루카',
          style_name: 'SS 스타일',
          image_url: '/images/styles/ruka_ss.webp'
        }
      ],
      {
        ruka_base: 4,
        ruka_ss: 4
      },
      {}
    )

    assert.deepEqual(
      unit.characters[0].styles.map(style => style.hasBaseLimitBreakBoost),
      [true, true]
    )
  })

  it('defaults omitted Daphne styles to false for exported styles', () => {
    const [unit] = groupStylesForOwnedStatusExport(
      [
        {
          id: 'ruka_base',
          unit: '31A',
          character_name: '카야모리 루카',
          style_name: '기본',
          image_url: '/images/styles/ruka_base.webp'
        }
      ],
      {
        ruka_base: 4
      }
    )

    assert.deepEqual(
      unit.characters[0].styles.map(style => style.hasDaphne),
      [false]
    )
  })
})

describe('formatExportDate', () => {
  it('formats dates for Korean display', () => {
    assert.equal(formatExportDate(new Date(2026, 3, 29, 12, 34, 56)), '2026.04.29')
  })
})

describe('buildOwnedStatusFilename', () => {
  it('uses an ISO-like date in the filename', () => {
    assert.equal(
      buildOwnedStatusFilename(new Date(2026, 3, 29, 12, 34, 56)),
      'hbr-owned-status-2026-04-29.png'
    )
  })
})

describe('getExportImageUrl', () => {
  it('prefixes local absolute public paths with the Vite base path', () => {
    assert.equal(
      getExportImageUrl('/images/styles/ruka_base.webp', '/hbr-syltchecker/'),
      '/hbr-syltchecker/images/styles/ruka_base.webp'
    )
  })

  it('prefixes local relative public paths with the Vite base path', () => {
    assert.equal(
      getExportImageUrl('images/styles/ruka_suit.webp', '/hbr-syltchecker/'),
      '/hbr-syltchecker/images/styles/ruka_suit.webp'
    )
  })

  it('returns an empty string for missing image urls', () => {
    assert.equal(getExportImageUrl(undefined, '/hbr-syltchecker/'), '')
  })
})
