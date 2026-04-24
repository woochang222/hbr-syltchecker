# Preset Filter Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the always-open top filter panel with a preset-first overlay drawer and a compact active-filter summary bar.

**Architecture:** Keep filtering state and filtering behavior in `App.jsx`. Move filter controls into a drawer-oriented `FilterPanel.jsx`, add a small summary helper/UI for active conditions, and update CSS for desktop and mobile drawer behavior without changing `StyleCard` logic.

**Tech Stack:** React 19, Vite, vanilla CSS, local JSON data, `node:test` for helper tests, existing `npm run lint` and `npm run build`.

---

## File Structure

- Create `src/utils/filterSummary.js`: pure functions for active-filter labels and visible-result counts.
- Create `src/utils/filterSummary.test.js`: Node unit tests for the summary helper.
- Create `src/components/FilterSummary.jsx`: compact summary bar rendered near search/filter controls.
- Modify `src/App.jsx`: add `isFilterDrawerOpen`, escape-key close behavior, drawer overlay wiring, and visible result count.
- Modify `src/components/FilterPanel.jsx`: make it drawer content with a header, close button, preset-first ordering, and existing filter controls.
- Modify `src/styles/main.css`: replace top filter-panel layout with toolbar, summary bar, overlay drawer, and responsive drawer rules.
- Modify `package.json`: add `test` script that runs `node --test`.

### Task 1: Add Filter Summary Helper

**Files:**
- Create: `src/utils/filterSummary.js`
- Create: `src/utils/filterSummary.test.js`
- Modify: `package.json`

- [ ] **Step 1: Add the failing unit tests**

Create `src/utils/filterSummary.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildFilterSummary, countVisibleStyles } from './filterSummary.js'

describe('buildFilterSummary', () => {
  const metaTeams = [
    { id: 'light_meta', name: '광속성 파티', styles: ['ruka_light_res'] },
    { id: 'fire_meta', name: '화염속성 파티', styles: ['yuki_fire_ss'] }
  ]

  it('shows the default all-styles summary when no filters are active', () => {
    const result = buildFilterSummary({
      filters: { elements: [], units: [], tiers: [] },
      activeMetaTeam: null,
      metaTeams,
      viewMode: 'dim',
      visibleCount: 120
    })

    assert.deepEqual(result, ['전체 스타일', '흐림 모드', '결과 120개'])
  })

  it('puts the active preset first and summarizes selected filters', () => {
    const result = buildFilterSummary({
      filters: { elements: ['광'], units: ['31A', '31B'], tiers: [0] },
      activeMetaTeam: 'light_meta',
      metaTeams,
      viewMode: 'hide',
      visibleCount: 18
    })

    assert.deepEqual(result, ['광속성 파티', '광', '부대 2개', 'T0', '숨김 모드', '결과 18개'])
  })

  it('falls back to a stable label for an unknown preset id', () => {
    const result = buildFilterSummary({
      filters: { elements: [], units: [], tiers: [] },
      activeMetaTeam: 'missing_meta',
      metaTeams,
      viewMode: 'dim',
      visibleCount: 0
    })

    assert.deepEqual(result, ['선택한 조합', '흐림 모드', '결과 0개'])
  })
})

describe('countVisibleStyles', () => {
  it('excludes hidden cards from the visible count', () => {
    const styles = [
      { id: 'a', isHidden: false },
      { id: 'b', isHidden: true },
      { id: 'c', isHidden: false }
    ]

    assert.equal(countVisibleStyles(styles), 2)
  })
})
```

- [ ] **Step 2: Add the test script**

Modify `package.json` so `scripts` contains:

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "node --test \"src/**/*.test.js\""
}
```

- [ ] **Step 3: Run the tests and verify they fail**

Run:

```powershell
npm test
```

Expected: FAIL with a module-not-found or named-export error for `./filterSummary.js`.

- [ ] **Step 4: Implement the helper**

Create `src/utils/filterSummary.js`:

```js
const formatSelection = (items, singularLabel) => {
  if (items.length === 0) return null
  if (items.length === 1) return String(items[0])
  return `${singularLabel} ${items.length}개`
}

const formatTierSelection = (tiers) => {
  if (tiers.length === 0) return null
  if (tiers.length === 1) return `T${tiers[0]}`
  return `티어 ${tiers.length}개`
}

