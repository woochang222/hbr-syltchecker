# Data and Image Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add manifest-backed strict style validation and a non-blocking warning report for data/image review gaps.

**Architecture:** Keep `styles.json` as runtime app data and add `style_manifest.json` as a verification layer for high-risk styles. Strict deterministic checks run in `npm test`; broader human-review concerns are reported by a separate script that exits successfully for warnings.

**Tech Stack:** React 19/Vite app, Node ESM, `node:test`, local JSON files, PowerShell commands.

---

## File Structure

- Create `src/data/style_manifest.json`: verification expectations keyed by style id.
- Create `src/data/styleManifest.test.js`: strict manifest-backed tests for unit, element, image URL, and image existence.
- Modify `src/data/dataIntegrity.test.js`: make unreferenced local image detection include both `.webp` and `.png`.
- Create `scripts/validate-data-report.js`: warning-only scanner for missing manifest coverage, missing source URL, unverified image status, suspicious ids/names, and filename mismatch.
- Modify `package.json`: add `validate:data-report`.

### Task 1: Add Style Manifest Strict Tests

**Files:**
- Create: `src/data/styleManifest.test.js`
- Create: `src/data/style_manifest.json`

- [ ] **Step 1: Write the failing manifest tests**

Create `src/data/styleManifest.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))
const manifest = JSON.parse(readFileSync(new URL('./style_manifest.json', import.meta.url), 'utf8'))

const styleMap = new Map(styles.map(style => [style.id, style]))

describe('style manifest', () => {
  it('references only styles that exist in styles.json', () => {
    const missingStyleIds = Object.keys(manifest)
      .filter(styleId => !styleMap.has(styleId))

    assert.deepEqual(missingStyleIds, [])
  })

  it('matches manifest-backed units, elements, and image URLs', () => {
    const mismatches = Object.entries(manifest)
      .flatMap(([styleId, expected]) => {
        const style = styleMap.get(styleId)
        if (!style) return []

        const styleMismatches = []
        if (style.unit !== expected.expectedUnit) {
          styleMismatches.push({
            id: styleId,
            field: 'unit',
            actual: style.unit,
            expected: expected.expectedUnit
          })
        }

        if (style.element !== expected.expectedElements[0]) {
          styleMismatches.push({
            id: styleId,
            field: 'element',
            actual: style.element,
            expected: expected.expectedElements[0]
          })
        }

        if (JSON.stringify(style.elements) !== JSON.stringify(expected.expectedElements)) {
          styleMismatches.push({
            id: styleId,
            field: 'elements',
            actual: style.elements,
            expected: expected.expectedElements
          })
        }

        if (style.image_url !== expected.expectedImageUrl) {
          styleMismatches.push({
            id: styleId,
            field: 'image_url',
            actual: style.image_url,
            expected: expected.expectedImageUrl
          })
        }

        return styleMismatches
      })

    assert.deepEqual(mismatches, [])
  })

  it('uses existing image files for manifest-backed styles', () => {
    const missingImageFiles = Object.entries(manifest)
      .filter(([, expected]) => !existsSync(new URL(`../../public${expected.expectedImageUrl}`, import.meta.url)))
      .map(([styleId, expected]) => ({
        id: styleId,
        image_url: expected.expectedImageUrl
      }))

    assert.deepEqual(missingImageFiles, [])
  })
})
```

- [ ] **Step 2: Run tests to verify the missing manifest fails**

Run:

```powershell
npm test
```

Expected: FAIL with `Cannot find module ... src\data\style_manifest.json`.

- [ ] **Step 3: Add the initial manifest**

Create `src/data/style_manifest.json`:

```json
{
  "nakamura_yuri_rain_fire": {
    "expectedUnit": "AB",
    "expectedElements": ["화"],
    "expectedImageUrl": "/images/styles/nakamura_yuri_rain_fire.png",
    "sourceUrl": "https://game8.jp/heavenburnsred/511324",
    "imageStatus": "verified"
  },
  "tezuka_saki_base_res": {
    "expectedUnit": "사령부",
    "expectedElements": ["광"],
    "expectedImageUrl": "/images/styles/tezuka_saki_base_res.webp",
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "imageStatus": "needs-review"
  },
  "tachibana_kanade_earth_angel": {
    "expectedUnit": "AB",
    "expectedElements": ["광"],
    "expectedImageUrl": "/images/styles/tachibana_kanade_earth_angel.png",
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "imageStatus": "needs-review"
  },
  "tachibana_kanade_soaring_sword": {
    "expectedUnit": "AB",
    "expectedElements": ["빙"],
    "expectedImageUrl": "/images/styles/tachibana_kanade_soaring_sword.webp",
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "imageStatus": "needs-review"
  },
  "natsume_inori_hanakage_res": {
    "expectedUnit": "31F",
    "expectedElements": ["빙"],
    "expectedImageUrl": "/images/styles/natsume_inori_hanakage_res.webp",
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "imageStatus": "needs-review"
  },
  "kurosawa_maki_empress_res": {
    "expectedUnit": "31F",
    "expectedElements": ["뇌"],
    "expectedImageUrl": "/images/styles/kurosawa_maki_empress_res.webp",
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "imageStatus": "needs-review"
  }
}
```

- [ ] **Step 4: Run tests to verify manifest strict validation passes**

Run:

```powershell
npm test
```

Expected: PASS for all tests, including the new `style manifest` suite.

- [ ] **Step 5: Commit Task 1**

Run:

```powershell
git add src/data/style_manifest.json src/data/styleManifest.test.js
git commit -m "test: add style manifest validation"
```

### Task 2: Validate PNG Images as First-Class Local Style Images

