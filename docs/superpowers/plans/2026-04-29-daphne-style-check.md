# Daphne Style Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-style Daphne item tracking with card badges, right-click/long-press toggles, filtering, summaries, and PNG export support.

**Architecture:** Keep Daphne state separate from ownership state in a new `daphneStyles` localStorage object keyed by style id. Add small pure helpers for state and filter semantics, then pass `hasDaphne` through `App.jsx`, `StyleCard`, sticky summary, filter summary, and export grouping. Use a local public Daphne icon asset so card and PNG rendering do not depend on Game8 at runtime.

**Tech Stack:** React 19, Vite, Node ESM, `node:test`, browser localStorage, pointer/contextmenu events, CSS.

---

## File Structure

- Create `src/utils/daphneStyles.js`: normalize persisted Daphne state, toggle one style, count applied styles, match Daphne filter values.
- Create `src/utils/daphneStyles.test.js`: unit tests for Daphne storage/toggle/filter helpers.
- Modify `src/utils/filterState.js` and `src/utils/filterState.test.js`: add `daphneStatuses` default/reset state.
- Modify `src/utils/filterSummary.js` and `src/utils/filterSummary.test.js`: add filter summary labels for exactly one Daphne status.
- Modify `src/utils/ownershipSummary.js` and `src/utils/ownershipSummary.test.js`: include a Daphne count label.
- Modify `src/utils/ownedStatusExport.js` and `src/utils/ownedStatusExport.test.js`: pass Daphne state into export grouping and include `hasDaphne`.
- Modify `src/components/FilterPanel.jsx`: add Daphne applied/unapplied filter buttons.
- Modify `src/components/StyleCard.jsx`: add `hasDaphne`, `onToggleDaphne`, right-click, long-press, and lower-middle badge.
- Modify `src/components/OwnershipStickySummary.jsx`: render the `다프네 N` chip.
- Modify `src/components/OwnedStatusDownloadBoard.jsx`: render Daphne badges in exported tiles and header summary.
- Modify `src/App.jsx`: read/write `hbr_daphne_styles`, compute `daphneCount`, filter by Daphne status, and pass props through.
- Modify `src/styles/main.css`: styles for Daphne filter controls, card badge, summary chip spacing, dashboard count, and export badge.
- Add `public/images/ui/daphne.png`: local copy of the Daphne icon.

### Task 1: Add Daphne State Helpers

**Files:**
- Create: `src/utils/daphneStyles.test.js`
- Create: `src/utils/daphneStyles.js`

- [ ] **Step 1: Write failing tests**

Create `src/utils/daphneStyles.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DAPHNE_STATUS_APPLIED,
  DAPHNE_STATUS_UNAPPLIED,
  countDaphneStyles,
  hasDaphneStyle,
  matchesDaphneStatus,
  normalizeDaphneStyles,
  toggleDaphneStyle
} from './daphneStyles.js'

describe('normalizeDaphneStyles', () => {
  it('keeps only style ids with a true Daphne value', () => {
    assert.deepEqual(
      normalizeDaphneStyles({
        ruka_base: true,
        yuki_base: false,
        seira_base: 1,
        tama_base: 'true'
      }),
      { ruka_base: true }
    )
  })

  it('returns an empty object for invalid persisted values', () => {
    assert.deepEqual(normalizeDaphneStyles(null), {})
    assert.deepEqual(normalizeDaphneStyles(['ruka_base']), {})
  })
})

describe('toggleDaphneStyle', () => {
  it('adds a true value when a style does not have Daphne', () => {
    assert.deepEqual(toggleDaphneStyle({}, 'ruka_base'), { ruka_base: true })
  })

  it('removes a style when it already has Daphne', () => {
    assert.deepEqual(
      toggleDaphneStyle({ ruka_base: true, yuki_base: true }, 'ruka_base'),
      { yuki_base: true }
    )
  })
})

describe('hasDaphneStyle', () => {
  it('treats only true as applied', () => {
    assert.equal(hasDaphneStyle({ ruka_base: true }, 'ruka_base'), true)
    assert.equal(hasDaphneStyle({ ruka_base: false }, 'ruka_base'), false)
    assert.equal(hasDaphneStyle({}, 'ruka_base'), false)
  })
})

describe('countDaphneStyles', () => {
  it('counts true Daphne entries', () => {
    assert.equal(countDaphneStyles({ ruka_base: true, yuki_base: true }), 2)
  })
})

describe('matchesDaphneStatus', () => {
  it('does not filter when no Daphne status is selected', () => {
    assert.equal(matchesDaphneStatus(true, []), true)
    assert.equal(matchesDaphneStatus(false, []), true)
  })

  it('does not filter when both statuses are selected', () => {
    const statuses = [DAPHNE_STATUS_APPLIED, DAPHNE_STATUS_UNAPPLIED]

    assert.equal(matchesDaphneStatus(true, statuses), true)
    assert.equal(matchesDaphneStatus(false, statuses), true)
  })

  it('matches applied-only and unapplied-only filters', () => {
    assert.equal(matchesDaphneStatus(true, [DAPHNE_STATUS_APPLIED]), true)
    assert.equal(matchesDaphneStatus(false, [DAPHNE_STATUS_APPLIED]), false)
    assert.equal(matchesDaphneStatus(true, [DAPHNE_STATUS_UNAPPLIED]), false)
    assert.equal(matchesDaphneStatus(false, [DAPHNE_STATUS_UNAPPLIED]), true)
  })
})
```

