export const OFFICIAL_UNIT_ORDER = [
  '31A',
  '31B',
  '31C',
  '30G',
  '31D',
  '31E',
  '31F',
  '31X',
  'AB',
  '사령부'
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
  '테즈카 사키'
]

const unitOrder = new Map(OFFICIAL_UNIT_ORDER.map((unit, index) => [unit, index]))
const characterOrder = new Map(OFFICIAL_CHARACTER_ORDER.map((character, index) => [character, index]))

const fallbackOrder = 9999

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

      return left.index - right.index
    })
    .map(({ style }) => style)
}
