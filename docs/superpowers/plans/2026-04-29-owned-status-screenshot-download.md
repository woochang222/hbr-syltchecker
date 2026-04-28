# Owned Status Screenshot Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Pages-compatible button that downloads a fixed-width PNG of the user's full owned-style status.

**Architecture:** Use a client-side DOM-to-PNG library and a hidden download-only React board. Keep grouping, filename, date, and image-load behavior in small utility modules so the complex parts are testable without browser rendering.

**Tech Stack:** React 19, Vite, Node ESM, `node:test`, `html-to-image`, browser DOM APIs.

---

## File Structure

- Modify `package.json` and `package-lock.json`: add `html-to-image`.
- Create `src/utils/ownedStatusExport.js`: grouping, date formatting, filename creation, and local image URL resolution helpers.
- Create `src/utils/ownedStatusExport.test.js`: unit tests for export helpers.
- Create `src/utils/domImageDownload.js`: wait for image load, convert a DOM node to PNG, trigger browser download.
- Create `src/components/OwnedStatusDownloadBoard.jsx`: hidden export board content.
- Modify `src/App.jsx`: render hidden board, add download button state, call the DOM download utility.
- Modify `src/styles/main.css`: export button, status text, and download board styles.

### Task 1: Add DOM-to-PNG Dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install dependency**

Run:

```powershell
npm install html-to-image
```

Expected: `html-to-image` appears in `dependencies` in `package.json`, and `package-lock.json` is updated.

- [ ] **Step 2: Run existing tests**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 3: Commit dependency**

Run:

```powershell
git add package.json package-lock.json
git commit -m "build: add png export dependency"
```

### Task 2: Add Owned Status Export Helpers

**Files:**
- Create: `src/utils/ownedStatusExport.test.js`
- Create: `src/utils/ownedStatusExport.js`

- [ ] **Step 1: Write failing tests**

Create `src/utils/ownedStatusExport.test.js`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildOwnedStatusFilename,
  formatExportDate,
  getExportImageUrl,
  groupStylesForOwnedStatusExport,
  isOwnedStyle
} from './ownedStatusExport.js'

const styles = [
  {
    id: 'ruka_base',
    unit: '31A',
    character_name: '카야모리 루카',
    style_name: '잔향의 카디널',
    image_url: '/images/styles/ruka_base.webp'
  },
  {
    id: 'ruka_suit',
    unit: '31A',
    character_name: '카야모리 루카',
    style_name: '수트',
    image_url: 'images/styles/ruka_suit.webp'
  },
  {
    id: 'yuki_base',
    unit: '31A',
    character_name: '이즈미 유키',
    style_name: '잔광',
    image_url: '/images/styles/yuki_base.webp'
  },
  {
    id: 'seira_base',
    unit: '31C',
    character_name: '사쿠라바 세이라',
    style_name: '별의 바다',
    image_url: '/images/styles/seira_base.webp'
  }
]

describe('isOwnedStyle', () => {
  it('treats any defined ownership value as owned, including zero', () => {
    assert.equal(isOwnedStyle(undefined), false)
    assert.equal(isOwnedStyle(0), true)
    assert.equal(isOwnedStyle(1), true)
    assert.equal(isOwnedStyle(4), true)
  })
})

describe('groupStylesForOwnedStatusExport', () => {
  it('groups styles by unit and then character while preserving order', () => {
    assert.deepEqual(
      groupStylesForOwnedStatusExport(styles, {
        ruka_base: 4,
        ruka_suit: 0,
        seira_base: 2
      }),
      [
        {
          unit: '31A',
          total: 3,
          owned: 2,
          characters: [
            {
              characterName: '카야모리 루카',
              total: 2,
              owned: 2,
              styles: [
                {
                  id: 'ruka_base',
                  characterName: '카야모리 루카',
                  styleName: '잔향의 카디널',
                  imageUrl: '/images/styles/ruka_base.webp',
                  ownedCount: 4,
                  isOwned: true
                },
                {
                  id: 'ruka_suit',
                  characterName: '카야모리 루카',
                  styleName: '수트',
                  imageUrl: 'images/styles/ruka_suit.webp',
                  ownedCount: 0,
                  isOwned: true
                }
              ]
            },
            {
              characterName: '이즈미 유키',
              total: 1,
              owned: 0,
              styles: [
                {
                  id: 'yuki_base',
                  characterName: '이즈미 유키',
                  styleName: '잔광',
                  imageUrl: '/images/styles/yuki_base.webp',
                  ownedCount: undefined,
                  isOwned: false
                }
              ]
            }
          ]
        },
        {
          unit: '31C',
          total: 1,
          owned: 1,
          characters: [
            {
              characterName: '사쿠라바 세이라',
              total: 1,
              owned: 1,
              styles: [
                {
                  id: 'seira_base',
                  characterName: '사쿠라바 세이라',
                  styleName: '별의 바다',
                  imageUrl: '/images/styles/seira_base.webp',
                  ownedCount: 2,
                  isOwned: true
                }
              ]
            }
          ]
        }
      ]
    )
  })
})

