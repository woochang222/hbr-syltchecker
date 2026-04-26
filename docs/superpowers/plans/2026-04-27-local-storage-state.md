# Local Storage State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent corrupt or invalid `localStorage` values from crashing initial app render.

**Architecture:** Add a small pure utility module for safe localStorage reads and validation, then use it from `App.jsx` state initializers. Keep recovery silent and return configured fallback values.

**Tech Stack:** React 19, Vite, Node ESM, `node:test`, browser `localStorage`.

---

## File Structure

- Create `src/utils/localStorageState.js`: safe JSON/string storage read helpers.
- Create `src/utils/localStorageState.test.js`: unit tests using fake storage objects.
- Modify `src/App.jsx`: use helpers for owned styles, highlight latest, and view mode.

### Task 1: Add Local Storage Helper Tests

**Files:**
- Create: `src/utils/localStorageState.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/utils/localStorageState.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isPlainObject,
  readJsonStorage,
  readStringStorage
} from './localStorageState.js'

const createStorage = initialValues => {
  const values = new Map(Object.entries(initialValues))
  const removedKeys = []

  return {
    removedKeys,
    getItem: key => values.has(key) ? values.get(key) : null,
    removeItem: key => {
      removedKeys.push(key)
      values.delete(key)
    }
  }
}

describe('readJsonStorage', () => {
  it('returns parsed JSON when it passes validation', () => {
    const storage = createStorage({
      owned: '{"style_id":2}'
    })

    assert.deepEqual(
      readJsonStorage(storage, 'owned', {}, isPlainObject),
      { style_id: 2 }
    )
    assert.deepEqual(storage.removedKeys, [])
  })

  it('returns fallback without cleanup when value is missing', () => {
    const storage = createStorage({})

    assert.deepEqual(readJsonStorage(storage, 'owned', {}, isPlainObject), {})
    assert.deepEqual(storage.removedKeys, [])
  })

  it('returns fallback and removes malformed JSON', () => {
    const storage = createStorage({
      owned: '{bad json'
    })

    assert.deepEqual(readJsonStorage(storage, 'owned', {}, isPlainObject), {})
    assert.deepEqual(storage.removedKeys, ['owned'])
  })

  it('returns fallback and removes values that fail validation', () => {
    const storage = createStorage({
      owned: '[]'
    })

    assert.deepEqual(readJsonStorage(storage, 'owned', {}, isPlainObject), {})
    assert.deepEqual(storage.removedKeys, ['owned'])
  })

  it('returns fallback when cleanup throws', () => {
    const storage = {
      getItem: () => '{bad json',
      removeItem: () => {
        throw new Error('blocked')
      }
    }

    assert.deepEqual(readJsonStorage(storage, 'owned', {}, isPlainObject), {})
  })
})

describe('readStringStorage', () => {
  it('returns stored string when it is allowed', () => {
    const storage = createStorage({
      viewMode: 'hide'
    })

    assert.equal(readStringStorage(storage, 'viewMode', 'dim', ['dim', 'hide']), 'hide')
    assert.deepEqual(storage.removedKeys, [])
  })

  it('returns fallback and removes disallowed strings', () => {
    const storage = createStorage({
      viewMode: 'unknown'
    })

    assert.equal(readStringStorage(storage, 'viewMode', 'dim', ['dim', 'hide']), 'dim')
    assert.deepEqual(storage.removedKeys, ['viewMode'])
  })

  it('returns fallback when getItem throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {}
    }

    assert.equal(readStringStorage(storage, 'viewMode', 'dim', ['dim', 'hide']), 'dim')
  })
})
```

- [ ] **Step 2: Run tests to verify missing module failure**

Run:

```powershell
npm test
```

Expected: FAIL with module-not-found for `./localStorageState.js`.

- [ ] **Step 3: Commit failing tests**

Run:

```powershell
git add src/utils/localStorageState.test.js
git commit -m "test: add local storage state expectations"
```

### Task 2: Implement Local Storage Helpers

**Files:**
- Create: `src/utils/localStorageState.js`

- [ ] **Step 1: Implement helpers**

Create `src/utils/localStorageState.js`:

```js
export const isPlainObject = value => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const removeInvalidStorageValue = (storage, key) => {
  try {
    storage.removeItem(key)
  } catch {
    // Ignore cleanup failures; callers still get their fallback value.
  }
}

export const readJsonStorage = (storage, key, fallback, isValid) => {
  let rawValue

  try {
    rawValue = storage.getItem(key)
  } catch {
    return fallback
  }

  if (rawValue === null) {
    return fallback
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    if (isValid(parsedValue)) {
      return parsedValue
    }
  } catch {
    removeInvalidStorageValue(storage, key)
    return fallback
  }

  removeInvalidStorageValue(storage, key)
  return fallback
}

export const readStringStorage = (storage, key, fallback, allowedValues) => {
  let value

  try {
    value = storage.getItem(key)
  } catch {
    return fallback
  }

  if (value === null) {
    return fallback
  }

  if (allowedValues.includes(value)) {
    return value
  }

  removeInvalidStorageValue(storage, key)
  return fallback
}
```

- [ ] **Step 2: Run tests**

Run:

```powershell
npm test
```

Expected: PASS, including `localStorageState` tests.

- [ ] **Step 3: Run lint**

Run:

```powershell
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit helpers**

Run:

```powershell
git add src/utils/localStorageState.js src/utils/localStorageState.test.js
git commit -m "feat: add safe local storage readers"
```

### Task 3: Use Helpers in App State

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update imports**

In `src/App.jsx`, add:

```js
import {
  isPlainObject,
  readJsonStorage,
  readStringStorage
} from './utils/localStorageState'
```

- [ ] **Step 2: Replace localStorage state initializers**

Replace the current `ownedStyles`, `viewMode`, and `highlightLatest` initializers with:

```js
  const [ownedStyles, setOwnedStyles] = useState(() => {
    return readJsonStorage(localStorage, 'hbr_owned_styles', {}, isPlainObject)
  })
```

```js
  const [viewMode, setViewMode] = useState(() => {
    return readStringStorage(localStorage, 'hbr_view_mode', 'dim', ['dim', 'hide'])
  })
```

```js
  const [highlightLatest, setHighlightLatest] = useState(() => {
    return readJsonStorage(
      localStorage,
      'hbr_highlight_latest',
      DEFAULT_HIGHLIGHT_LATEST,
      value => typeof value === 'boolean'
    )
  })
```

- [ ] **Step 3: Run verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
```

Expected: all commands pass.

- [ ] **Step 4: Commit app integration**

Run:

```powershell
git add src/App.jsx
git commit -m "fix: recover from invalid local storage state"
```

### Task 4: Final Verification

**Files:**
- Modify only Task 1-3 files if verification finds a concrete issue.

- [ ] **Step 1: Run full verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 2: Check git status**

Run:

```powershell
git status --short --branch
```

Expected: no unstaged source changes.

## Self-Review

- Spec coverage: The plan adds tested JSON and string storage helpers, cleanup behavior, fallback behavior, and App integration.
- Placeholder scan: No unresolved placeholders or vague steps remain.
- Type consistency: Helper names and storage keys match the design and `App.jsx`.
