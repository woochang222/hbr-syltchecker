import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nameMapping = {
  "茅森月歌": "kayamori_ruka",
  "和泉ユキ": "izumi_yuki",
  "逢川めぐみ": "aikawa_megumi",
  "東城つかさ": "tojo_tsukasa",
  "朝倉可憐": "asakura_karen",
  "國見タマ": "kunimi_tama",
  "蒼井えりか": "aoi_erika",
  "水瀬いちご": "minase_ichigo",
  "水瀬すもも": "minase_sumomo",
  "樋口聖華": "higuchi_seika",
  "柊木梢": "hiiragi_kozue",
  "ビャッコ": "byakko",
  "山脇・ボン・イヴァール": "yamawaki",
  "豊後弥生": "bungo_yayoi",
  "神崎アーデルハイド": "kanzaki_adelheid",
  "佐月マリ": "satsuki_mari",
  "菅原千恵": "sugawara_chie",
  "桐生美也": "kiryu_miya",
  "白河ユイナ": "shirakawa_yuina",
  "桜庭星羅": "sakuraba_seira",
  "蔵里見": "kura_satomi",
  "伊達朱里": "date_akari",
  "瑞原あいな": "mizuhara_aina",
  "二階堂三郷": "nikaido_misato",
  "大島一千子": "oshima_ichiko",
  "大島二以奈": "oshima_niina",
  "大島三野里": "oshima_minori",
  "大島四ツ葉": "oshima_yotsuba",
  "大島五十鈴": "oshima_isuzu",
  "大島六宇亜": "oshima_muua",
  "柳美音": "yanagi_mion",
  "丸山奏多": "maruyama_kanata",
  "黒沢真希": "kurosawa_maki",
  "華村詩紀": "hanamura_shiki",
  "松岡チロル": "matsuoka_chiroru",
  "夏目祈": "natsume_inori",
  "命吹雪": "mikoto_fubuki",
  "キャロル・リーパー": "carol_reaper",
  "アイリーン・レドメイン": "eileen_redmain",
  "ヴリティカ・バラクリシュナン": "vritika_balakrishnan",
  "マリア・デ・アンジェリス": "maria_de_angelis",
  "シャルロッタ・スコポフスカヤ": "charlotta",
  "李映夏": "ri_yunfa",
  "石井色葉": "ishii_iroha",
  "芳岡ユイ": "yoshioka_yui",
  "岩沢雅美": "iwasawa_masami",
  "七瀬七海": "nanase_nanami",
  "月城最中": "tsukishiro_monaka",
  "天音巫呼": "amane_miko",
  "室伏理沙": "murofushi_risa"
};

