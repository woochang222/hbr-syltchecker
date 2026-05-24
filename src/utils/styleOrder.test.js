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
      { id: 'queen', character_name: '퀸', style_name: '혜안의 여교황', unit: 'P5R' },
      { id: 'mona', character_name: '모나', style_name: '여명의 마술사', unit: 'P5R' },
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
        'nanami',
        'kanade',
        'mona',
        'queen'
      ]
    )
  })

  it('puts base styles first and sorts the same character by release date', () => {
    const input = [
      { id: 'latest', character_name: '카야모리 루카', style_name: '최신', unit: '31A', releaseDate: '2024-03-01' },
      { id: 'base', character_name: '카야모리 루카', style_name: '기본', unit: '31A', releaseDate: '2022-02-10' },
      { id: 'oldest', character_name: '카야모리 루카', style_name: '초기 SS', unit: '31A', releaseDate: '2022-03-01' }
    ]

    assert.deepEqual(
      sortStylesByOfficialOrder(input).map(style => style.id),
      ['base', 'oldest', 'latest']
    )
  })

  it('uses source order as newest-first release order when release dates are missing', () => {
    const input = [
      { id: 'latest', character_name: '카야모리 루카', style_name: '최신', unit: '31A' },
      { id: 'middle', character_name: '카야모리 루카', style_name: '중간', unit: '31A' },
      { id: 'base', character_name: '카야모리 루카', style_name: '기본', unit: '31A' },
      { id: 'oldest', character_name: '카야모리 루카', style_name: '초기 SS', unit: '31A' }
    ]

    assert.deepEqual(
      sortStylesByOfficialOrder(input).map(style => style.id),
      ['base', 'oldest', 'middle', 'latest']
    )
  })

  it('sorts known styles by the hbr.quest character card order', () => {
    const input = [
      { id: 'ruka-diva', character_name: '카야모리 루카', style_name: '가희', unit: '31A' },
      { id: 'ruka-throne', character_name: '카야모리 루카', style_name: '유니온 (레조넌스)', unit: '31A' },
      { id: 'byakko-dark', character_name: '뱌코', style_name: '전장의 하얀 송곳니 (레조넌스)', unit: '31B' },
      { id: 'byakko-thunder', character_name: '뱌코', style_name: '여왕', unit: '31B' },
      { id: 'yamawaki-free', character_name: '야마와키 본 이바르', style_name: '론리니스', unit: '31C' },
      { id: 'yamawaki-thunder', character_name: '야마와키 본 이바르', style_name: '원피스', unit: '31C' },
      { id: 'yamawaki-demon-king', character_name: '야마와키 본 이바르', style_name: '유니온 (레조넌스)', unit: '31C' },
      { id: 'hisame-thunder', character_name: '오가사와라 히사메', style_name: '희구와 갈앙', unit: '30G' },
      { id: 'hisame-dark', character_name: '오가사와라 히사메', style_name: '메이드', unit: '30G' },
      { id: 'carol-steak', character_name: '캐롤 리퍼', style_name: '요리사', unit: '31X' },
      { id: 'carol-white-suit', character_name: '캐롤 리퍼', style_name: '화이트 슈트 (레조넌스)', unit: '31X' }
    ]

    assert.deepEqual(
      sortStylesByOfficialOrder(input).map(style => style.id),
      [
        'ruka-throne',
        'ruka-diva',
        'byakko-thunder',
        'byakko-dark',
        'yamawaki-thunder',
        'yamawaki-demon-king',
        'yamawaki-free',
        'hisame-dark',
        'hisame-thunder',
        'carol-white-suit',
        'carol-steak'
      ]
    )
  })

  it('puts command styles between 31X and collaboration styles', () => {
    const input = [
      { id: 'persona', character_name: '퀸', style_name: '혜안의 여교황 (레조넌스)', unit: 'P5R' },
      { id: 'angel-beats', character_name: '나카무라 유리', style_name: 'rain_fire', unit: 'AB' },
      { id: 'command', character_name: '나나세 나나미', style_name: '기본 (레조넌스)', unit: '사령부' },
      { id: 'thirty-one-x', character_name: '캐롤 리퍼', style_name: '기본', unit: '31X' }
    ]

    assert.deepEqual(
      sortStylesByOfficialOrder(input).map(style => style.id),
      ['thirty-one-x', 'command', 'angel-beats', 'persona']
    )
  })

  it('sorts P5R characters with Mona before Queen', () => {
    const input = [
      { id: 'queen', character_name: '퀸', style_name: '혜안의 여교황 (레조넌스)', unit: 'P5R' },
      { id: 'mona', character_name: '모나', style_name: '여명의 마술사', unit: 'P5R' }
    ]

    assert.deepEqual(
      sortStylesByOfficialOrder(input).map(style => style.id),
      ['mona', 'queen']
    )
  })
})
