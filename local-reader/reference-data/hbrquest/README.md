# Game Style-Select Reference Images

Source site: https://hbr.style/

The publicly served RosterManager component uses each style's `strip` filename from Seraph Database, replacing `Party` with `Select`, under `https://cdn.hbr.quest/webp/jp/card/`.

Example: https://cdn.hbr.quest/webp/jp/card/RKayamoriDefault_R3_Select.webp

These are **landscape illustration crops for the game's style-selection cards**, mostly 356 x 144, with some 354 x 144 images. They are not Game8 square thumbnails, circular character icons (`Thumbnail`), vertical party portraits (`Party`), or full illustrations. The original images do not include the game's overlaid rarity, role, element, level, limit-break, or Daphne markers. Those overlays are recognized separately from a user's screenshot.

`manifest.json` records the public catalog URL, retrieval date, source style IDs/labels, character, rarity, file URL, dimensions and SHA-256 for every downloaded file. Source IDs are Seraph Database/game IDs; they are not the web checker's local style IDs. Do not equate IDs or infer ownership/limit breaks from these clean references.

Refresh the downloaded collection from the repository root:

```powershell
local-reader/.venv/Scripts/python local-reader/download_game_cards.py
```

Existing valid files are reused and newly listed SS/SSR styles are downloaded. The manifest records failures explicitly. This is an online download tool; the offline recognition app does not automatically run it. A/ S styles are excluded because the current checker catalogs SS and resonance styles.

Game artwork belongs to its respective rights holders. The source database and CDN are third-party services, not an official guaranteed API.

2026-09-28: downloaded and validated 223 unique SS/SSR references (2.92 MiB), with no failed files. All files decoded and matched their recorded SHA-256. The recognition engine now uses these cards through `../style-map.json` and `../catalog.json`. The updater fetches the published catalog from this repository; it does not query the third-party source during recognition.
