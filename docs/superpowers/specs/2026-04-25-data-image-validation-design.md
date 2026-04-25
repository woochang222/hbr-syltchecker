# Data and Image Validation Automation Design

## Goal

Reduce recurring style data mistakes by separating automatically provable errors from human-review warnings.

The system should catch hard failures in `npm test`, while producing a readable warning report for items that need source or image review.

## Scope

This design covers style data and local image validation for the existing React/Vite style checker.

Included:
- Style manifest for high-risk or manually verified styles.
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

Warnings are intended to guide cleanup, not block normal development.

## File Layout

Add:
- `src/data/style_manifest.json`
- `src/data/styleManifest.test.js`
- `scripts/validate-data-report.js`

Modify:
- `package.json` to add `validate:data-report`.
- Existing data integrity tests only if shared helpers are needed.

## Data Flow

1. The app continues to load `styles.json`.
2. Tests load both `styles.json` and `style_manifest.json`.
3. Tests compare manifest expectations against runtime data and local files.
4. The report script scans all styles and manifest entries, then prints warning sections grouped by issue type.

## Adoption Plan

Start with manifest entries for styles that have recently caused issues:
- `nakamura_yuri_rain_fire`
- command unit styles such as `tezuka_saki_base_res`
- AB collaboration styles
- latest resonance styles

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

Keep tests local and deterministic. Do not fetch source URLs during test execution.