- [ ] **Step 2: Run test to verify missing module failure**

Run:

```powershell
npm test -- src/utils/daphneStyles.test.js
```

Expected: FAIL with module-not-found for `./daphneStyles.js`.

- [ ] **Step 3: Implement Daphne helpers**

Create `src/utils/daphneStyles.js`:

```js
export const DAPHNE_STATUS_APPLIED = 'applied'
export const DAPHNE_STATUS_UNAPPLIED = 'unapplied'
export const DAPHNE_STATUS_OPTIONS = [
  DAPHNE_STATUS_APPLIED,
  DAPHNE_STATUS_UNAPPLIED
]

export const normalizeDaphneStyles = value => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(([, hasDaphne]) => hasDaphne === true)
  )
}

export const toggleDaphneStyle = (daphneStyles, styleId) => {
  const next = normalizeDaphneStyles(daphneStyles)

  if (next[styleId] === true) {
    delete next[styleId]
  } else {
    next[styleId] = true
  }

  return next
}

export const hasDaphneStyle = (daphneStyles, styleId) => {
  return daphneStyles[styleId] === true
}

export const countDaphneStyles = daphneStyles => {
  return Object.values(normalizeDaphneStyles(daphneStyles)).length
}

export const matchesDaphneStatus = (hasDaphne, selectedStatuses = []) => {
  const wantsApplied = selectedStatuses.includes(DAPHNE_STATUS_APPLIED)
  const wantsUnapplied = selectedStatuses.includes(DAPHNE_STATUS_UNAPPLIED)

  if (wantsApplied === wantsUnapplied) return true
  return wantsApplied ? hasDaphne : !hasDaphne
}
```

- [ ] **Step 4: Run focused tests**

Run:

```powershell
npm test -- src/utils/daphneStyles.test.js
```

Expected: PASS for `daphneStyles`.

- [ ] **Step 5: Commit helpers**

Run:

```powershell
git add src/utils/daphneStyles.js src/utils/daphneStyles.test.js
git commit -m "test: add daphne style helpers"
```

### Task 2: Add Daphne Filter Defaults and Summary Labels

**Files:**
- Modify: `src/utils/filterState.js`
- Modify: `src/utils/filterState.test.js`
- Modify: `src/utils/filterSummary.js`
- Modify: `src/utils/filterSummary.test.js`

- [ ] **Step 1: Update filter state tests**

Modify `src/utils/filterState.test.js` so the reset test asserts Daphne defaults:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_FILTERS,
  DEFAULT_HIGHLIGHT_LATEST,
  resetFilterState
} from './filterState.js'

describe('filter state defaults', () => {
  it('resets every filter, search, and active meta team while preserving view mode', () => {
    const result = resetFilterState()

    assert.deepEqual(result.filters, DEFAULT_FILTERS)
    assert.deepEqual(result.filters.daphneStatuses, [])
    assert.equal(result.searchTerm, '')
    assert.equal(result.activeMetaTeam, null)
  })

  it('highlights latest styles by default', () => {
    assert.equal(DEFAULT_HIGHLIGHT_LATEST, true)
  })
})
```

- [ ] **Step 2: Run filter state test to verify failure**

Run:

```powershell
npm test -- src/utils/filterState.test.js
```

Expected: FAIL because `daphneStatuses` is not in default filters yet.

- [ ] **Step 3: Add Daphne default filter state**

Modify `src/utils/filterState.js`:

```js
import { DEFAULT_OWNERSHIP_RANGE } from './ownershipRange.js'