// Extremely rough transliteration for romanizing style names
const romanizeStyle = (str) => {
  const charMap = {
    "アドミラル": "admiral",
    "しもべ": "servant",
    "運動会": "sports_day",
    "白スーツ": "white_suit",
    "ユニゾン": "unison",
    "水着": "swimsuit",
    "レガリア": "regalia",
    "ハロウィン": "halloween",
    "パワプロ": "pawapuro",
    "ミッドナイト": "midnight",
    "料理人": "chef",
    "ロンリネス": "loneliness",
    "霧煙る街": "foggy_city",
    "夜語り": "night_talk",
    "夏服": "summer_clothes",
    "花嫁": "bride",
    "ヒロイック": "heroic",
    "浴衣": "yukata",
    "そよ風": "breeze",
    "エレガンテ": "elegante",
    "春吹雪": "spring_blizzard",
    "フェリティ": "ferity",
    "配布": "free",
    "哀情": "sorrow",
    "正月": "new_year",
    "歌姫": "diva",
    "再耀": "resplendent",
    "サンタ": "santa",
    "オーバーフロー": "overflow",
    "溟海": "deep_sea",
    "カタルシス": "catharsis",
    "愛憐": "compassion",
    "冷艶": "cold_beauty",
    "マジシャン": "magician",
    "ガーネット": "garnet",
    "ラピスラズリ": "lapis_lazuli",
    "内緒": "secret",
    "走死走愛": "soushisouai",
    "踊り子": "dancer",
    "月下": "moonlight",
    "ブルーム": "bloom",
    "海賊": "pirate",
    "夢火": "dream_fire",
    "ストイック": "stoic",
    "春宵": "spring_evening",
    "バニー": "bunny",
    "ウェイトレス": "waitress",
    "至高": "supreme",
    "お花見": "hanami",
    "ワンピース": "one_piece",
    "紅玉": "ruby",
    "天翔ける剣": "soaring_sword",
    "非日常": "extraordinary",
    "スーツ": "suit",
    "天女": "celestial_nymph",
    "少女": "girl",
    "ドレス": "dress",
    "豊楽": "houraku",
    "夜風": "night_breeze",
    "夢見鳥": "butterfly",
    "メイド": "maid",
    "女王": "queen",
    "若女将": "young_landlady",
    "巫女": "miko",
    "アサシン": "assassin",
    "氷花": "ice_flower",
    "純心": "pure_heart",
    "探究": "exploration",
    "終劇": "finale",
    "Carnival": "carnival",
    "Infernal": "infernal",
    "初期": "base"
  };
  
  if (charMap[str]) return charMap[str];

  // Very basic romanization fallback for unrecognized kanji/kana
  // Let's just remove non-alphanumeric and convert kana roughly, or just fallback to generic
  let out = str.replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/gi, '').toLowerCase();
  
  // if still contains japanese, just fallback to 'style'
  if (/[^\w\s]/.test(out)) {
    // If it's a known style, we'll handle it manually or just use a generic word and hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return `style_${Math.abs(hash)}`;
  }
  return out || "base";
};

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      res.setEncoding('binary');
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(filepath, data, 'binary');
        resolve();
      });
    }).on('error', reject);
  });
};

const processReadme = async () => {
  const readmePath = path.join(__dirname, 'public/images/styles/README.md');
  const content = fs.readFileSync(readmePath, 'utf8');

  const lines = content.split('\n');
  const newLines = [];
  
  let inUrlList = false;

  for (const line of lines) {
    if (line.includes('## 이미지 원본')) {
      inUrlList = true;
      newLines.push(line);
      continue;
    }

    if (inUrlList && line.startsWith('- SS')) {
      // Extract name and url
      const match = line.match(/^- (SS(?:レゾナンス)?)(.*?)(?:\((.*?)\))?: (http.*)$/);
      if (match) {
        const isResonance = match[1].includes('レゾナンス');
        const charNameJp = match[2];
        const styleJp = match[3] || '初期';
        const url = match[4];
        
        let charNameEn = nameMapping[charNameJp];
        if (!charNameEn) {
          console.warn(`Unknown character: ${charNameJp}`);
          charNameEn = 'unknown';
        }
        
        const styleEn = romanizeStyle(styleJp);
        
        // Ext from url
        const extMatch = url.match(/\.([a-z0-9]+)(?:[\?\/]|$)/i);
        const ext = extMatch ? extMatch[1] : 'webp';
        
        const fileName = `${charNameEn}_${styleEn}${isResonance ? '_res' : ''}.${ext}`;
        const savePath = path.join(__dirname, 'public/images/styles', fileName);
        
        console.log(`Downloading: ${charNameJp} (${styleJp}) -> ${fileName}`);
        try {
          await downloadImage(url, savePath);
          newLines.push(`- ${charNameJp}(${styleJp}): /images/styles/${fileName}`);
        } catch (e) {
          console.error(`Failed to download ${url}: ${e.message}`);
          newLines.push(line); // Keep original if failed
        }
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }

  fs.writeFileSync(readmePath, newLines.join('\n'));
  console.log('Finished downloading and updating README.md');
};

processReadme().catch(console.error);
