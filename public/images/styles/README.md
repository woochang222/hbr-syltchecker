# 캐릭터 이미지 설정 가이드

이 폴더에 캐릭터 스타일 이미지를 저장하고, `src/data/styles.json` 파일을 아래와 같이 수정하여 이미지를 표시할 수 있습니다.

## 1. 이미지 파일 준비
이미지 파일명은 가급적 영문과 언더바(`_`)를 사용하여 저장해 주세요.
- 예: `ruka_light_res.png`, `yuki_fire_ss.jpg`

## 2. JSON 데이터 수정 방법
`src/data/styles.json` 파일의 `image_url` 필드에 이미지의 경로를 작성합니다. 
`public` 폴더는 루트(`/`) 경로로 취급되므로 아래와 같이 입력하면 됩니다.

### 예시:
```json
{
  "id": "ruka_light_res",
  "character_name": "카야모리 루카",
  "image_url": "/images/styles/ruka_light_res.png",
  ...
}
```

## 3. 적용 확인
1. 이 폴더(`public/images/styles/`)에 이미지를 넣습니다.
2. `styles.json`에서 `image_url`을 해당 파일명으로 바꿉니다.
3. 브라우저에서 새로고침하여 이미지가 나오는지 확인합니다.

## 이미지 원본

### SS 레조넌스
- nikaido_misato_admiral_res: /images/styles/nikaido_misato_admiral_res.webp
- date_akari_sports_day_res: /images/styles/date_akari_sports_day_res.webp
- ogasawara_hisame_bunny_res: /images/styles/ogasawara_hisame_bunny_res.webp
- aikawa_megumi_unison_res: /images/styles/aikawa_megumi_unison_res.webp
- tezuka_saki_base_res: /images/styles/tezuka_saki_base_res.webp
- nanase_nanami_admiral_res: /images/styles/nanase_nanami_admiral_res.webp
- aoi_erika_white_suit_res: /images/styles/aoi_erika_white_suit_res.webp
- shirakawa_yuina_admiral_res: /images/styles/shirakawa_yuina_admiral_res.webp
- kayamori_ruka_admiral_res: /images/styles/kayamori_ruka_admiral_res.webp
- kanzaki_adelheid_servant_res: /images/styles/kanzaki_adelheid_servant_res.webp
- maruyama_kanata_regalia_res: /images/styles/maruyama_kanata_regalia_res.webp
- yamawaki_unison_res: /images/styles/yamawaki_unison_res.webp
- oshima_minori_midnight_res: /images/styles/oshima_minori_midnight_res.webp
- kunimi_tama_halloween_res: /images/styles/kunimi_tama_halloween_res.webp
- minase_ichigo_pawapuro_res: /images/styles/minase_ichigo_pawapuro_res.webp
- kayamori_ruka_pawapuro_res: /images/styles/kayamori_ruka_pawapuro_res.webp
- carol_reaper_white_suit_res: /images/styles/carol_reaper_white_suit_res.webp
- mizuhara_aina_swimsuit_res: /images/styles/mizuhara_aina_swimsuit_res.webp
- asakura_karen_unison_res: /images/styles/asakura_karen_unison_res.webp
- kiryu_miya_swimsuit_res: /images/styles/kiryu_miya_swimsuit_res.webp
- kura_satomi_swimsuit_res: /images/styles/kura_satomi_swimsuit_res.webp
- aoi_erika_swimsuit_res: /images/styles/aoi_erika_swimsuit_res.webp
- yanagi_mion_admiral_res: /images/styles/yanagi_mion_admiral_res.webp
- bungo_yayoi_unison_res: /images/styles/bungo_yayoi_unison_res.webp
- oshima_ichiko_white_suit_res: /images/styles/oshima_ichiko_white_suit_res.webp
- yamawaki_white_suit_res: /images/styles/yamawaki_white_suit_res.webp
- nanase_nanami_base_res: /images/styles/nanase_nanami_base_res.webp
- shirakawa_yuina_white_suit_res: /images/styles/shirakawa_yuina_white_suit_res.webp
- nikaido_misato_white_suit_res: /images/styles/nikaido_misato_white_suit_res.webp
- izumi_yuki_unison_res: /images/styles/izumi_yuki_unison_res.webp
- shirakawa_yuina_unison_res: /images/styles/shirakawa_yuina_unison_res.webp
- kayamori_ruka_unison_res: /images/styles/kayamori_ruka_unison_res.webp