export const DEFAULT_FILTERS = {
  elements: [],
  units: [],
  tiers: [],
  ownershipRange: DEFAULT_OWNERSHIP_RANGE,
  daphneStatuses: []
}

export const DEFAULT_HIGHLIGHT_LATEST = true

export const createDefaultFilters = () => ({
  elements: [],
  units: [],
  tiers: [],
  ownershipRange: [...DEFAULT_OWNERSHIP_RANGE],
  daphneStatuses: []
})

export const resetFilterState = () => ({
  filters: createDefaultFilters(),
  searchTerm: '',
  activeMetaTeam: null
})
```

- [ ] **Step 4: Update filter summary tests**

Modify the `buildFilterSummary` import in `src/utils/filterSummary.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DAPHNE_STATUS_APPLIED, DAPHNE_STATUS_UNAPPLIED } from './daphneStyles.js'
import { buildFilterSummary, countMatchingStyles, getRenderableStyles } from './filterSummary.js'
```

Add these tests inside `describe('buildFilterSummary', () => { ... })`:

```js
  it('shows a Daphne applied label when only applied status is selected', () => {
    const result = buildFilterSummary({
      filters: {
        elements: [],
        units: [],
        tiers: [],
        daphneStatuses: [DAPHNE_STATUS_APPLIED]
      },
      activeMetaTeam: null,
      metaTeams,
      viewMode: 'dim',
      visibleCount: 12
    })

    assert.deepEqual(result, ['다프네 적용', '흐림 모드', '결과 12개'])
  })

  it('shows a Daphne unapplied label when only unapplied status is selected', () => {
    const result = buildFilterSummary({
      filters: {
        elements: [],
        units: [],
        tiers: [],
        daphneStatuses: [DAPHNE_STATUS_UNAPPLIED]
      },
      activeMetaTeam: null,
      metaTeams,
      viewMode: 'dim',
      visibleCount: 108
    })

    assert.deepEqual(result, ['다프네 미적용', '흐림 모드', '결과 108개'])
  })

  it('omits the Daphne label when both Daphne statuses are selected', () => {
    const result = buildFilterSummary({
      filters: {
        elements: [],
        units: [],
        tiers: [],
        daphneStatuses: [DAPHNE_STATUS_APPLIED, DAPHNE_STATUS_UNAPPLIED]
      },
      activeMetaTeam: null,
      metaTeams,
      viewMode: 'dim',
      visibleCount: 120
    })

    assert.deepEqual(result, ['전체 스타일', '흐림 모드', '결과 120개'])
  })
```

- [ ] **Step 5: Run filter summary test to verify failure**

Run:

```powershell
npm test -- src/utils/filterSummary.test.js
```

Expected: FAIL because Daphne summary labels are not implemented.

- [ ] **Step 6: Add Daphne labels to filter summary**

Modify `src/utils/filterSummary.js`:

```js
import { DAPHNE_STATUS_APPLIED, DAPHNE_STATUS_UNAPPLIED } from './daphneStyles.js'
import { buildOwnershipRangeLabel } from './ownershipRange.js'

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

const formatDaphneSelection = (daphneStatuses = []) => {
  const wantsApplied = daphneStatuses.includes(DAPHNE_STATUS_APPLIED)
  const wantsUnapplied = daphneStatuses.includes(DAPHNE_STATUS_UNAPPLIED)

  if (wantsApplied === wantsUnapplied) return null
  return wantsApplied ? '다프네 적용' : '다프네 미적용'
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
  const ownershipLabel = buildOwnershipRangeLabel(filters.ownershipRange)
  const daphneLabel = formatDaphneSelection(filters.daphneStatuses)

  if (elementLabel) labels.push(elementLabel)
  if (unitLabel) labels.push(unitLabel)
  if (tierLabel) labels.push(tierLabel)
  if (ownershipLabel) labels.push(ownershipLabel)
  if (daphneLabel) labels.push(daphneLabel)

  if (labels.length === 0) {
    labels.push('전체 스타일')
  }

  labels.push(viewMode === 'hide' ? '숨김 모드' : '흐림 모드')
  labels.push(`결과 ${visibleCount}개`)

  return labels
}

export const countMatchingStyles = (styles) => {
  return styles.filter(style => style.matchesFilters !== false).length
}

export const getRenderableStyles = (styles, viewMode) => {
  if (viewMode !== 'hide') return styles
  return styles.filter(style => style.matchesFilters !== false)
}
```

- [ ] **Step 7: Run focused tests**

Run:

```powershell
npm test -- src/utils/filterState.test.js src/utils/filterSummary.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit filter defaults and labels**

