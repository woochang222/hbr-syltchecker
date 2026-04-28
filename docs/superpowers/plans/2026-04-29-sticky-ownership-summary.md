# Sticky Ownership Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact sticky summary bar so users can see total owned styles while scrolling the style grid.

**Architecture:** Keep count calculation in `App.jsx`, where the source data already lives. Add a small formatting utility with unit tests, a presentational `OwnershipStickySummary` component, and scoped CSS for the sticky bar.

**Tech Stack:** React 19, Vite, Node ESM, `node:test`, CSS sticky positioning.

---

## File Structure

- Create `src/utils/ownershipSummary.js`: pure formatting helper for ownership summary labels.
- Create `src/utils/ownershipSummary.test.js`: unit tests for normal and zero-count labels.
- Create `src/components/OwnershipStickySummary.jsx`: presentational sticky summary component.
- Modify `src/App.jsx`: import and render the component between the stats dashboard and style grid.
- Modify `src/styles/main.css`: sticky bar layout and responsive styles.

### Task 1: Add Ownership Summary Formatting

**Files:**
- Create: `src/utils/ownershipSummary.test.js`
- Create: `src/utils/ownershipSummary.js`

- [ ] **Step 1: Write failing tests**

Create `src/utils/ownershipSummary.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatOwnershipSummary } from './ownershipSummary.js'

describe('formatOwnershipSummary', () => {
  it('formats owned, total, rate, and visible style counts', () => {
    assert.deepEqual(
      formatOwnershipSummary({
        totalOwned: 84,
        totalStyles: 212,
        ownershipRate: 39,
        visibleStyleCount: 120
      }),
      {
        ownershipLabel: '보유 84 / 212',
        rateLabel: '39%',
        visibleLabel: '표시 120'
      }
    )
  })

  it('keeps zero counts stable', () => {
    assert.deepEqual(
      formatOwnershipSummary({
        totalOwned: 0,
        totalStyles: 0,
        ownershipRate: 0,
        visibleStyleCount: 0
      }),
      {
        ownershipLabel: '보유 0 / 0',
        rateLabel: '0%',
        visibleLabel: '표시 0'
      }
    )
  })
})
```

- [ ] **Step 2: Run test to verify missing module failure**

Run:

```powershell
npm test -- src/utils/ownershipSummary.test.js
```

Expected: FAIL with module-not-found for `./ownershipSummary.js`.

- [ ] **Step 3: Implement formatting helper**

Create `src/utils/ownershipSummary.js`:

```js
export const formatOwnershipSummary = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  visibleStyleCount
}) => ({
  ownershipLabel: `보유 ${totalOwned} / ${totalStyles}`,
  rateLabel: `${ownershipRate}%`,
  visibleLabel: `표시 ${visibleStyleCount}`
})
```

- [ ] **Step 4: Run focused test**

Run:

```powershell
npm test -- src/utils/ownershipSummary.test.js
```

Expected: PASS for `formatOwnershipSummary`.

- [ ] **Step 5: Commit formatting helper**

Run:

```powershell
git add src/utils/ownershipSummary.js src/utils/ownershipSummary.test.js
git commit -m "test: add ownership summary labels"
```

### Task 2: Add Sticky Summary Component

**Files:**
- Create: `src/components/OwnershipStickySummary.jsx`

- [ ] **Step 1: Create component**

Create `src/components/OwnershipStickySummary.jsx`:

```jsx
import React from 'react'
import { formatOwnershipSummary } from '../utils/ownershipSummary'

const OwnershipStickySummary = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  visibleStyleCount
}) => {
  const {
    ownershipLabel,
    rateLabel,
    visibleLabel
  } = formatOwnershipSummary({
    totalOwned,
    totalStyles,
    ownershipRate,
    visibleStyleCount
  })

  return (
    <section className="ownership-sticky-summary" aria-label="보유 스타일 요약">
      <div className="ownership-sticky-summary-inner">
        <span className="ownership-summary-chip primary">{ownershipLabel}</span>
        <span className="ownership-summary-chip rate">{rateLabel}</span>
        <span className="ownership-summary-chip">{visibleLabel}</span>
      </div>
    </section>
  )
}

export default OwnershipStickySummary
```

