import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { sortStylesByOfficialOrder } from './styleOrder.js'

describe('sortStylesByOfficialOrder', () => {
  it('sorts units and characters by the official fankit order', () => {
    const input = [
      { id: 'kanade', character_name: '타치바나 카나데', style_name: '천상의 검', unit: 'AB' },
      { id: 'maki', character_name: '쿠로사와 마키', style_name: '기본', unit: '31F' },
      { id: 'ruka', character_name: '카야모리 루카', style_name: '기본', unit: '31A' },
      { id: 'yuina', character_name: '시라카와 유이나', style_name: '기본', unit: '30G' },
      { id: 'ichiko', character_name: '오오시마 이치코', style_name: '기본', unit: '31E' },
      { id: 'carol', character_name: '캐롤 리퍼', style_name: '기본', unit: '31X' },
      { id: 'nanami', character_name: '나나세 나나미', style_name: '기본', unit: '사령부' },
      { id: 'aoi', character_name: '아오이 에리카', style_name: '기본', unit: '31B' },
      { id: 'yamawaki', character_name: '야마와키 본 이바르', style_name: '기본', unit: '31C' },
      { id: 'misato', character_name: '니카이도 미사토', style_name: '기본', unit: '31D' }
    ]

    assert.deepEqual(
      sortStylesByOfficialOrder(input).map(style => style.id),
      [
        'ruka',
        'aoi',
        'yamawaki',
        'yuina',
        'misato',
        'ichiko',
        'maki',
        'carol',
        'kanade',
        'nanami'
      ]
    )
  })

  it('keeps style order stable within the same character', () => {
    const input = [
      { id: 'second', character_name: '카야모리 루카', style_name: '두번째', unit: '31A' },
      { id: 'first', character_name: '카야모리 루카', style_name: '첫번째', unit: '31A' }
    ]

    assert.deepEqual(
      sortStylesByOfficialOrder(input).map(style => style.id),
      ['second', 'first']
    )
  })
})
