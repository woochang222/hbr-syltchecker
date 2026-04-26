# Style Add Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repeatable CLI workflow that validates one style draft and updates `styles.json` plus `style_manifest.json` together.

**Architecture:** Put pure validation and merge behavior in `scripts/styleDraftWorkflow.js`, covered by `node:test`. Keep `scripts/add-style.js` as a thin file-IO wrapper that loads the draft/current data, refuses invalid drafts before writing, then writes both JSON files with stable formatting.

**Tech Stack:** Node ESM, `node:test`, local JSON files, npm scripts, existing source URL validation helper.

---

## File Structure

- Create `scripts/styleDraftWorkflow.js`: reusable helper functions for parsing, validation, merge, and JSON formatting.
- Create `scripts/styleDraftWorkflow.test.js`: focused unit tests for helper behavior.
- Create `scripts/add-style.js`: CLI entry point for `npm run add:style -- path/to/draft.json`.
- Create `scripts/style-draft.example.json`: copyable draft input.
- Modify `package.json`: add the `add:style` script and include `scripts/**/*.test.js` in the test script.
- Modify `README.md`: document the add workflow.

### Task 1: Add Style Draft Helper Tests

**Files:**
- Create: `scripts/styleDraftWorkflow.test.js`

- [ ] **Step 1: Write the failing helper tests**

Create `scripts/styleDraftWorkflow.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  applyStyleDraft,
  formatJson,
  validateStyleDraft
} from './styleDraftWorkflow.js'

const validStyle = {
  id: 'sample_character_new_style',
  character_name: '샘플 캐릭터',
  style_name: '샘플 스타일',
  unit: '31A',
  element: '화',
  elements: ['화'],
  tier: 0,
  image_url: '/images/styles/sample_character_new_style.webp',
  isLimited: false,
  isResonance: false,
  isLatest: false,
  nicknames: []
}

const validManifestEntry = {
  expectedUnit: '31A',
  expectedElements: ['화'],
  expectedImageUrl: '/images/styles/sample_character_new_style.webp',
  sourceUrl: 'https://game8.jp/heavenburnsred/426190',
  imageStatus: 'verified'
}

const createDraft = (overrides = {}) => ({
  style: {
    ...validStyle,
    ...overrides.style
  },
  manifest: {
    ...validManifestEntry,
    ...overrides.manifest
  }
})

const existingStyles = [
  {
    ...validStyle,
    id: 'existing_style',
    image_url: '/images/styles/existing_style.webp'
  }
]

const existingManifest = {
  existing_style: {
    ...validManifestEntry,
    expectedImageUrl: '/images/styles/existing_style.webp'
  }
}

const existingImages = new Set([
  'public/images/styles/sample_character_new_style.webp'
])

describe('validateStyleDraft', () => {
  it('accepts a valid one-style draft', () => {
    assert.deepEqual(
      validateStyleDraft({
        draft: createDraft(),
        styles: existingStyles,
        manifest: existingManifest,
        imageExists: imagePath => existingImages.has(imagePath)
      }),
      []
    )
  })

  it('rejects duplicate ids in styles and manifest', () => {
    const errors = validateStyleDraft({
      draft: createDraft({
        style: {
          id: 'existing_style',
          image_url: '/images/styles/sample_character_new_style.webp'
        }
      }),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: imagePath => existingImages.has(imagePath)
    })

    assert.deepEqual(errors, [
      'style.id already exists in styles.json: existing_style',
      'style.id already exists in style_manifest.json: existing_style'
    ])
  })

  it('rejects a missing local image file', () => {
    const errors = validateStyleDraft({
      draft: createDraft(),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: () => false
    })

    assert.deepEqual(errors, [
      'style.image_url file does not exist: public/images/styles/sample_character_new_style.webp'
    ])
  })

  it('rejects manifest fields that do not match the style row', () => {
    const errors = validateStyleDraft({
      draft: createDraft({
        manifest: {
          expectedUnit: '31B',
          expectedElements: ['빙'],
          expectedImageUrl: '/images/styles/other.webp'
        }
      }),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: imagePath => existingImages.has(imagePath)
    })

    assert.deepEqual(errors, [
      'manifest.expectedUnit must match style.unit',
      'manifest.expectedElements must match style.elements',
      'manifest.expectedImageUrl must match style.image_url'
    ])
  })

  it('rejects invalid source URL and unverified image status', () => {
    const errors = validateStyleDraft({
      draft: createDraft({
        manifest: {
          sourceUrl: 'https://example.com/heavenburnsred/426190',
          imageStatus: 'needs-review'
        }
      }),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: imagePath => existingImages.has(imagePath)
    })

    assert.deepEqual(errors, [
      'manifest.sourceUrl must match https://game8.jp/heavenburnsred/<id>',
      'manifest.imageStatus must be verified'
    ])
  })
})

describe('applyStyleDraft', () => {
  it('appends the style and adds a manifest entry keyed by style id', () => {
    const result = applyStyleDraft({
      draft: createDraft(),
      styles: existingStyles,
      manifest: existingManifest
    })

    assert.deepEqual(result.styles.map(style => style.id), [
      'existing_style',
      'sample_character_new_style'
    ])
    assert.deepEqual(result.manifest.sample_character_new_style, validManifestEntry)
    assert.equal(existingStyles.length, 1)
    assert.equal(existingManifest.sample_character_new_style, undefined)
  })
})

describe('formatJson', () => {
  it('uses two-space JSON and a trailing newline', () => {
    assert.equal(formatJson({ alpha: true }), '{\n  "alpha": true\n}\n')
  })
})
```

