# Data and Image Validation Automation Design

## Goal

Reduce recurring style data mistakes by separating automatically provable errors from human-review warnings.

The system should catch hard failures in `npm test`, while producing a readable warning report for items that need source or image review.

## Scope

This design covers style data and local image validation for the existing React/Vite style checker.

Included:
- Style manifest for high-risk or manually verified styles.
- Meta team manifest for best-team source and review metadata.
- Strict tests for manifest-backed fields.
- Warning report for incomplete verification metadata.
- Gradual adoption without requiring every existing style to be fully documented on day one.

Excluded:
- Network scraping during tests.
- Automatic image recognition.
- A full style-addition CLI.
- Runtime UI changes.

## Source of Truth

`src/data/styles.json` remains the runtime data source used by the app.
`src/data/meta_teams.json` remains the runtime source for best-team presets.

A new manifest file records verification expectations for selected styles:

```json
{
  "nakamura_yuri_rain_fire": {
    "expectedUnit": "AB",
    "expectedElements": ["화"],
    "expectedImageUrl": "/images/styles/nakamura_yuri_rain_fire.png",
    "sourceUrl": "https://game8.jp/heavenburnsred/511324",
    "imageStatus": "verified"
  }
}
```

Manifest entries are not required for every style at first. They should be added for styles that were recently changed, are high risk, use non-obvious assets, or have caused regressions before.

A second manifest file records source and review metadata for best-team presets:

```json
{
  "fire_meta": {
    "expectedStyles": [
      "kayamori_ruka_unison_res",
      "nikaido_misato_white_suit_res",
      "higuchi_seika_swimsuit",
      "shirakawa_yuina_admiral_res",
      "izumi_yuki_unison_res",
      "ogasawara_hisame_bunny_res"
    ],
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "reviewStatus": "needs-review",
    "reviewedAt": null
  }
}
```

`expectedStyles` is advisory at first. A mismatch between the manifest and `meta_teams.json` should appear in the warning report, not fail `npm test`.

## Strict Validation

Strict validation runs under `npm test`.

It should fail when:
- A manifest entry references a style id that does not exist in `styles.json`.
- A manifest-backed style has the wrong `unit`.
- A manifest-backed style has the wrong `element` or `elements`.
- A manifest-backed style points at the wrong `image_url`.
- A manifest-backed `image_url` file is missing.
- A local style image file is referenced by more than one style.
- A `.webp` or `.png` file in `public/images/styles` is unreferenced.
- A best-team preset does not have exactly six style ids.
- A best-team preset contains duplicate style ids.
- A best-team preset id or name does not match the supported element list.
- A best-team preset references a style id that does not exist in `styles.json`.
- A best-team preset has no style matching its target element.

These checks are deterministic and do not need network access.

## Warning Report

A new script should generate a human-readable report without failing the build by default.

Recommended command:

```powershell
npm run validate:data-report
```

The report should warn when:
- A style is missing from the manifest.
- A manifest entry lacks `sourceUrl`.
- A manifest entry has `imageStatus` other than `verified`.
- A style image file name does not match the style id.
- A style has a placeholder-like style name or generated id pattern.
- A best-team preset is missing from the meta team manifest.
- A meta team manifest entry lacks `sourceUrl`.
- A meta team manifest entry lacks `reviewedAt`.
- A meta team manifest entry has `reviewStatus` other than `verified`.
- A meta team manifest `expectedStyles` list differs from `meta_teams.json`.

Warnings are intended to guide cleanup, not block normal development.

## File Layout

Add:
- `src/data/style_manifest.json`
- `src/data/styleManifest.test.js`
- `src/data/meta_team_manifest.json`
- `scripts/validate-data-report.js`

Modify:
- `package.json` to add `validate:data-report`.
- `src/data/metaTeams.test.js` to add strict best-team structure checks.
- Existing data integrity tests only if shared helpers are needed.

## Data Flow

1. The app continues to load `styles.json`.
2. The app continues to load `meta_teams.json`.
3. Tests load `styles.json`, `style_manifest.json`, and `meta_teams.json`.
4. Tests compare manifest expectations against runtime data and local files.
5. Meta team tests enforce deterministic preset structure and element coverage.
6. The report script scans all style and meta team manifest entries, then prints warning sections grouped by issue type.

## Adoption Plan

Start with manifest entries for styles that have recently caused issues:
- `nakamura_yuri_rain_fire`
- command unit styles such as `tezuka_saki_base_res`
- AB collaboration styles
- latest resonance styles

Start with meta team manifest entries for every current preset:
- `neutral_meta`
- `fire_meta`
- `ice_meta`
- `thunder_meta`
- `light_meta`
- `dark_meta`

After the initial layer works, extend manifest coverage opportunistically when adding or fixing styles.

## Error Handling

Tests should use explicit assertion messages that name the style id and mismatched field.

The report script should exit `0` when it only finds warnings. It should exit nonzero only for malformed JSON or unreadable required files.

## Testing

Add tests for:
- Manifest references only existing style ids.
- Manifest expected fields match `styles.json`.
- Manifest image files exist.
- Unreferenced `.webp` and `.png` files are detected.
- Best-team presets contain exactly six unique style ids.
- Best-team preset ids and names match supported element metadata.
- Best-team presets include at least one style with the preset element.

Keep tests local and deterministic. Do not fetch source URLs during test execution.