**Files:**
- Modify: `src/data/dataIntegrity.test.js`

- [ ] **Step 1: Write the failing expectation**

In `src/data/dataIntegrity.test.js`, replace the image file scan inside `has no missing or unreferenced style image files` with:

```js
    const imageFiles = readdirSync(new URL('../../public/images/styles', import.meta.url))
      .filter(file => file.endsWith('.webp') || file.endsWith('.png'))
```

- [ ] **Step 2: Run tests to verify current PNG coverage behavior**

Run:

```powershell
npm test
```

Expected: PASS if all existing `.png` files are referenced. If this fails, the output lists unreferenced PNG files that must either be referenced by `styles.json` or removed before continuing.

- [ ] **Step 3: Commit Task 2**

Run:

```powershell
git add src/data/dataIntegrity.test.js
git commit -m "test: validate png style images"
```

### Task 3: Add Warning-Only Data Report Script

**Files:**
- Create: `scripts/validate-data-report.js`
- Modify: `package.json`

- [ ] **Step 1: Write the report script**

Create `scripts/validate-data-report.js`:

```js
import { existsSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('../src/data/styles.json', import.meta.url), 'utf8'))
const manifest = JSON.parse(readFileSync(new URL('../src/data/style_manifest.json', import.meta.url), 'utf8'))

const styleIds = new Set(styles.map(style => style.id))
const manifestIds = new Set(Object.keys(manifest))

const warnings = {
  missingManifest: styles
    .filter(style => !manifestIds.has(style.id))
    .map(style => style.id),
  missingSourceUrl: Object.entries(manifest)
    .filter(([, entry]) => !entry.sourceUrl)
    .map(([styleId]) => styleId),
  unverifiedImages: Object.entries(manifest)
    .filter(([, entry]) => entry.imageStatus !== 'verified')
    .map(([styleId, entry]) => ({ id: styleId, imageStatus: entry.imageStatus || 'missing' })),
  filenameMismatches: styles
    .filter(style => style.image_url)
    .filter(style => {
      const fileName = style.image_url.split('/').at(-1)
      return !fileName.startsWith(style.id)
    })
    .map(style => ({ id: style.id, image_url: style.image_url })),
  generatedStyleNames: styles
    .filter(style => /style_\d+/.test(style.id) || /style_\d+/.test(style.style_name))
    .map(style => ({ id: style.id, style_name: style.style_name })),
  missingManifestStyles: Object.keys(manifest)
    .filter(styleId => !styleIds.has(styleId)),
  missingManifestImages: Object.entries(manifest)
    .filter(([, entry]) => !existsSync(new URL(`../public${entry.expectedImageUrl}`, import.meta.url)))
    .map(([styleId, entry]) => ({ id: styleId, image_url: entry.expectedImageUrl }))
}

const printSection = (title, items) => {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))

  if (items.length === 0) {
    console.log('None')
    return
  }

  for (const item of items) {
    console.log(typeof item === 'string' ? `- ${item}` : `- ${JSON.stringify(item)}`)
  }
}

console.log('Data validation warning report')
console.log('This report is advisory. Warnings do not fail the command.')

printSection('Styles missing manifest entries', warnings.missingManifest)
printSection('Manifest entries missing sourceUrl', warnings.missingSourceUrl)
printSection('Manifest images not verified', warnings.unverifiedImages)
printSection('Image filename mismatches', warnings.filenameMismatches)
printSection('Generated style id or name patterns', warnings.generatedStyleNames)
printSection('Manifest entries missing styles.json rows', warnings.missingManifestStyles)
printSection('Manifest entries missing local images', warnings.missingManifestImages)
```

- [ ] **Step 2: Add the npm script**

Modify `package.json` scripts to include:

```json
"validate:data-report": "node scripts/validate-data-report.js"
```

The scripts block should become:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "node --test \"src/**/*.test.js\"",
  "lint": "eslint .",
  "validate:data-report": "node scripts/validate-data-report.js",
  "preview": "vite preview"
}
```

- [ ] **Step 3: Run the warning report**

Run:

```powershell
npm run validate:data-report
```

Expected: exit code `0`. The report prints warning sections; it may list many styles missing manifest entries because adoption is gradual.

- [ ] **Step 4: Commit Task 3**

Run:

```powershell
git add package.json scripts/validate-data-report.js
git commit -m "feat: add data validation warning report"
```

### Task 4: Final Verification and Cleanup

**Files:**
- Modify only files from Tasks 1-3 if verification finds a concrete issue.

- [ ] **Step 1: Run full verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
```

Expected:
- `npm test`: all tests pass.
- `npm run lint`: no ESLint errors.
- `npm run build`: Vite build exits `0`.
- `npm run validate:data-report`: exits `0` and prints advisory warnings.

- [ ] **Step 2: Check git status**

Run:

```powershell
git status --short --branch
```

Expected: `main` may be ahead of `origin/main`; there should be no unstaged source changes.

- [ ] **Step 3: Commit any verification fixes**

If Step 1 required fixes, commit only those fixes:

```powershell
git add src/data/style_manifest.json src/data/styleManifest.test.js src/data/dataIntegrity.test.js scripts/validate-data-report.js package.json
git commit -m "fix: polish data validation automation"
```

If no fixes were needed, do not create an empty commit.

## Self-Review

- Spec coverage: The plan adds a manifest, strict tests, PNG/WebP image validation, a warning-only report command, gradual adoption, and no network access during tests.
- Placeholder scan: No `TBD`, `TODO`, or undefined implementation steps remain.
- Type consistency: Manifest fields are consistently named `expectedUnit`, `expectedElements`, `expectedImageUrl`, `sourceUrl`, and `imageStatus`.