export const buildFilterSummary = ({
  filters,
  activeMetaTeam,
  metaTeams,
  viewMode,
  visibleCount
}) => {
  const activeTeam = metaTeams.find(team => team.id === activeMetaTeam)
  const labels = []

  if (activeMetaTeam) {
    labels.push(activeTeam?.name || '선택한 조합')
  }

  const elementLabel = formatSelection(filters.elements, '원소')
  const unitLabel = formatSelection(filters.units, '부대')
  const tierLabel = formatTierSelection(filters.tiers)

  if (elementLabel) labels.push(elementLabel)
  if (unitLabel) labels.push(unitLabel)
  if (tierLabel) labels.push(tierLabel)

  if (labels.length === 0) {
    labels.push('전체 스타일')
  }

  labels.push(viewMode === 'hide' ? '숨김 모드' : '흐림 모드')
  labels.push(`결과 ${visibleCount}개`)

  return labels
}

export const countVisibleStyles = (styles) => {
  return styles.filter(style => !style.isHidden).length
}
```

- [ ] **Step 5: Run the helper tests and commit**

Run:

```powershell
npm test
npm run lint
```

Expected: both commands pass.

Commit:

```powershell
git add package.json src/utils/filterSummary.js src/utils/filterSummary.test.js
git commit -m "test: add filter summary helper"
```

### Task 2: Add Summary Bar and Drawer State

**Files:**
- Create: `src/components/FilterSummary.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create the summary component**

Create `src/components/FilterSummary.jsx`:

```jsx
import React from 'react'

const FilterSummary = ({ labels }) => {
  return (
    <div className="filter-summary" aria-label="현재 필터 조건">
      {labels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={index === 0 ? 'summary-chip primary' : 'summary-chip'}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export default FilterSummary
```

- [ ] **Step 2: Wire the summary and drawer state in `App.jsx`**

Modify the imports at the top of `src/App.jsx`:

```jsx
import { useState, useEffect } from 'react'
import stylesData from './data/styles.json'
import metaTeamsData from './data/meta_teams.json'
import FilterPanel from './components/FilterPanel'
import FilterSummary from './components/FilterSummary'
import StyleCard from './components/StyleCard'
import { buildFilterSummary, countVisibleStyles } from './utils/filterSummary'
```

Add drawer state after `viewMode` state:

```jsx
const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
```

Add escape-key close behavior after the `viewMode` persistence effect:

```jsx
useEffect(() => {
  if (!isFilterDrawerOpen) return

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsFilterDrawerOpen(false)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [isFilterDrawerOpen])
```

After `filteredStyles` is computed, add:

```jsx
const visibleStyleCount = countVisibleStyles(filteredStyles)
const filterSummaryLabels = buildFilterSummary({
  filters,
  activeMetaTeam,
  metaTeams,
  viewMode,
  visibleCount: visibleStyleCount
})
```

- [ ] **Step 3: Replace the header search block and old inline panel render**

In `src/App.jsx`, keep `<h1>헤번레 스타일 체커</h1>`, then replace the existing search-only block and the old standalone `<FilterPanel ... />` with:

```jsx
<div className="control-toolbar">
  <button
    type="button"
    className="filter-drawer-button"
    onClick={() => setIsFilterDrawerOpen(true)}
    aria-expanded={isFilterDrawerOpen}
    aria-controls="filter-drawer"
  >
    필터
  </button>

  <div className="search-bar">
    <input
      type="text"
      placeholder="캐릭터 또는 스타일 이름 검색..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {searchTerm && (
      <button
        type="button"
        className="clear-search"
        onClick={() => setSearchTerm('')}
        aria-label="검색어 지우기"
      >
        &times;
      </button>
    )}
  </div>
</div>

<FilterSummary labels={filterSummaryLabels} />
```

After the stats dashboard section and before `<main className="style-list">`, render the overlay drawer:

```jsx
{isFilterDrawerOpen && (
  <div
    className="filter-drawer-overlay"
    onClick={() => setIsFilterDrawerOpen(false)}
  >
    <FilterPanel
      filters={filters}
      onFilterChange={handleFilterChange}
      viewMode={viewMode}
      onToggleViewMode={handleToggleViewMode}
      metaTeams={metaTeams}
      activeMetaTeam={activeMetaTeam}
      onMetaTeamChange={handleMetaTeamChange}
      onClose={() => setIsFilterDrawerOpen(false)}
    />
  </div>
)}
```