### SS
- irie_miyuki_faraway_eden: /images/styles/irie_miyuki_faraway_eden.png
- maria_de_angelis_chef: /images/styles/maria_de_angelis_chef.webp
- carol_reaper_chef: /images/styles/carol_reaper_chef.webp
- yamawaki_loneliness: /images/styles/yamawaki_loneliness.webp
- eileen_redmain_foggy_city: /images/styles/eileen_redmain_foggy_city.webp
- oshima_isuzu_night_talk: /images/styles/oshima_isuzu_night_talk.webp
- minase_sumomo_halloween: /images/styles/minase_sumomo_halloween.webp
- charlotta_chef: /images/styles/charlotta_chef.webp
- vritika_balakrishnan_chef: /images/styles/vritika_balakrishnan_chef.webp
- satsuki_mari_servant: /images/styles/satsuki_mari_servant.webp
- oshima_muua_summer_clothes: /images/styles/oshima_muua_summer_clothes.webp
- oshima_niina_summer_clothes: /images/styles/oshima_niina_summer_clothes.webp
- higuchi_seika_swimsuit: /images/styles/higuchi_seika_swimsuit.webp
- hiiragi_kozue_swimsuit: /images/styles/hiiragi_kozue_swimsuit.webp
- ri_yunfa_bride: /images/styles/ri_yunfa_bride.webp
- ishii_iroha_bride: /images/styles/ishii_iroha_bride.webp
- matsuoka_chiroru_heroic: /images/styles/matsuoka_chiroru_heroic.webp
- oshima_yotsuba_yukata: /images/styles/oshima_yotsuba_yukata.webp
- sakuraba_seira_servant: /images/styles/sakuraba_seira_servant.webp
- amane_miko_servant: /images/styles/tenne_miko_servant.webp
- eileen_redmain_breeze: /images/styles/eileen_redmain_breeze.webp
- maria_de_angelis_elegante: /images/styles/maria_de_angelis_elegante.webp
- tsukishiro_monaka_spring_blizzard: /images/styles/tsukishiro_monaka_spring_blizzard.webp
- sugawara_chie_ferity: /images/styles/sugawara_chie_ferity.webp
- asakura_karen_free: /images/styles/asakura_karen_free.webp
- tojo_tsukasa_sorrow: /images/styles/tojo_tsukasa_sorrow.webp
- date_akari_new_year: /images/styles/date_akari_new_year.webp
- murofushi_risa_new_year: /images/styles/murofushi_risa_new_year.webp
- yoshioka_yui_base: /images/styles/yoshioka_yui_base.webp
- iwasawa_masami_base: /images/styles/iwasawa_masami_base.webp
- kayamori_ruka_diva: /images/styles/kayamori_ruka_diva.webp
- hanamura_shiki_resplendent: /images/styles/hanamura_shiki_resplendent.webp
- mikoto_fubuki_santa: /images/styles/mikoto_fubuki_santa.webp
- ishii_iroha_overflow: /images/styles/ishii_iroha_overflow.webp
- mizuhara_aina_deep_sea: /images/styles/mizuhara_aina_deep_sea.webp
- aoi_erika_admiral: /images/styles/aoi_erika_admiral.webp
- higuchi_seika_catharsis: /images/styles/higuchi_seika_catharsis.webp
- minase_sumomo_compassion: /images/styles/minase_sumomo_compassion.webp
- minase_ichigo_cold_beauty: /images/styles/minase_ichigo_cold_beauty.webp
- carol_reaper_carnival: /images/styles/carol_reaper_carnival.webp
- oshima_isuzu_magician: /images/styles/oshima_isuzu_magician.webp
- oshima_minori_yukata: /images/styles/oshima_minori_yukata.webp
- ogasawara_hisame_garnet: /images/styles/ogasawara_hisame_garnet.webp
- natsume_inori_lapis_lazuli: /images/styles/natsume_inori_lapis_lazuli.webp
- matsuoka_chiroru_secret: /images/styles/matsuoka_chiroru_secret.webp
- kurosawa_maki_soushisouai: /images/styles/kurosawa_maki_soushisouai.webp
- asakura_karen_swimsuit: /images/styles/asakura_karen_swimsuit.webp
- aikawa_megumi_swimsuit: /images/styles/aikawa_megumi_swimsuit.webp
- satsuki_mari_swimsuit: /images/styles/satsuki_mari_swimsuit.webp
- kanzaki_adelheid_swimsuit: /images/styles/kanzaki_adelheid_swimsuit.webp
- charlotta_bride: /images/styles/charlotta_bride.webp
- sakuraba_seira_bride: /images/styles/sakuraba_seira_bride.webp
- vritika_balakrishnan_dancer: /images/styles/vritika_balakrishnan_dancer.webp
- eileen_redmain_moonlight: /images/styles/eileen_redmain_moonlight.webp
- maruyama_kanata_bloom: /images/styles/maruyama_kanata_bloom.webp
- mizuhara_aina_pirate: /images/styles/mizuhara_aina_pirate.webp
- kiryu_miya_dream_fire: /images/styles/kiryu_miya_dream_fire.webp
- sugawara_chie_stoic: /images/styles/sugawara_chie_stoic.webp
- ri_yunfa_spring_evening: /images/styles/ri_yunfa_spring_evening.webp
- tojo_tsukasa_bunny: /images/styles/tojo_tsukasa_bunny.webp
- hiiragi_kozue_waitress: /images/styles/hiiragi_kozue_waitress.webp
- amane_miko_supreme: /images/styles/tenne_miko_supreme.webp
- bungo_yayoi_hanami: /images/styles/bungo_yayoi_hanami.webp
- yamawaki_one_piece: /images/styles/yamawaki_one_piece.webp
- izumi_yuki_ruby: /images/styles/izumi_yuki_ruby.webp
- tachibana_kanade_earth_angel: /images/styles/tachibana_kanade_earth_angel.png
- tachibana_kanade_soaring_sword: /images/styles/tachibana_kanade_soaring_sword.webp
- nakamura_yuri_extraordinary: /images/styles/nakamura_yuri_extraordinary.webp
- oshima_muua_new_year: /images/styles/oshima_muua_new_year.webp
- oshima_yotsuba_new_year: /images/styles/oshima_yotsuba_new_year.webp
- minase_ichigo_idol: /images/styles/minase_ichigo_idol.webp
- aoi_erika_idol: /images/styles/aoi_erika_idol.webp
- aikawa_megumi_suit: /images/styles/aikawa_megumi_suit.webp
- kunimi_tama_suit: /images/styles/kunimi_tama_suit.webp
- nikaido_misato_santa: /images/styles/nikaido_misato_santa.webp
- date_akari_santa: /images/styles/date_akari_santa.webp
- maria_de_angelis_fleeting_encounter: /images/styles/maria_de_angelis_fleeting_encounter.webp
- charlotta_eternal_feelings: /images/styles/charlotta_eternal_feelings.webp
- tsukishiro_monaka_cover: /images/styles/tsukishiro_monaka_cover.webp
- nakamura_yuri_rain_fire: /images/styles/nakamura_yuri_rain_fire.png
- ri_yunfa_celestial_nymph: /images/styles/ri_yunfa_celestial_nymph.webp
- kanzaki_adelheid_girl: /images/styles/kanzaki_adelheid_girl.webp
- oshima_isuzu_yukata: /images/styles/oshima_isuzu_yukata.webp
- oshima_niina_yukata: /images/styles/oshima_niina_yukata.webp
- izumi_yuki_dress: /images/styles/izumi_yuki_dress.webp
- kiryu_miya_houraku: /images/styles/kiryu_miya_houraku.webp
- yanagi_mion_night_breeze: /images/styles/yanagi_mion_night_breeze.webp
- natsume_inori_butterfly: /images/styles/natsume_inori_butterfly.webp
- asakura_karen_suit: /images/styles/asakura_karen_suit.webp
- tojo_tsukasa_suit: /images/styles/tojo_tsukasa_suit.webp
- shirakawa_yuina_swimsuit: /images/styles/shirakawa_yuina_swimsuit.webp
- kunimi_tama_swimsuit: /images/styles/kunimi_tama_swimsuit.png
- date_akari_base: /images/styles/date_akari_base.webp
- tenne_miko_magical_cat: /images/styles/tenne_miko_magical_cat.webp
- murofushi_risa_smile_technical_exchange: /images/styles/murofushi_risa_smile_technical_exchange.webp
- oshima_ichiko_bride: /images/styles/oshima_ichiko_bride.webp
- satsuki_mari_bride: /images/styles/satsuki_mari_bride.webp
- vritika_balakrishnan_base: /images/styles/vritika_balakrishnan_base.webp
- charlotta_base: /images/styles/charlotta_base.webp
- mizuhara_aina_base: /images/styles/mizuhara_aina_base.webp
- ogasawara_hisame_maid: /images/styles/ogasawara_hisame_maid.webp
- aoi_erika_maid: /images/styles/aoi_erika_maid.webp
- byakko_queen: /images/styles/byakko_queen.webp
- byakko_white_fang_res: /images/styles/byakko_white_fang_res.webp
- kura_satomi_young_landlady: /images/styles/kura_satomi_young_landlady.webp
- aikawa_megumi_miko: /images/styles/aikawa_megumi_miko.webp
- satsuki_mari_assassin: /images/styles/satsuki_mari_assassin.webp
- kanzaki_adelheid_ice_flower: /images/styles/kanzaki_adelheid_ice_flower.webp
- mikoto_fubuki_base: /images/styles/mikoto_fubuki_base.webp
- sugawara_chie_pure_heart: /images/styles/sugawara_chie_pure_heart.webp
- oshima_yotsuba_base: /images/styles/oshima_yotsuba_base.webp
- oshima_muua_base: /images/styles/oshima_muua_base.webp
- izumi_yuki_suit: /images/styles/izumi_yuki_suit.webp
- kayamori_ruka_suit: /images/styles/kayamori_ruka_suit.webp
- maria_de_angelis_base: /images/styles/maria_de_angelis_base.webp
- ri_yunfa_base: /images/styles/ri_yunfa_base.webp
- sakuraba_seira_new_year: /images/styles/sakuraba_seira_new_year.webp
- kunimi_tama_new_year: /images/styles/kunimi_tama_new_year.webp
- bungo_yayoi_happy_legion: /images/styles/bungo_yayoi_happy_legion.webp
- yamawaki_holy_knight: /images/styles/yamawaki_holy_knight.webp
- kurosawa_maki_base: /images/styles/kurosawa_maki_base.webp
- natsume_inori_base: /images/styles/natsume_inori_base.webp
- oshima_minori_base: /images/styles/oshima_minori_base.webp
- oshima_niina_base: /images/styles/oshima_niina_base.webp
- higuchi_seika_exploration: /images/styles/higuchi_seika_exploration.webp
- hiiragi_kozue_finale: /images/styles/hiiragi_kozue_finale.webp
- murofushi_risa_base: /images/styles/murofushi_risa_base.webp
- ishii_iroha_base: /images/styles/ishii_iroha_base.webp
- shirakawa_yuina_infernal: /images/styles/shirakawa_yuina_infernal.webp
- kiryu_miya_base: /images/styles/kiryu_miya_base.webp
- matsuoka_chiroru_base: /images/styles/matsuoka_chiroru_base.webp
- hanamura_shiki_base: /images/styles/hanamura_shiki_base.webp
- eileen_redmain_base: /images/styles/eileen_redmain_base.webp
- carol_reaper_base: /images/styles/carol_reaper_base.webp
- minase_sumomo_swimsuit: /images/styles/minase_sumomo_swimsuit.webp
- tojo_tsukasa_swimsuit: /images/styles/tojo_tsukasa_swimsuit.webp
- izumi_yuki_yukata: /images/styles/izumi_yuki_yukata.webp
- aoi_erika_base: /images/styles/aoi_erika_base.webp
- oshima_isuzu_base: /images/styles/oshima_isuzu_base.webp
- kanzaki_adelheid_base: /images/styles/kanzaki_adelheid_base.webp
- oshima_ichiko_base: /images/styles/oshima_ichiko_base.webp
- hiiragi_kozue_base: /images/styles/hiiragi_kozue_base.webp
- asakura_karen_scarlet_rebellion: /images/styles/asakura_karen_scarlet_rebellion.webp
- yanagi_mion_base: /images/styles/yanagi_mion_base.webp
- maruyama_kanata_base: /images/styles/maruyama_kanata_base.webp
- kura_satomi_base: /images/styles/kura_satomi_base.webp
- kayamori_ruka_cardinal_echo: /images/styles/kayamori_ruka_cardinal_echo.webp
- shirakawa_yuina_base: /images/styles/shirakawa_yuina_base.webp
- nikaido_misato_base: /images/styles/nikaido_misato_base.webp
- kunimi_tama_magical_elemental: /images/styles/kunimi_tama_magical_elemental.webp
- minase_sumomo_base: /images/styles/minase_sumomo_base.webp
- minase_ichigo_base: /images/styles/minase_ichigo_base.webp
- tsukishiro_monaka_base: /images/styles/tsukishiro_monaka_base.webp
- aikawa_megumi_one_night_dream: /images/styles/aikawa_megumi_one_night_dream.webp
- yamawaki_base: /images/styles/yamawaki_base.webp
- satsuki_mari_base: /images/styles/satsuki_mari_base.webp
- kayamori_ruka_circuit_burst: /images/styles/kayamori_ruka_circuit_burst.webp
- kayamori_ruka_base: /images/styles/kayamori_ruka_base.webp
- izumi_yuki_base: /images/styles/izumi_yuki_base.webp
- aikawa_megumi_base: /images/styles/aikawa_megumi_base.webp
- tojo_tsukasa_base: /images/styles/tojo_tsukasa_base.webp
- asakura_karen_base: /images/styles/asakura_karen_base.webp
- kunimi_tama_base: /images/styles/kunimi_tama_base.webp
- higuchi_seika_base: /images/styles/higuchi_seika_base.webp
- byakko_base: /images/styles/byakko_base.webp
- sakuraba_seira_base: /images/styles/sakuraba_seira_base.webp
- amane_miko_base: /images/styles/tenne_miko_base.webp
- bungo_yayoi_base: /images/styles/bungo_yayoi_base.webp
- sugawara_chie_base: /images/styles/sugawara_chie_base.webp