Run:

```powershell
git add src/utils/filterState.js src/utils/filterState.test.js src/utils/filterSummary.js src/utils/filterSummary.test.js
git commit -m "feat: add daphne filter state"
```

### Task 3: Add Daphne Summary and Export Data

**Files:**
- Modify: `src/utils/ownershipSummary.js`
- Modify: `src/utils/ownershipSummary.test.js`
- Modify: `src/utils/ownedStatusExport.js`
- Modify: `src/utils/ownedStatusExport.test.js`

- [ ] **Step 1: Update ownership summary tests**

Modify `src/utils/ownershipSummary.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatOwnershipSummary } from './ownershipSummary.js'

describe('formatOwnershipSummary', () => {
  it('formats owned, total, rate, visible style counts, and Daphne count', () => {
    assert.deepEqual(
      formatOwnershipSummary({
        totalOwned: 84,
        totalStyles: 212,
        ownershipRate: 39,
        visibleStyleCount: 120,
        daphneCount: 7
      }),
      {
        ownershipLabel: '보유 84 / 212',
        rateLabel: '39%',
        visibleLabel: '표시 120',
        daphneLabel: '다프네 7'
      }
    )
  })

  it('keeps zero counts stable', () => {
    assert.deepEqual(
      formatOwnershipSummary({
        totalOwned: 0,
        totalStyles: 0,
        ownershipRate: 0,
        visibleStyleCount: 0,
        daphneCount: 0
      }),
      {
        ownershipLabel: '보유 0 / 0',
        rateLabel: '0%',
        visibleLabel: '표시 0',
        daphneLabel: '다프네 0'
      }
    )
  })
})
```

- [ ] **Step 2: Run summary test to verify failure**

Run:

```powershell
npm test -- src/utils/ownershipSummary.test.js
```

Expected: FAIL because `daphneLabel` is missing.

- [ ] **Step 3: Add Daphne label to summary helper**

Modify `src/utils/ownershipSummary.js`:

```js
export const formatOwnershipSummary = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  visibleStyleCount,
  daphneCount
}) => ({
  ownershipLabel: `보유 ${totalOwned} / ${totalStyles}`,
  rateLabel: `${ownershipRate}%`,
  visibleLabel: `표시 ${visibleStyleCount}`,
  daphneLabel: `다프네 ${daphneCount}`
})
```

- [ ] **Step 4: Update owned status export tests**

In `src/utils/ownedStatusExport.test.js`, update the first `groupStylesForOwnedStatusExport` expectation to call the helper with Daphne state:

```js
groupStylesForOwnedStatusExport(
  styles,
  {
    ruka_base: 4,
    ruka_suit: 0,
    seira_base: 2
  },
  {
    ruka_suit: true
  }
)
```

Add `hasDaphne` to each expected style object:

```js
hasDaphne: false
```

for `ruka_base`, `yuki_base`, and `seira_base`, and:

```js
hasDaphne: true
```

for `ruka_suit`.

Update the second export grouping test call to pass an empty third argument:

```js
groupStylesForOwnedStatusExport(
  [
    {
      id: 'ruka_base',
      unit: '31A',
      character_name: '카야모리 루카',
      style_name: '기본',
      image_url: '/images/styles/ruka_base.webp'
    },
    {
      id: 'ruka_ss',
      unit: '31A',
      character_name: '카야모리 루카',
      style_name: 'SS 스타일',
      image_url: '/images/styles/ruka_ss.webp'
    }
  ],
  {
    ruka_base: 4,
    ruka_ss: 4
  },
  {}
)
```

- [ ] **Step 5: Run export test to verify failure**

Run:

```powershell
npm test -- src/utils/ownedStatusExport.test.js
```

Expected: FAIL because export styles do not include `hasDaphne`.

- [ ] **Step 6: Include Daphne state in export grouping**

Modify `src/utils/ownedStatusExport.js`:

```js
import {
  buildBaseStyleOwnershipByCharacter,
  hasBaseStyleLimitBreakBoost
} from './baseStyleBoost.js'
import { hasDaphneStyle } from './daphneStyles.js'

const toDateParts = date => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return { year, month, day }
}

export const isOwnedStyle = ownedCount => ownedCount !== undefined

export const formatExportDate = date => {
  const { year, month, day } = toDateParts(date)
  return `${year}.${month}.${day}`
}

export const buildOwnedStatusFilename = date => {
  const { year, month, day } = toDateParts(date)
  return `hbr-owned-status-${year}-${month}-${day}.png`
}

export const getExportImageUrl = (imageUrl, baseUrl) => {
  if (!imageUrl) return ''
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedImage = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
  return `${normalizedBase}${normalizedImage}`
}

const createExportStyle = (style, ownedCount, baseOwnershipByCharacter, daphneStyles) => ({
  id: style.id,
  characterName: style.character_name,
  styleName: style.style_name,
  imageUrl: style.image_url,
  ownedCount,
  isOwned: isOwnedStyle(ownedCount),
  hasDaphne: hasDaphneStyle(daphneStyles, style.id),
  hasBaseLimitBreakBoost: hasBaseStyleLimitBreakBoost(
    style,
    ownedCount,
    baseOwnershipByCharacter
  )
})

export const groupStylesForOwnedStatusExport = (styles, ownedStyles, daphneStyles = {}) => {
  const baseOwnershipByCharacter = buildBaseStyleOwnershipByCharacter(styles, ownedStyles)
  const units = []
  const unitsByName = new Map()

  styles.forEach(style => {
    if (!unitsByName.has(style.unit)) {
      const unitGroup = {
        unit: style.unit,
        total: 0,
        owned: 0,
        characters: []
      }
      unitsByName.set(style.unit, {
        group: unitGroup,
        charactersByName: new Map()
      })
      units.push(unitGroup)
    }

    const unitRecord = unitsByName.get(style.unit)
    const unitGroup = unitRecord.group

    if (!unitRecord.charactersByName.has(style.character_name)) {
      const characterGroup = {
        characterName: style.character_name,
        total: 0,
        owned: 0,
        styles: []
      }
      unitRecord.charactersByName.set(style.character_name, characterGroup)
      unitGroup.characters.push(characterGroup)
    }

    const characterGroup = unitRecord.charactersByName.get(style.character_name)
    const ownedCount = ownedStyles[style.id]
    const exportStyle = createExportStyle(
      style,
      ownedCount,
      baseOwnershipByCharacter,
      daphneStyles
    )

    unitGroup.total += 1
    characterGroup.total += 1

    if (exportStyle.isOwned) {
      unitGroup.owned += 1
      characterGroup.owned += 1
    }

    characterGroup.styles.push(exportStyle)
  })

  return units
}
```

- [ ] **Step 7: Run focused tests**

Run:

```powershell
npm test -- src/utils/ownershipSummary.test.js src/utils/ownedStatusExport.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit summary and export helpers**

Run:

```powershell
git add src/utils/ownershipSummary.js src/utils/ownershipSummary.test.js src/utils/ownedStatusExport.js src/utils/ownedStatusExport.test.js
git commit -m "feat: add daphne summary data"
```

### Task 4: Add Daphne UI Asset and Card Interaction

**Files:**
- Add: `public/images/ui/daphne.png`
- Modify: `src/components/StyleCard.jsx`
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add the local Daphne icon asset**

Download the user-provided image and save it at:

```text
public/images/ui/daphne.png
```

Use the source URL:

```text
https://img.game8.jp/9964740/e31a8b2432a406c337833dad73728fa6.png/show
```

If downloading with PowerShell:

```powershell
New-Item -ItemType Directory -Force public/images/ui
Invoke-WebRequest -Uri "https://img.game8.jp/9964740/e31a8b2432a406c337833dad73728fa6.png/show" -OutFile public/images/ui/daphne.png
```

Expected: `public/images/ui/daphne.png` exists and is a PNG image.

- [ ] **Step 2: Update StyleCard component**

Modify `src/components/StyleCard.jsx`:

```jsx
import React, { useRef } from 'react';

const LONG_PRESS_MS = 550;
const DAPHNE_ICON_URL = `${import.meta.env.BASE_URL}images/ui/daphne.png`;