- [ ] **Step 4: Prevent overlay clicks from reaching cards**

This is completed in Task 3 by stopping propagation inside `FilterPanel`. After Task 3, verify that clicking the overlay background closes the drawer and clicking inside the drawer does not close it.

- [ ] **Step 5: Run checks and commit**

Run:

```powershell
npm test
npm run lint
```

Expected: both commands pass.

Commit:

```powershell
git add src/App.jsx src/components/FilterSummary.jsx
git commit -m "feat: add filter summary drawer state"
```

### Task 3: Convert FilterPanel Into Drawer Content

**Files:**
- Modify: `src/components/FilterPanel.jsx`

- [ ] **Step 1: Replace `FilterPanel.jsx` with drawer-aware markup**

Replace the full contents of `src/components/FilterPanel.jsx` with:

```jsx
import React from 'react'

const FilterPanel = ({
  filters,
  onFilterChange,
  viewMode,
  onToggleViewMode,
  metaTeams,
  activeMetaTeam,
  onMetaTeamChange,
  onClose
}) => {
  const elements = ['화염', '빙결', '뇌전', '광', '암', '무속성']
  const units = ['31A', '31B', '31C', '30G', '31D', '31E', '31F', '31X']
  const tiers = [0, 1, 2, 3]

  return (
    <aside
      id="filter-drawer"
      className="filter-panel"
      aria-label="필터 패널"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="filter-panel-header">
        <div>
          <h2>필터</h2>
          <p>프리셋을 먼저 고르고 필요한 조건만 좁히세요.</p>
        </div>
        <button type="button" className="filter-close-button" onClick={onClose}>
          닫기
        </button>
      </div>

      <div className="filter-group preset-group">
        <h3>메타 조합</h3>
        <div className="filter-buttons vertical">
          {metaTeams.map(team => (
            <button
              type="button"
              key={team.id}
              className={activeMetaTeam === team.id ? 'active meta' : ''}
              onClick={() => onMetaTeamChange(team.id)}
            >
              {team.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>원소</h3>
        <div className="filter-buttons">
          {elements.map(el => (
            <button
              type="button"
              key={el}
              className={filters.elements.includes(el) ? 'active' : ''}
              onClick={() => onFilterChange('elements', el)}
            >
              {el}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>부대</h3>
        <div className="filter-buttons">
          {units.map(unit => (
            <button
              type="button"
              key={unit}
              className={filters.units.includes(unit) ? 'active' : ''}
              onClick={() => onFilterChange('units', unit)}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>티어</h3>
        <div className="filter-buttons">
          {tiers.map(tier => (
            <button
              type="button"
              key={tier}
              className={filters.tiers.includes(tier) ? 'active' : ''}
              onClick={() => onFilterChange('tiers', tier)}
            >
              T{tier}
            </button>
          ))}
        </div>
      </div>

      <div className="view-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={viewMode === 'hide'}
            onChange={onToggleViewMode}
          />
          필터 제외 대상 숨기기
        </label>
      </div>
    </aside>
  )
}

export default FilterPanel
```

- [ ] **Step 2: Run checks and commit**

Run:

```powershell
npm test
npm run lint
```

Expected: both commands pass.

Commit:

```powershell
git add src/components/FilterPanel.jsx
git commit -m "feat: convert filters to drawer panel"
```

### Task 4: Style Toolbar, Summary, and Drawer

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Replace search and filter CSS with drawer layout CSS**

In `src/styles/main.css`, replace the existing `.search-bar` block through `.clear-search:hover`, and replace the existing `.filter-panel` through `.view-mode-toggle input` filter section with this CSS:

```css
.control-toolbar {
  display: grid;
  grid-template-columns: auto minmax(0, 500px);
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 0 auto 12px;
}

.filter-drawer-button {
  border: 1px solid #f1c40f;
  background: #f1c40f;
  color: #111;
  border-radius: 6px;
  padding: 11px 14px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.filter-drawer-button:hover {
  filter: brightness(1.08);
}

.search-bar {
  position: relative;
  width: 100%;
}

.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 8px rgba(255, 64, 129, 0.2);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.clear-search:hover {
  color: #fff;
}

.filter-summary {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 auto 24px;
}

.summary-chip {
  background: #2a2a2a;
  border: 1px solid #444;
  color: #bbb;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 12px;
  line-height: 1.2;
}

.summary-chip.primary {
  background: #f1c40f;
  border-color: #f1c40f;
  color: #111;
  font-weight: 900;
}

.filter-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.52);
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
}

.filter-panel {
  width: min(340px, calc(100vw - 32px));
  height: 100%;
  overflow-y: auto;
  background: #1e1e1e;
  padding: 18px;
  border-right: 1px solid #444;
  box-shadow: 12px 0 32px rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
}

.filter-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-panel-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #fff;
}

.filter-panel-header p {
  margin: 0;
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}

.filter-close-button {
  border: 1px solid #444;
  background: #2a2a2a;
  color: #ddd;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 12px;
  cursor: pointer;
  flex: 0 0 auto;
}

.filter-close-button:hover {
  background: #333;
  color: #fff;
}

.filter-group {
  margin-bottom: 18px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group h3 {
  font-size: 12px;
  margin-bottom: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.preset-group {
  border-bottom: 1px solid #333;
  padding-bottom: 18px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-buttons.vertical {
  flex-direction: column;
}

.filter-buttons button {
  background: #2a2a2a;
  border: 1px solid #444;
  color: #bbb;
  padding: 7px 11px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  text-align: left;
}

.filter-buttons button:hover {
  background: #333;
  color: #fff;
}

.filter-buttons button.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
  font-weight: bold;
}

.filter-buttons button.active.meta {
  background: #f1c40f;
  border-color: #f1c40f;
  color: #000;
}

.view-mode-toggle {
  display: flex;
  align-items: center;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid #333;
  font-size: 13px;
  color: #bbb;
}

.view-mode-toggle label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.view-mode-toggle input {
  accent-color: var(--primary-color);
}
```

- [ ] **Step 2: Replace the mobile media block**

Replace the current `@media (max-width: 600px)` block with:

```css
@media (max-width: 600px) {
  .style-list {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 8px;
  }

  .app-container {
    padding: 12px;
  }

  header h1 {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .control-toolbar {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  .filter-drawer-button {
    width: 100%;
  }

  .filter-summary {
    justify-content: flex-start;
    margin-bottom: 18px;
  }

  .filter-panel {
    width: min(420px, calc(100vw - 20px));
    padding: 16px;
  }

  .element-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 3: Run checks and commit**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all commands pass.

Commit:

```powershell
git add src/styles/main.css
git commit -m "style: add filter drawer layout"
```

### Task 5: Browser Verification and Final Polish

**Files:**
- Modify only files touched in earlier tasks if verification reveals a concrete issue.

- [ ] **Step 1: Start the app**

Run:

```powershell
npm run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 2: Verify desktop behavior**

Open the local URL and verify:

- The old always-open filter panel is gone.
- The `필터` button opens the left drawer.
- The drawer closes with `닫기`.
- The drawer closes by clicking the dark background.
- The drawer closes with `Esc`.
- Clicking inside the drawer does not close it.
- Clicking the dark background does not toggle any card ownership.
- Selecting a meta preset still highlights matching cards.
- Element/unit/tier filters still dim or hide cards according to `viewMode`.
- The summary bar updates after each filter or preset change.

- [ ] **Step 3: Verify mobile behavior**

Use browser responsive mode around `390px` width and verify:

- The toolbar stacks without text overlap.
- The drawer fits within the viewport width.
- The summary chips wrap without covering the card grid.
- The card grid still uses compact cards.

- [ ] **Step 4: Run final checks and commit any polish**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all commands pass.

If no code changes were needed during verification, do not create another commit. If verification required a concrete CSS or JSX adjustment, commit it:

```powershell
git add src/App.jsx src/components/FilterPanel.jsx src/components/FilterSummary.jsx src/styles/main.css
git commit -m "fix: polish filter drawer interactions"
```

## Self-Review

- Spec coverage: Tasks implement the preset-first drawer, compact summary bar, existing state reuse, overlay close behavior, mobile drawer behavior, hidden/dimmed filtering preservation, and background-click protection.
- Placeholder scan: The plan contains no unresolved placeholders; every changed file has concrete code or command-level steps.
- Type consistency: `isFilterDrawerOpen`, `FilterSummary`, `buildFilterSummary`, `countVisibleStyles`, `onClose`, and existing filter prop names are used consistently across tasks.