- [ ] **Step 2: Run the tests to verify the helper module is missing**

Run:

```powershell
npm test
```

Expected: FAIL with a module-not-found error for `./styleDraftWorkflow.js`.

- [ ] **Step 3: Commit the failing tests**

Run:

```powershell
git add scripts/styleDraftWorkflow.test.js
git commit -m "test: add style draft workflow expectations"
```

### Task 2: Implement Style Draft Helpers

**Files:**
- Create: `scripts/styleDraftWorkflow.js`

- [ ] **Step 1: Implement the helper module**

Create `scripts/styleDraftWorkflow.js`:

```js
import { readFileSync } from 'node:fs'

const GAME8_SOURCE_URL_PATTERN = /^https:\/\/game8\.jp\/heavenburnsred\/\d+$/
const STYLE_IMAGE_PREFIX = '/images/styles/'

export const readJsonFile = filePath => {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`Unable to read JSON file ${filePath}: ${error.message}`)
  }
}

const isPlainObject = value => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const addRequiredStringError = (errors, object, fieldName, label) => {
  if (typeof object[fieldName] !== 'string' || object[fieldName].trim() === '') {
    errors.push(`${label}.${fieldName} must be a non-empty string`)
  }
}

const addRequiredBooleanError = (errors, object, fieldName, label) => {
  if (typeof object[fieldName] !== 'boolean') {
    errors.push(`${label}.${fieldName} must be a boolean`)
  }
}

const toPublicImagePath = imageUrl => {
  return `public${imageUrl}`
}

export const validateStyleDraft = ({
  draft,
  styles,
  manifest,
  imageExists
}) => {
  const errors = []

  if (!isPlainObject(draft)) {
    return ['draft must be a JSON object']
  }

  if (!isPlainObject(draft.style)) {
    errors.push('draft.style must be an object')
  }

  if (!isPlainObject(draft.manifest)) {
    errors.push('draft.manifest must be an object')
  }

  if (errors.length > 0) return errors

  const { style, manifest: manifestEntry } = draft

  addRequiredStringError(errors, style, 'id', 'style')
  addRequiredStringError(errors, style, 'character_name', 'style')
  addRequiredStringError(errors, style, 'style_name', 'style')
  addRequiredStringError(errors, style, 'unit', 'style')
  addRequiredStringError(errors, style, 'element', 'style')
  addRequiredStringError(errors, style, 'image_url', 'style')
  addRequiredBooleanError(errors, style, 'isLimited', 'style')
  addRequiredBooleanError(errors, style, 'isResonance', 'style')
  addRequiredBooleanError(errors, style, 'isLatest', 'style')

  if (!Number.isInteger(style.tier)) {
    errors.push('style.tier must be an integer')
  }

  if (!Array.isArray(style.elements) || style.elements.length === 0) {
    errors.push('style.elements must be a non-empty array')
  } else if (style.elements.some(element => typeof element !== 'string' || element.trim() === '')) {
    errors.push('style.elements must contain only non-empty strings')
  }

  if (!Array.isArray(style.nicknames)) {
    errors.push('style.nicknames must be an array')
  } else if (style.nicknames.some(nickname => typeof nickname !== 'string')) {
    errors.push('style.nicknames must contain only strings')
  }

  if (typeof style.id === 'string') {
    if (styles.some(existingStyle => existingStyle.id === style.id)) {
      errors.push(`style.id already exists in styles.json: ${style.id}`)
    }

    if (Object.hasOwn(manifest, style.id)) {
      errors.push(`style.id already exists in style_manifest.json: ${style.id}`)
    }
  }

  if (typeof style.image_url === 'string') {
    if (!style.image_url.startsWith(STYLE_IMAGE_PREFIX)) {
      errors.push('style.image_url must start with /images/styles/')
    } else if (!imageExists(toPublicImagePath(style.image_url))) {
      errors.push(`style.image_url file does not exist: ${toPublicImagePath(style.image_url)}`)
    }
  }

  if (Array.isArray(style.elements) && style.elements.length > 0 && style.element !== style.elements[0]) {
    errors.push('style.element must match style.elements[0]')
  }

  if (manifestEntry.expectedUnit !== style.unit) {
    errors.push('manifest.expectedUnit must match style.unit')
  }

  if (JSON.stringify(manifestEntry.expectedElements) !== JSON.stringify(style.elements)) {
    errors.push('manifest.expectedElements must match style.elements')
  }

  if (manifestEntry.expectedImageUrl !== style.image_url) {
    errors.push('manifest.expectedImageUrl must match style.image_url')
  }

  if (!GAME8_SOURCE_URL_PATTERN.test(manifestEntry.sourceUrl || '')) {
    errors.push('manifest.sourceUrl must match https://game8.jp/heavenburnsred/<id>')
  }

  if (manifestEntry.imageStatus !== 'verified') {
    errors.push('manifest.imageStatus must be verified')
  }

  return errors
}

export const applyStyleDraft = ({ draft, styles, manifest }) => ({
  styles: [
    ...styles,
    draft.style
  ],
  manifest: {
    ...manifest,
    [draft.style.id]: draft.manifest
  }
})

export const formatJson = data => `${JSON.stringify(data, null, 2)}\n`
```