- [ ] **Step 2: Run lint to catch import and JSX issues**

Run:

```powershell
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Commit component**

Run:

```powershell
git add src/components/OwnershipStickySummary.jsx
git commit -m "feat: add ownership sticky summary component"
```

### Task 3: Render Sticky Summary in App

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import component**

In `src/App.jsx`, add this import after `FilterSummary`:

```js
import OwnershipStickySummary from './components/OwnershipStickySummary'
```

- [ ] **Step 2: Render component before the style grid**

In `src/App.jsx`, place this block after the closing `</section>` for `stats-dashboard` and before the filter drawer conditional:

```jsx
      <OwnershipStickySummary
        totalOwned={totalOwned}
        totalStyles={totalStyles}
        ownershipRate={ownershipRate}
        visibleStyleCount={visibleStyleCount}
      />
```

The resulting order inside the returned JSX should be:

```jsx
      <section className="stats-dashboard">
        ...
      </section>

      <OwnershipStickySummary
        totalOwned={totalOwned}
        totalStyles={totalStyles}
        ownershipRate={ownershipRate}
        visibleStyleCount={visibleStyleCount}
      />

      {isFilterDrawerOpen && (
        ...
      )}

      <main className="style-list">
        ...
      </main>
```

- [ ] **Step 3: Run build**

Run:

```powershell
npm run build
```

Expected: PASS with Vite production build completed.

- [ ] **Step 4: Commit app integration**

Run:

```powershell
git add src/App.jsx
git commit -m "feat: show sticky ownership summary"
```

### Task 4: Add Sticky Summary Styles

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add desktop styles**

In `src/styles/main.css`, add this block after `.element-stats` styles and before `/* Card Styles */`:

```css
.ownership-sticky-summary {
  position: sticky;
  top: 0;
  z-index: 20;
  margin: 0 0 18px;
  padding: 8px 0;
  background: rgba(18, 18, 18, 0.94);
  backdrop-filter: blur(10px);
}

.ownership-sticky-summary-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 34px;
}

.ownership-summary-chip {
  border: 1px solid #444;
  background: #2a2a2a;
  color: #ddd;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.ownership-summary-chip.primary {
  border-color: #f1c40f;
  background: #f1c40f;
  color: #111;
  font-weight: 900;
}

.ownership-summary-chip.rate {
  color: #ff80ab;
}
```

- [ ] **Step 2: Add mobile styles**

Inside the existing `@media (max-width: 600px)` block in `src/styles/main.css`, add:

```css
  .ownership-sticky-summary {
    margin-bottom: 12px;
    padding: 6px 0;
  }

  .ownership-sticky-summary-inner {
    justify-content: flex-start;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .ownership-sticky-summary-inner::-webkit-scrollbar {
    display: none;
  }

  .ownership-summary-chip {
    flex: 0 0 auto;
    padding: 5px 8px;
    font-size: 12px;
  }
```

- [ ] **Step 3: Run lint and build**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands PASS.

- [ ] **Step 4: Commit styles**

Run:

```powershell
git add src/styles/main.css
git commit -m "style: make ownership summary sticky"
```

### Task 5: Final Verification

**Files:**
- Modify only the files from Tasks 1-4 if verification reveals a concrete issue.

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

Expected: no unstaged source changes. The pre-existing untracked `.cursor/` directory may remain and should not be staged.

## Self-Review

- Spec coverage: Tasks cover the sticky bar, count labels, current filter result count, responsive styling, and reuse of existing `App.jsx` calculations.
- Placeholder scan: No unresolved markers, vague error handling, or unclear implementation steps remain.
- Type consistency: The plan consistently uses `OwnershipStickySummary`, `formatOwnershipSummary`, `totalOwned`, `totalStyles`, `ownershipRate`, and `visibleStyleCount`.
