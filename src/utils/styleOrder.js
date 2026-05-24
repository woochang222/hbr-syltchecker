import { isBaseStyle } from './baseStyleBoost.js'

export const OFFICIAL_UNIT_ORDER = [
  '31A',
  '31B',
  '31C',
  '30G',
  '31D',
  '31E',
  '31F',
  '31X',
  '사령부',
  'AB',
  'P5R'
]

export const OFFICIAL_CHARACTER_ORDER = [
  '카야모리 루카',
  '이즈미 유키',
  '아이카와 메구미',
  '토죠 츠카사',
  '아사쿠라 카렌',
  '쿠니미 타마',
  '아오이 에리카',
  '미나세 이치고',
  '미나세 스모모',
  '히구치 세이카',
  '히이라기 코즈에',
  '뱌코',
  '야마와키 본 이바르',
  '사쿠라바 세이라',
  '텐네 미코',
  '분고 야요이',
  '칸자키 아델하이드',
  '사츠키 마리',
  '시라카와 유이나',
  '츠키시로 모나카',
  '키류 미야',
  '스가와라 치에',
  '오가사와라 히사메',
  '쿠라 사토미',
  '니카이도 미사토',
  '이시이 이로하',
  '미코토 후부키',
  '무로후시 리사',
  '다테 아카리',
  '미즈하라 아이나',
  '오오시마 이치코',
  '오오시마 니이나',
  '오오시마 미노리',
  '오오시마 요츠하',
  '오오시마 이스즈',
  '오오시마 무우아',
  '야나기 미온',
  '마루야마 카나타',
  '하나무라 시키',
  '마츠오카 치로루',
  '나츠메 이노리',
  '쿠로사와 마키',
  '캐롤 리퍼',
  '리 잉시아',
  '아이린 레드메인',
  '브리티카 발라크리슈난',
  '마리아 데 안젤리스',
  '샬로타 스코폽스카야',
  '나카무라 유리',
  '타치바나 카나데',
  '이리에 미유키',
  '이와사와 마사미',
  '요시오카 유이',
  '나나세 나나미',
  '테즈카 사키',
  '모나',
  '퀸'
]

const unitOrder = new Map(OFFICIAL_UNIT_ORDER.map((unit, index) => [unit, index]))
const characterOrder = new Map(OFFICIAL_CHARACTER_ORDER.map((character, index) => [character, index]))

const HBR_QUEST_STYLE_ORDER = {
  '카야모리 루카': [
    '섬광의 서킷 버스트',
    '잔향의 카디널',
    '슈트',
    '유니온 (레조넌스)',
    '가희',
    '파와푸로 (레조넌스)',
    '어드미럴 (레조넌스)'
  ],
  '뱌코': [
    '여왕',
    '전장의 하얀 송곳니 (레조넌스)'
  ],
  '야마와키 본 이바르': [
    'Holy Knight',
    '원피스',
    '화이트 슈트 (레조넌스)',
    '유니온 (레조넌스)',
    '론리니스'
  ],
  '오가사와라 히사메': [
    '몽롱한 달밤의 불릿',
    '메이드',
    '희구와 갈앙',
    '가넷',
    '바니 (레조넌스)'
  ],
  '캐롤 리퍼': [
    '카니발',
    '화이트 슈트 (레조넌스)',
    '요리사'
  ]
}

const styleOrderByCharacter = new Map(
  Object.entries(HBR_QUEST_STYLE_ORDER).map(([character, styles]) => [
    character,
    new Map(styles.map((styleName, index) => [styleName, index]))
  ])
)

const fallbackOrder = 9999

const getReleaseDateTime = style => {
  if (!style.releaseDate) return null

  const dateTime = Date.parse(style.releaseDate)
  return Number.isNaN(dateTime) ? null : dateTime
}

const getKnownStyleOrder = style => {
  return styleOrderByCharacter.get(style.character_name)?.get(style.style_name) ?? null
}

export const sortStylesByOfficialOrder = (styles) => {
  return styles
    .map((style, index) => ({ style, index }))
    .sort((left, right) => {
      const unitDiff = (unitOrder.get(left.style.unit) ?? fallbackOrder) -
        (unitOrder.get(right.style.unit) ?? fallbackOrder)
      if (unitDiff !== 0) return unitDiff

      const characterDiff = (characterOrder.get(left.style.character_name) ?? fallbackOrder) -
        (characterOrder.get(right.style.character_name) ?? fallbackOrder)
      if (characterDiff !== 0) return characterDiff

      const baseDiff = Number(isBaseStyle(right.style)) - Number(isBaseStyle(left.style))
      if (baseDiff !== 0) return baseDiff

      const leftKnownStyleOrder = getKnownStyleOrder(left.style)
      const rightKnownStyleOrder = getKnownStyleOrder(right.style)
      if (leftKnownStyleOrder !== null && rightKnownStyleOrder !== null) {
        const styleOrderDiff = leftKnownStyleOrder - rightKnownStyleOrder
        if (styleOrderDiff !== 0) return styleOrderDiff
      }

      const leftReleaseDate = getReleaseDateTime(left.style)
      const rightReleaseDate = getReleaseDateTime(right.style)
      if (leftReleaseDate !== null && rightReleaseDate !== null) {
        const releaseDateDiff = leftReleaseDate - rightReleaseDate
        if (releaseDateDiff !== 0) return releaseDateDiff
      }

      return right.index - left.index
    })
    .map(({ style }) => style)
}
