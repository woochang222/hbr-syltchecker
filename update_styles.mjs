import fs from 'fs';
import path from 'path';

const stylesPath = 'src/data/styles.json';
const styles = JSON.parse(fs.readFileSync(stylesPath, 'utf8'));

const nameMapping = {
  '카야모리 루카': 'kayamori_ruka',
  '이즈미 유키': 'izumi_yuki',
  '아이카와 메구미': 'aikawa_megumi',
  '토죠 츠카사': 'tojo_tsukasa',
  '아사쿠라 카렌': 'asakura_karen',
  '쿠니미 타마': 'kunimi_tama',
  '아오이 에리카': 'aoi_erika',
  '미나세 이치고': 'minase_ichigo',
  '미나세 스모모': 'minase_sumomo',
  '히구치 세이카': 'higuchi_seika',
  '히이라기 코즈에': 'hiiragi_kozue',
  '뱌코': 'byakko',
  '야마와키 본 이바르': 'yamawaki',
  '분고 야요이': 'bungo_yayoi',
  '칸자키 아델하이드': 'kanzaki_adelheid',
  '사츠키 마리': 'satsuki_mari',
  '스가와라 치에': 'sugawara_chie',
  '키류 미야': 'kiryu_miya',
  '시라카와 유이나': 'shirakawa_yuina',
  '사쿠라바 세이라': 'sakuraba_seira',
  '쿠라 사토미': 'kura_satomi',
  '다테 아카리': 'date_akari',
  '미즈하라 아이나': 'mizuhara_aina',
  '니카이도 미사토': 'nikaido_misato',
  '오오시마 이치코': 'oshima_ichiko',
  '오오시마 니이나': 'oshima_niina',
  '오오시마 미노리': 'oshima_minori',
  '오오시마 요츠바': 'oshima_yotsuba',
  '오오시마 이스즈': 'oshima_isuzu',
  '오오시마 무우아': 'oshima_muua',
  '야나기 미온': 'yanagi_mion',
  '마루야마 카나타': 'maruyama_kanata',
  '쿠로사와 마키': 'kurosawa_maki',
  '하나무라 시키': 'hanamura_shiki',
  '마츠오카 치로루': 'matsuoka_chiroru',
  '나츠메 이노리': 'natsume_inori',
  '미코토 후부키': 'mikoto_fubuki',
  '캐롤 리퍼': 'carol_reaper',
  '아이린 레드메인': 'eileen_redmain',
  '브리티카 발라크리슈난': 'vritika_balakrishnan',
  '마리아 데 안젤리스': 'maria_de_angelis',
  '샬로타 스코폽스카야': 'charlotta',
  '리 잉시아': 'ri_yunfa',
  '이시이 이로하': 'ishii_iroha',
  '요시오카 유이': 'yoshioka_yui',
  '이와사와 마사미': 'iwasawa_masami',
  '나나세 나나미': 'nanase_nanami',
  '츠키시로 모나카': 'tsukishiro_monaka',
  '아마네 미코': 'amane_miko',
  '무로후시 리사': 'murofushi_risa',
  '테즈카 사키': 'tezuka_saki',
  '나카무라 유리': 'nakamura_yuri',
  '타치바나 카나데': 'tachibana_kanade'
};

const styleMap = {
  '광휘의 메시아': 'admiral_res',
  '격돌!! 전광석화': 'base',
  '일기당천의 기세': 'suit',
  '돌격!! 에어 베이스': 'base'
};

const updatedStyles = styles.map(style => {
  const charEn = nameMapping[style.character_name] || 'unknown';
  let styleEn = styleMap[style.style_name] || 'base';
  
  if (style.isResonance && !styleEn.endsWith('_res')) {
    styleEn += '_res';
  }

  const newId = `${charEn}_${styleEn}`;
  const fileName = `${newId}.webp`;
  
  return {
    ...style,
    id: newId,
    image_url: `/images/styles/${fileName}`
  };
});

fs.writeFileSync(stylesPath, JSON.stringify(updatedStyles, null, 2));
console.log('Updated src/data/styles.json successfully');