- [ ] **Step 2: Run tests to verify the helper behavior passes**

Run:

```powershell
npm test
```

Expected: PASS, including `styleDraftWorkflow.test.js`.

- [ ] **Step 3: Run lint**

Run:

```powershell
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit the helper implementation**

Run:

```powershell
git add scripts/styleDraftWorkflow.js scripts/styleDraftWorkflow.test.js
git commit -m "feat: add style draft workflow helpers"
```

### Task 3: Add CLI Entry Point and Example Draft

**Files:**
- Create: `scripts/add-style.js`
- Create: `scripts/style-draft.example.json`
- Modify: `package.json`

- [ ] **Step 1: Create the CLI wrapper**

Create `scripts/add-style.js`:

```js
import { existsSync, writeFileSync } from 'node:fs'
import {
  applyStyleDraft,
  formatJson,
  readJsonFile,
  validateStyleDraft
} from './styleDraftWorkflow.js'

const draftPath = process.argv[2]

const stylesPath = new URL('../src/data/styles.json', import.meta.url)
const manifestPath = new URL('../src/data/style_manifest.json', import.meta.url)

const printUsage = () => {
  console.error('Usage: npm run add:style -- path/to/style-draft.json')
}

if (!draftPath) {
  printUsage()
  process.exitCode = 1
} else {
  try {
    const draft = readJsonFile(draftPath)
    const styles = readJsonFile(stylesPath)
    const manifest = readJsonFile(manifestPath)

    const styleId = draft?.style?.id || '(unknown style id)'
    const errors = validateStyleDraft({
      draft,
      styles,
      manifest,
      imageExists: imagePath => existsSync(new URL(`../${imagePath}`, import.meta.url))
    })

    if (errors.length > 0) {
      console.error(`Cannot add style ${styleId}:`)
      for (const error of errors) {
        console.error(`- ${error}`)
      }
      process.exitCode = 1
    } else {
      const updated = applyStyleDraft({ draft, styles, manifest })
      writeFileSync(stylesPath, formatJson(updated.styles))
      writeFileSync(manifestPath, formatJson(updated.manifest))

      console.log(`Added style ${draft.style.id}`)
      console.log('Updated src/data/styles.json')
      console.log('Updated src/data/style_manifest.json')
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
```

- [ ] **Step 2: Add the example draft**

Create `scripts/style-draft.example.json`:

```json
{
  "style": {
    "id": "sample_character_new_style",
    "character_name": "샘플 캐릭터",
    "style_name": "샘플 스타일",
    "unit": "31A",
    "element": "화",
    "elements": ["화"],
    "tier": 0,
    "image_url": "/images/styles/sample_character_new_style.webp",
    "isLimited": false,
    "isResonance": false,
    "isLatest": false,
    "nicknames": []
  },
  "manifest": {
    "expectedUnit": "31A",
    "expectedElements": ["화"],
    "expectedImageUrl": "/images/styles/sample_character_new_style.webp",
    "sourceUrl": "https://game8.jp/heavenburnsred/426190",
    "imageStatus": "verified"
  }
}
```

- [ ] **Step 3: Add the npm scripts**

Modify the `scripts` block in `package.json` so it contains:

```json
"test": "node --test \"src/**/*.test.js\" \"scripts/**/*.test.js\"",
"add:style": "node scripts/add-style.js"
```

Keep the existing scripts unchanged except for expanding `test` to include script tests.

- [ ] **Step 4: Run the CLI without arguments to verify usage failure**

Run:

```powershell
npm run add:style
```

Expected: FAIL with exit code `1` and this message:

```text
Usage: npm run add:style -- path/to/style-draft.json
```

- [ ] **Step 5: Run tests and lint**

Run:

```powershell
npm test
npm run lint
```

Expected: both commands pass.

- [ ] **Step 6: Commit the CLI and example**

Run:

```powershell
git add package.json scripts/add-style.js scripts/style-draft.example.json
git commit -m "feat: add style draft cli"
```

### Task 4: Document the Style Add Workflow

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add README usage notes**

In `README.md`, after the command block in `실행 방법`, add:

````md
## ➕ 스타일 추가 워크플로우

1. 스타일 이미지를 `public/images/styles/`에 먼저 추가합니다.
2. `scripts/style-draft.example.json`을 참고해 새 draft JSON 파일을 만듭니다.
3. 아래 명령으로 `styles.json`과 `style_manifest.json`을 함께 갱신합니다.

```powershell
npm run add:style -- path/to/style-draft.json
```

4. 추가 후 검증을 실행합니다.

```powershell
npm test
npm run lint
npm run validate:data-report
```

`npm run add:style`은 이미지 파일 존재 여부, 스타일/manifest 필드 일치, Game8 출처 URL 형식, `imageStatus: "verified"`를 확인한 뒤에만 파일을 수정합니다.
````

- [ ] **Step 2: Run markdown diff check**

Run:

```powershell
git diff --check
```

Expected: exit code `0`.

- [ ] **Step 3: Commit the docs update**

Run:

```powershell
git add README.md
git commit -m "docs: document style add workflow"
```

### Task 5: Final Verification

**Files:**
- Modify only files from Tasks 1-4 if verification finds a concrete issue.

- [ ] **Step 1: Run full deterministic verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
git diff --check
```

Expected:
- `npm test`: all tests pass.
- `npm run lint`: no ESLint errors.
- `npm run build`: Vite build exits `0`.
- `npm run validate:data-report`: exits `0` with no warning sections.
- `git diff --check`: exits `0`.

- [ ] **Step 2: Check source URL validation when network is available**

Run:

```powershell
npm run validate:source-urls
```

Expected when network access is available: exit code `0`, no invalid shapes, and no unreachable URLs.

If this fails with only `fetch failed` for every URL in the sandbox, rerun with approved network access before treating it as a data issue.

- [ ] **Step 3: Check git status**

Run:

```powershell
git status --short --branch
```

Expected: branch may be ahead of `origin/main`; no unstaged source changes.

- [ ] **Step 4: Commit any verification fixes**

If Step 1 or Step 2 required fixes, commit only those fixes:

```powershell
git add scripts/add-style.js scripts/styleDraftWorkflow.js scripts/styleDraftWorkflow.test.js scripts/style-draft.example.json package.json README.md
git commit -m "fix: polish style add workflow"
```

If no fixes were needed, do not create an empty commit.

## Self-Review

- Spec coverage: The plan adds the draft format, helper validation, CLI wrapper, automatic JSON updates, local image existence checks, tests, npm script, README docs, and deterministic verification.
- Placeholder scan: No unresolved placeholders, undefined implementation steps, or vague validation instructions remain.
- Type consistency: The plan consistently uses `style`, `manifest`, `style.id`, `expectedUnit`, `expectedElements`, `expectedImageUrl`, `sourceUrl`, `imageStatus`, `validateStyleDraft`, `applyStyleDraft`, `formatJson`, and `readJsonFile`.