describe('formatExportDate', () => {
  it('formats dates for Korean display', () => {
    assert.equal(formatExportDate(new Date('2026-04-29T12:34:56Z')), '2026.04.29')
  })
})

describe('buildOwnedStatusFilename', () => {
  it('uses an ISO-like date in the filename', () => {
    assert.equal(
      buildOwnedStatusFilename(new Date('2026-04-29T12:34:56Z')),
      'hbr-owned-status-2026-04-29.png'
    )
  })
})

describe('getExportImageUrl', () => {
  it('prefixes local absolute public paths with the Vite base path', () => {
    assert.equal(
      getExportImageUrl('/images/styles/ruka_base.webp', '/hbr-syltchecker/'),
      '/hbr-syltchecker/images/styles/ruka_base.webp'
    )
  })

  it('prefixes local relative public paths with the Vite base path', () => {
    assert.equal(
      getExportImageUrl('images/styles/ruka_suit.webp', '/hbr-syltchecker/'),
      '/hbr-syltchecker/images/styles/ruka_suit.webp'
    )
  })

  it('returns an empty string for missing image urls', () => {
    assert.equal(getExportImageUrl(undefined, '/hbr-syltchecker/'), '')
  })
})
```

- [ ] **Step 2: Run tests to verify missing module failure**

Run:

```powershell
npm test -- src/utils/ownedStatusExport.test.js
```

Expected: FAIL with module-not-found for `./ownedStatusExport.js`.

- [ ] **Step 3: Implement helpers**

Create `src/utils/ownedStatusExport.js`:

```js
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

const createExportStyle = (style, ownedCount) => ({
  id: style.id,
  characterName: style.character_name,
  styleName: style.style_name,
  imageUrl: style.image_url,
  ownedCount,
  isOwned: isOwnedStyle(ownedCount)
})