const StyleCard = ({
  style,
  ownedCount,
  onToggleOwned,
  onToggleDaphne,
  isDimmed,
  isMeta,
  highlightLatest,
  hasBaseLimitBreakBoost,
  hasDaphne
}) => {
  const longPressTimerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const {
    id,
    character_name,
    isUniform,
    element,
    isLatest,
    image_url
  } = style;

  const isOwned = ownedCount !== undefined;
  const isLatestHighlighted = Boolean(highlightLatest && isLatest);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    onToggleOwned(id);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    onToggleDaphne(id);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') return;

    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = true;
      onToggleDaphne(id);
      clearLongPressTimer();
    }, LONG_PRESS_MS);
  };

  const handlePointerEnd = () => {
    clearLongPressTimer();
  };

  return (
    <div
      className={`style-card ${isOwned ? `count-${ownedCount} owned` : 'not-owned'} ${isDimmed ? 'dimmed' : ''} ${isUniform ? 'uniform' : ''} ${isMeta ? 'meta-highlight' : ''} ${isLatestHighlighted ? 'latest-highlight' : ''} ${hasBaseLimitBreakBoost ? 'base-boosted' : ''} ${hasDaphne ? 'has-daphne' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
    >
      <div className="card-inner">
        {isOwned && <span className="limit-break-badge">{ownedCount}</span>}
        {isLatestHighlighted && <span className="latest-badge">최신</span>}
        {hasDaphne && (
          <span className="daphne-badge" aria-label="다프네 적용">
            <img src={DAPHNE_ICON_URL} alt="" />
          </span>
        )}

        <div className="style-image-container">
          {image_url ? (
            <img
              src={`${import.meta.env.BASE_URL}${image_url.startsWith('/') ? image_url.slice(1) : image_url}`}
              alt={character_name}
              className="style-image"
            />
          ) : (
            <div className="style-icon-placeholder">
              <span className="element-icon">{element}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleCard;
```

- [ ] **Step 3: Add card badge styles**

In `src/styles/main.css`, add this block near `.limit-break-badge` and `.latest-badge`:

```css
.daphne-badge {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  border: 1px solid rgba(143, 215, 255, 0.95);
  border-radius: 50%;
  background: rgba(10, 18, 24, 0.9);
  box-shadow: 0 0 12px rgba(123, 220, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  pointer-events: none;
}

.daphne-badge img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
```

- [ ] **Step 4: Run lint**

Run:

```powershell
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit card interaction and asset**

Run:

```powershell
git add public/images/ui/daphne.png src/components/StyleCard.jsx src/styles/main.css
git commit -m "feat: add daphne card badge"
```

### Task 5: Integrate Daphne State, Filtering, and Summaries in App

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/FilterPanel.jsx`
- Modify: `src/components/OwnershipStickySummary.jsx`
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add imports and state in App**

Modify `src/App.jsx` imports to include Daphne helpers:

```js
import {
  countDaphneStyles,
  hasDaphneStyle,
  matchesDaphneStatus,
  normalizeDaphneStyles,
  toggleDaphneStyle
} from './utils/daphneStyles'
```

After the `ownedStyles` state, add:

```js
  const [daphneStyles, setDaphneStyles] = useState(() => {
    return normalizeDaphneStyles(
      readJsonStorage(localStorage, 'hbr_daphne_styles', {}, value => {
        return value !== null && typeof value === 'object' && !Array.isArray(value)
      })
    )
  })
```

After the ownedStyles localStorage effect, add:

```js
  useEffect(() => {
    localStorage.setItem('hbr_daphne_styles', JSON.stringify(daphneStyles))
  }, [daphneStyles])
```

- [ ] **Step 2: Add Daphne toggle handler**

In `src/App.jsx`, after `handleToggleOwned`, add:

```js
  const handleToggleDaphne = (id) => {
    setDaphneStyles(prev => toggleDaphneStyle(prev, id))
  }
```

- [ ] **Step 3: Add Daphne filter matching**

In `src/App.jsx`, inside `filteredStyles = styles.map(style => { ... })`, add:

```js
    const hasDaphne = hasDaphneStyle(daphneStyles, style.id)
    const matchDaphne = matchesDaphneStatus(hasDaphne, filters.daphneStatuses)
```

Change `isFilteredOut` to include Daphne:

```js
    const isFilteredOut = !matchElement || !matchUnit || !matchTier || !matchOwnership || !matchSearch || !matchDaphne
```

Add `hasDaphne` to the returned style object:

```js
      hasDaphne,
```

- [ ] **Step 4: Compute Daphne count and pass summary props**

In `src/App.jsx`, after `totalOwned`, add:

```js
  const daphneCount = countDaphneStyles(daphneStyles)
```

Update `OwnershipStickySummary`:

```jsx
      <OwnershipStickySummary
        totalOwned={totalOwned}
        totalStyles={totalStyles}
        ownershipRate={ownershipRate}
        visibleStyleCount={visibleStyleCount}
        daphneCount={daphneCount}
      />
```

- [ ] **Step 5: Add stats dashboard Daphne count**

In `src/App.jsx`, inside `.stat-item.total`, after the existing owned count:

```jsx
            <span className="count daphne-count">다프네 {daphneCount} / {totalStyles}</span>
```

- [ ] **Step 6: Pass Daphne state to export board and cards**

Update `OwnedStatusDownloadBoard` usage:

```jsx
          <OwnedStatusDownloadBoard
            styles={styles}
            ownedStyles={ownedStyles}
            daphneStyles={daphneStyles}
            totalOwned={totalOwned}
            totalStyles={totalStyles}
            ownershipRate={ownershipRate}
            daphneCount={daphneCount}
            generatedAt={ownedStatusExportDate}
          />
```

Update `StyleCard` usage:

```jsx
          <StyleCard
            key={style.id}
            style={style}
            ownedCount={style.ownedCount}
            onToggleOwned={handleToggleOwned}
            onToggleDaphne={handleToggleDaphne}
            isDimmed={style.isDimmed}
            isMeta={style.isMetaHighlight}
            highlightLatest={highlightLatest}
            hasBaseLimitBreakBoost={style.hasBaseLimitBreakBoost}
            hasDaphne={style.hasDaphne}
          />
```

- [ ] **Step 7: Add Daphne filter controls**

Modify `src/components/FilterPanel.jsx` imports:

```js
import {
  DAPHNE_STATUS_APPLIED,
  DAPHNE_STATUS_UNAPPLIED
} from '../utils/daphneStyles'
```

Add this filter group after ownership range group:

```jsx
      <div className="filter-group">
        <h3>다프네</h3>
        <div className="filter-buttons">
          <button
            type="button"
            className={filters.daphneStatuses.includes(DAPHNE_STATUS_APPLIED) ? 'active' : ''}
            onClick={() => onFilterChange('daphneStatuses', DAPHNE_STATUS_APPLIED)}
          >
            적용
          </button>
          <button
            type="button"
            className={filters.daphneStatuses.includes(DAPHNE_STATUS_UNAPPLIED) ? 'active' : ''}
            onClick={() => onFilterChange('daphneStatuses', DAPHNE_STATUS_UNAPPLIED)}
          >
            미적용
          </button>
        </div>
      </div>
```

- [ ] **Step 8: Update sticky summary component**

Modify `src/components/OwnershipStickySummary.jsx`:

```jsx
import React from 'react'
import { formatOwnershipSummary } from '../utils/ownershipSummary'

const OwnershipStickySummary = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  visibleStyleCount,
  daphneCount
}) => {
  const {
    ownershipLabel,
    rateLabel,
    visibleLabel,
    daphneLabel
  } = formatOwnershipSummary({
    totalOwned,
    totalStyles,
    ownershipRate,
    visibleStyleCount,
    daphneCount
  })

  return (
    <section className="ownership-sticky-summary" aria-label="보유 스타일 요약">
      <div className="ownership-sticky-summary-inner">
        <span className="ownership-summary-chip primary">{ownershipLabel}</span>
        <span className="ownership-summary-chip rate">{rateLabel}</span>
        <span className="ownership-summary-chip daphne">{daphneLabel}</span>
        <span className="ownership-summary-chip">{visibleLabel}</span>
      </div>
    </section>
  )
}

export default OwnershipStickySummary
```

- [ ] **Step 9: Add summary styles**

In `src/styles/main.css`, after `.ownership-summary-chip.rate`, add:

```css
.ownership-summary-chip.daphne {
  border-color: #7bdcff;
  color: #aee9ff;
}

.stat-item .count.daphne-count {
  color: #aee9ff;
}
```

- [ ] **Step 10: Run build**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 11: Commit App integration**

Run:

```powershell
git add src/App.jsx src/components/FilterPanel.jsx src/components/OwnershipStickySummary.jsx src/styles/main.css
git commit -m "feat: integrate daphne style state"
```

### Task 6: Add Daphne to PNG Export Board

**Files:**
- Modify: `src/components/OwnedStatusDownloadBoard.jsx`
- Modify: `src/styles/main.css`

- [ ] **Step 1: Update export board component**

Modify `src/components/OwnedStatusDownloadBoard.jsx`:

```jsx
import React from 'react'
import {
  formatExportDate,
  getExportImageUrl,
  groupStylesForOwnedStatusExport
} from '../utils/ownedStatusExport'

const DAPHNE_ICON_URL = `${import.meta.env.BASE_URL}images/ui/daphne.png`

const OwnedStatusTile = ({ style }) => {
  const imageUrl = getExportImageUrl(style.imageUrl, import.meta.env.BASE_URL)

  return (
    <div className={`owned-export-tile ${style.isOwned ? `owned count-${style.ownedCount}` : 'not-owned'} ${style.hasBaseLimitBreakBoost ? 'base-boosted' : ''} ${style.hasDaphne ? 'has-daphne' : ''}`}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className="owned-export-image" />
      ) : (
        <div className="owned-export-image-placeholder" />
      )}
      {style.isOwned && (
        <span className="owned-export-count-badge">{style.ownedCount}</span>
      )}
      {style.hasDaphne && (
        <span className="owned-export-daphne-badge">
          <img src={DAPHNE_ICON_URL} alt="" />
        </span>
      )}
    </div>
  )
}

const OwnedStatusDownloadBoard = ({
  styles,
  ownedStyles,
  daphneStyles,
  totalOwned,
  totalStyles,
  ownershipRate,
  daphneCount,
  generatedAt
}) => {
  const units = groupStylesForOwnedStatusExport(styles, ownedStyles, daphneStyles)

  return (
    <div className="owned-status-export-board">
      <header className="owned-export-header">
        <div>
          <h2>헤번레 보유현황</h2>
          <p>{formatExportDate(generatedAt)} 생성</p>
        </div>
        <div className="owned-export-summary">
          <span>보유 {totalOwned} / {totalStyles}</span>
          <span>{ownershipRate}%</span>
          <span>다프네 {daphneCount}</span>
        </div>
      </header>

      <div className="owned-export-units">
        {units.map(unit => (
          <section key={unit.unit} className="owned-export-unit">
            <div className="owned-export-unit-header">
              <h3>{unit.unit}</h3>
              <span>{unit.owned} / {unit.total}</span>
            </div>

            <div className="owned-export-characters">
              {unit.characters.map(character => (
                <section key={`${unit.unit}-${character.characterName}`} className="owned-export-character">
                  <div className="owned-export-character-header">
                    <strong>{character.characterName}</strong>
                    <span>{character.owned} / {character.total}</span>
                  </div>
                  <div className="owned-export-style-grid">
                    {character.styles.map(style => (
                      <OwnedStatusTile key={style.id} style={style} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default OwnedStatusDownloadBoard
```

- [ ] **Step 2: Add export badge styles**

In `src/styles/main.css`, after `.owned-export-count-badge`, add:

```css
.owned-export-daphne-badge {
  position: absolute;
  left: 50%;
  bottom: 5px;
  transform: translateX(-50%);
  width: 22px;
  height: 22px;
  border: 1px solid rgba(143, 215, 255, 0.95);
  border-radius: 50%;
  background: rgba(10, 18, 24, 0.9);
  box-shadow: 0 0 8px rgba(123, 220, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.owned-export-daphne-badge img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
```

- [ ] **Step 3: Run build**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit export UI**

Run:

```powershell
git add src/components/OwnedStatusDownloadBoard.jsx src/styles/main.css
git commit -m "feat: show daphne in owned export"
```

### Task 7: Final Verification

**Files:**
- Modify only files from earlier tasks if a concrete verification issue is found.

- [ ] **Step 1: Run automated verification**

Run:

```powershell
npm test
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 2: Start the dev server**

Run in a PowerShell window that stays open:

```powershell
npm run dev -- --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174/hbr-syltchecker/
```

- [ ] **Step 3: Manual browser verification**

Verify:

- Normal card click still changes only owned/limit-break state.
- Right-click on a card toggles the lower-middle Daphne badge and does not open the browser context menu.
- Long-press on a touch-capable browser toggles Daphne without also changing owned/limit-break state.
- The filter drawer has Daphne `적용` and `미적용` buttons.
- Daphne applied filter shows only styles with a Daphne badge.
- Daphne unapplied filter hides or dims Daphne-applied styles according to the current Dim/Hide mode.
- Stats dashboard shows `다프네 N / total`.
- Sticky summary shows `다프네 N`.
- PNG download/copy includes the Daphne count and badge.

- [ ] **Step 4: Check git status**

Run:

```powershell
git status --short --branch
```

Expected: no unstaged source changes.

## Self-Review

- Spec coverage: The tasks cover per-style state, one-Daphne invariant, independent storage, right-click, long-press, lower-middle badge, filters, summaries, PNG export, local icon asset, and verification.
- Placeholder scan: No unresolved placeholder markers remain. Each code-changing step includes concrete code or exact commands.
- Type consistency: The plan consistently uses `daphneStyles`, `hbr_daphne_styles`, `hasDaphne`, `daphneStatuses`, `DAPHNE_STATUS_APPLIED`, `DAPHNE_STATUS_UNAPPLIED`, `toggleDaphneStyle`, and `matchesDaphneStatus`.