export const groupStylesForOwnedStatusExport = (styles, ownedStyles) => {
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
    const exportStyle = createExportStyle(style, ownedCount)

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

- [ ] **Step 4: Run focused tests**

Run:

```powershell
npm test -- src/utils/ownedStatusExport.test.js
```

Expected: PASS for `ownedStatusExport`.

- [ ] **Step 5: Commit helpers**

Run:

```powershell
git add src/utils/ownedStatusExport.js src/utils/ownedStatusExport.test.js
git commit -m "test: add owned status export helpers"
```

### Task 3: Add Download Board Component

**Files:**
- Create: `src/components/OwnedStatusDownloadBoard.jsx`

- [ ] **Step 1: Create component**

Create `src/components/OwnedStatusDownloadBoard.jsx`:

```jsx
import React from 'react'
import {
  formatExportDate,
  getExportImageUrl,
  groupStylesForOwnedStatusExport
} from '../utils/ownedStatusExport'

const OwnedStatusTile = ({ style }) => {
  const imageUrl = getExportImageUrl(style.imageUrl, import.meta.env.BASE_URL)

  return (
    <div className={`owned-export-tile ${style.isOwned ? `owned count-${style.ownedCount}` : 'not-owned'}`}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className="owned-export-image" />
      ) : (
        <div className="owned-export-image-placeholder" />
      )}
      {style.isOwned && (
        <span className="owned-export-count-badge">{style.ownedCount}</span>
      )}
    </div>
  )
}

const OwnedStatusDownloadBoard = ({
  styles,
  ownedStyles,
  totalOwned,
  totalStyles,
  ownershipRate,
  generatedAt
}) => {
  const units = groupStylesForOwnedStatusExport(styles, ownedStyles)

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

- [ ] **Step 2: Run lint**

Run:

```powershell
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Commit component**

Run:

```powershell
git add src/components/OwnedStatusDownloadBoard.jsx
git commit -m "feat: add owned status export board"
```

### Task 4: Add DOM Image Download Utility

**Files:**
- Create: `src/utils/domImageDownload.js`

- [ ] **Step 1: Create utility**

Create `src/utils/domImageDownload.js`:

```js
import { toPng } from 'html-to-image'

const waitForImage = image => {
  if (image.complete) {
    return Promise.resolve()
  }

  return new Promise(resolve => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  })
}

export const waitForImages = element => {
  const images = Array.from(element.querySelectorAll('img'))
  return Promise.all(images.map(waitForImage))
}

export const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
}

export const downloadElementAsPng = async (element, filename) => {
  await waitForImages(element)
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#121212'
  })
  downloadDataUrl(dataUrl, filename)
}
```

- [ ] **Step 2: Run build**

Run:

```powershell
npm run build
```

Expected: PASS, confirming `html-to-image` imports correctly in the Vite build.

- [ ] **Step 3: Commit utility**

Run:

```powershell
git add src/utils/domImageDownload.js
git commit -m "feat: add png download utility"
```

### Task 5: Integrate Download Button and Board

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add imports**

In `src/App.jsx`, update the React import and add component/utility imports:

```js
import { useState, useEffect, useRef } from 'react'
```

Add this import after `OwnershipStickySummary`:

```js
import OwnedStatusDownloadBoard from './components/OwnedStatusDownloadBoard'
```

Add these imports after `readStringStorage` import:

```js
import { buildOwnedStatusFilename } from './utils/ownedStatusExport'
import { downloadElementAsPng } from './utils/domImageDownload'
```

- [ ] **Step 2: Add download state and ref**

Inside `App`, after `isFilterDrawerOpen` state, add:

```js
  const exportBoardRef = useRef(null)
  const [isDownloadingOwnedStatus, setIsDownloadingOwnedStatus] = useState(false)
  const [ownedStatusDownloadMessage, setOwnedStatusDownloadMessage] = useState('')
```

- [ ] **Step 3: Add download handler**

Add this handler after `handleResetFilters`:

```js
  const handleDownloadOwnedStatus = async () => {
    if (!exportBoardRef.current || isDownloadingOwnedStatus) return

    setIsDownloadingOwnedStatus(true)
    setOwnedStatusDownloadMessage('')

    try {
      const now = new Date()
      await downloadElementAsPng(
        exportBoardRef.current,
        buildOwnedStatusFilename(now)
      )
      setOwnedStatusDownloadMessage('보유현황 PNG를 생성했습니다')
    } catch {
      setOwnedStatusDownloadMessage('이미지 생성에 실패했습니다')
    } finally {
      setIsDownloadingOwnedStatus(false)
    }
  }
```

- [ ] **Step 4: Add button in stats dashboard**

Inside `.stat-item.total`, after:

```jsx
            <span className="count">{totalOwned} / {totalStyles}</span>
```

add:

```jsx
            <button
              type="button"
              className="owned-status-download-button"
              onClick={handleDownloadOwnedStatus}
              disabled={isDownloadingOwnedStatus}
            >
              {isDownloadingOwnedStatus ? 'PNG 생성 중...' : '보유현황 PNG'}
            </button>
            {ownedStatusDownloadMessage && (
              <span className="owned-status-download-message">
                {ownedStatusDownloadMessage}
              </span>
            )}
```

- [ ] **Step 5: Render hidden export board**

After `<OwnershipStickySummary ... />` and before the filter drawer conditional, add:

```jsx
      <div className="owned-status-export-host" aria-hidden="true">
        <div ref={exportBoardRef}>
          <OwnedStatusDownloadBoard
            styles={styles}
            ownedStyles={ownedStyles}
            totalOwned={totalOwned}
            totalStyles={totalStyles}
            ownershipRate={ownershipRate}
            generatedAt={new Date()}
          />
        </div>
      </div>
```

- [ ] **Step 6: Run build**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit integration**

Run:

```powershell
git add src/App.jsx
git commit -m "feat: add owned status png action"
```

### Task 6: Add Export Board and Button Styles

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add button styles**

In `src/styles/main.css`, after `.stat-item .count`, add:

```css
.owned-status-download-button {
  margin-top: 12px;
  border: 1px solid #f1c40f;
  background: #f1c40f;
  color: #111;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.owned-status-download-button:hover:not(:disabled) {
  filter: brightness(1.08);
}

.owned-status-download-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.owned-status-download-message {
  margin-top: 8px;
  color: #aaa;
  font-size: 12px;
}
```

- [ ] **Step 2: Add hidden host and board styles**

In `src/styles/main.css`, after `.ownership-summary-chip.rate`, add:

```css
.owned-status-export-host {
  position: fixed;
  left: -10000px;
  top: 0;
  width: 1200px;
  pointer-events: none;
  opacity: 0;
}

.owned-status-export-board {
  width: 1200px;
  box-sizing: border-box;
  background: #121212;
  color: #fff;
  padding: 28px;
  font-family: 'Noto Sans KR', sans-serif;
}

.owned-export-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #333;
}

.owned-export-header h2 {
  margin: 0 0 6px;
  color: #ff4081;
  font-size: 30px;
}

.owned-export-header p {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.owned-export-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.owned-export-summary span {
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #ddd;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 900;
}

.owned-export-summary span:first-child {
  border-color: #f1c40f;
  background: #f1c40f;
  color: #111;
}

.owned-export-units {
  display: grid;
  gap: 22px;
}

.owned-export-unit {
  border: 1px solid #333;
  border-radius: 8px;
  background: #181818;
  overflow: hidden;
}

.owned-export-unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #222;
  border-bottom: 1px solid #333;
}

.owned-export-unit-header h3 {
  margin: 0;
  color: #f1c40f;
  font-size: 18px;
}

.owned-export-unit-header span {
  color: #ddd;
  font-size: 13px;
  font-weight: 900;
}

.owned-export-characters {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.owned-export-character {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
  align-items: start;
}

.owned-export-character-header {
  display: grid;
  gap: 4px;
  padding-top: 6px;
}

.owned-export-character-header strong {
  color: #ddd;
  font-size: 13px;
}

.owned-export-character-header span {
  color: #888;
  font-size: 11px;
  font-weight: 900;
}

.owned-export-style-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.owned-export-tile {
  position: relative;
  width: 78px;
  height: 78px;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
  background: #2a2a2a;
}

.owned-export-tile.not-owned {
  opacity: 0.3;
  filter: grayscale(1);
}

.owned-export-tile.owned {
  opacity: 1;
  filter: none;
}

.owned-export-tile.count-0 { border-color: #444; }
.owned-export-tile.count-1 { border-color: #cd7f32; }
.owned-export-tile.count-2 { border-color: #c0c0c0; }
.owned-export-tile.count-3 { border-color: #ffd700; }
.owned-export-tile.count-4 { border-color: #e5e4e2; }

.owned-export-image,
.owned-export-image-placeholder {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.owned-export-count-badge {
  position: absolute;
  right: 5px;
  bottom: 5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
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
git commit -m "style: add owned status export layout"
```

### Task 7: Final Verification

**Files:**
- Modify only files from earlier tasks if a concrete issue is found.

- [ ] **Step 1: Run full automated verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 2: Run browser verification**

Start the dev server:

```powershell
npm run dev -- --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174/hbr-syltchecker/
```

Verify:
- `보유현황 PNG` appears in the stats dashboard area.
- Clicking it downloads or opens a PNG.
- The PNG includes all styles, not only the currently filtered styles.
- A 0-break owned style displays a `0` badge if one is marked before export.
- Unowned styles are dimmed/grayscale.

- [ ] **Step 3: Check git status**

Run:

```powershell
git status --short --branch
```

Expected: no unstaged source changes.

## Self-Review

- Spec coverage: Tasks cover GitHub Pages-compatible client PNG generation, full-data export, unit/character grouping, image-only cards with ownership badges, 0-break ownership, fixed-width long PNG, stats-dashboard button placement, loading/error states, and verification.
- Placeholder scan: No unresolved markers, vague implementation steps, or missing code blocks remain.
- Type consistency: The plan consistently uses `OwnedStatusDownloadBoard`, `groupStylesForOwnedStatusExport`, `buildOwnedStatusFilename`, `formatExportDate`, `getExportImageUrl`, `downloadElementAsPng`, `ownedStyles`, and `ownedCount`.
