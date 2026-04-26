# Meta Team Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add strict structure validation and advisory review reporting for best-team presets.

**Architecture:** Keep `src/data/meta_teams.json` as the runtime source for preset contents. Add deterministic tests for preset shape and elemental coverage, then add `meta_team_manifest.json` for source/review metadata consumed by the existing warning report script.

**Tech Stack:** React 19/Vite app, Node ESM, `node:test`, local JSON data, existing `npm test`, `npm run lint`, `npm run build`, and `npm run validate:data-report`.

**Status:** Completed and pushed. Current manifests are fully verified, `npm run validate:data-report` reports no warning sections, and `npm run validate:source-urls` passes when run with network access.

---

## File Structure

- Modify `src/data/metaTeams.test.js`: add strict best-team structure and element coverage tests.
- Create `src/data/meta_team_manifest.json`: advisory metadata and expected style lists for current presets.
- Modify `scripts/validate-data-report.js`: include meta team manifest warning sections.

### Task 1: Add Strict Meta Team Structure Tests

**Files:**
- Modify: `src/data/metaTeams.test.js`

- [x] **Step 1: Add failing strict structure tests**

In `src/data/metaTeams.test.js`, after the existing `stylesById` constant, add:

```js
const expectedMetaTeams = [
  { id: 'neutral_meta', name: '무 최고 조합', element: '무' },
  { id: 'fire_meta', name: '화 최고 조합', element: '화' },
  { id: 'ice_meta', name: '빙 최고 조합', element: '빙' },
  { id: 'thunder_meta', name: '뇌 최고 조합', element: '뇌' },
  { id: 'light_meta', name: '광 최고 조합', element: '광' },
  { id: 'dark_meta', name: '암 최고 조합', element: '암' }
]
```

Replace the hardcoded expectation in `defines one best-team preset per supported element` with:

```js
      expectedMetaTeams.map(team => [team.id, team.name])
```

Then add these tests inside `describe('meta teams', () => { ... })`:

```js
  it('uses exactly six unique styles per best-team preset', () => {
    const invalidTeams = metaTeams
      .map(team => ({
        id: team.id,
        count: team.styles.length,
        uniqueCount: new Set(team.styles).size
      }))
      .filter(team => team.count !== 6 || team.uniqueCount !== 6)

    assert.deepEqual(invalidTeams, [])
  })

  it('matches supported element ids and names', () => {
    assert.deepEqual(
      metaTeams.map(team => ({ id: team.id, name: team.name })),
      expectedMetaTeams.map(team => ({ id: team.id, name: team.name }))
    )
  })

  it('includes at least one style matching each preset element', () => {
    const teamsWithoutElementStyle = metaTeams
      .map(team => {
        const expectedTeam = expectedMetaTeams.find(expected => expected.id === team.id)
        const hasMatchingStyle = team.styles
          .map(styleId => stylesById.get(styleId))
          .some(style => style?.element === expectedTeam?.element || style?.elements?.includes(expectedTeam?.element))

        return {
          id: team.id,
          element: expectedTeam?.element,
          hasMatchingStyle
        }
      })
      .filter(team => !team.hasMatchingStyle)

    assert.deepEqual(teamsWithoutElementStyle, [])
  })
```

- [x] **Step 2: Run tests**

Run:

```powershell
npm test
```

Expected: PASS if all current presets already satisfy strict structure and element coverage.

- [x] **Step 3: Commit Task 1**

Run:

```powershell
git add src/data/metaTeams.test.js
git commit -m "test: strengthen meta team validation"
```

### Task 2: Add Meta Team Manifest

**Files:**
- Create: `src/data/meta_team_manifest.json`

- [x] **Step 1: Create the manifest**

Create `src/data/meta_team_manifest.json`:

```json
{
  "neutral_meta": {
    "expectedStyles": [
      "bungo_yayoi_unison_res",
      "yamawaki_unison_res",
      "sakuraba_seira_servant",
      "satsuki_mari_servant",
      "amane_miko_servant",
      "asakura_karen_unison_res"
    ],
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "reviewStatus": "needs-review",
    "reviewedAt": null
  },
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
  },
  "ice_meta": {
    "expectedStyles": [
      "tachibana_kanade_soaring_sword",
      "aikawa_megumi_unison_res",
      "tojo_tsukasa_sorrow",
      "kayamori_ruka_admiral_res",
      "kunimi_tama_halloween_res",
      "aoi_erika_white_suit_res"
    ],
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "reviewStatus": "needs-review",
    "reviewedAt": null
  },
  "thunder_meta": {
    "expectedStyles": [
      "tezuka_saki_base_res",
      "aikawa_megumi_unison_res",
      "mizuhara_aina_swimsuit_res",
      "maruyama_kanata_regalia_res",
      "nanase_nanami_admiral_res",
      "yamawaki_unison_res"
    ],
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "reviewStatus": "needs-review",
    "reviewedAt": null
  },
  "light_meta": {
    "expectedStyles": [
      "shirakawa_yuina_white_suit_res",
      "date_akari_sports_day_res",
      "minase_ichigo_pawapuro_res",
      "yanagi_mion_admiral_res",
      "asakura_karen_unison_res",
      "oshima_ichiko_white_suit_res"
    ],
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "reviewStatus": "needs-review",
    "reviewedAt": null
  },
  "dark_meta": {
    "expectedStyles": [
      "yamawaki_unison_res",
      "tojo_tsukasa_bunny",
      "mizuhara_aina_pirate",
      "nikaido_misato_admiral_res",
      "kanzaki_adelheid_servant_res",
      "aoi_erika_swimsuit_res"
    ],
    "sourceUrl": "https://game8.jp/heavenburnsred/",
    "reviewStatus": "needs-review",
    "reviewedAt": null
  }
}
```

- [x] **Step 2: Run tests**

Run:

```powershell
npm test
```

Expected: PASS. The manifest is advisory and is not loaded by `npm test` in this task.

- [x] **Step 3: Commit Task 2**

Run:

```powershell
git add src/data/meta_team_manifest.json
git commit -m "chore: add meta team review manifest"
```

### Task 3: Extend Warning Report for Meta Team Review Metadata

**Files:**
- Modify: `scripts/validate-data-report.js`

- [x] **Step 1: Load meta team data and manifest**

At the top of `scripts/validate-data-report.js`, after the existing `manifest` load, add:

```js
const metaTeams = JSON.parse(readFileSync(new URL('../src/data/meta_teams.json', import.meta.url), 'utf8'))
const metaTeamManifest = JSON.parse(readFileSync(new URL('../src/data/meta_team_manifest.json', import.meta.url), 'utf8'))
```

After the existing `manifestIds` constant, add:

```js
const metaTeamIds = new Set(metaTeams.map(team => team.id))
const metaTeamManifestIds = new Set(Object.keys(metaTeamManifest))
```

- [x] **Step 2: Add warning calculations**

Inside the `warnings` object, after `missingManifestImages`, add these properties:

```js
  missingMetaTeamManifest: metaTeams
    .filter(team => !metaTeamManifestIds.has(team.id))
    .map(team => team.id),
  missingMetaTeamSourceUrl: Object.entries(metaTeamManifest)
    .filter(([, entry]) => !entry.sourceUrl)
    .map(([teamId]) => teamId),
  missingMetaTeamReviewedAt: Object.entries(metaTeamManifest)
    .filter(([, entry]) => !entry.reviewedAt)
    .map(([teamId]) => teamId),
  unverifiedMetaTeams: Object.entries(metaTeamManifest)
    .filter(([, entry]) => entry.reviewStatus !== 'verified')
    .map(([teamId, entry]) => ({ id: teamId, reviewStatus: entry.reviewStatus || 'missing' })),
  metaTeamManifestMismatches: Object.entries(metaTeamManifest)
    .flatMap(([teamId, entry]) => {
      const team = metaTeams.find(metaTeam => metaTeam.id === teamId)
      if (!team) return []

      return JSON.stringify(team.styles) === JSON.stringify(entry.expectedStyles)
        ? []
        : [{ id: teamId, actual: team.styles, expected: entry.expectedStyles }]
    }),
  missingMetaTeamRows: Object.keys(metaTeamManifest)
    .filter(teamId => !metaTeamIds.has(teamId))
```

Because this adds properties after the previous last property, ensure the previous `missingManifestImages` property ends with a comma:

```js
  missingManifestImages: Object.entries(manifest)
    .filter(([, entry]) => !existsSync(new URL(`../public${entry.expectedImageUrl}`, import.meta.url)))
    .map(([styleId, entry]) => ({ id: styleId, image_url: entry.expectedImageUrl })),
```

- [x] **Step 3: Print meta team warning sections**

At the end of `scripts/validate-data-report.js`, after `printSection('Manifest entries missing local images', warnings.missingManifestImages)`, add:

```js
printSection('Meta teams missing manifest entries', warnings.missingMetaTeamManifest)
printSection('Meta team manifest entries missing sourceUrl', warnings.missingMetaTeamSourceUrl)
printSection('Meta team manifest entries missing reviewedAt', warnings.missingMetaTeamReviewedAt)
printSection('Meta team manifests not verified', warnings.unverifiedMetaTeams)
printSection('Meta team expectedStyles mismatches', warnings.metaTeamManifestMismatches)
printSection('Meta team manifest entries missing meta_teams.json rows', warnings.missingMetaTeamRows)
```

- [x] **Step 4: Run report**

Run:

```powershell
npm run validate:data-report
```

Expected:
- Exit code `0`.
- Existing style warning sections still print.
- New meta team warning sections print.
- `Meta teams missing manifest entries` is `None`.
- `Meta team manifest entries missing reviewedAt` lists all six current meta teams.
- `Meta team manifests not verified` lists all six current meta teams.
- `Meta team expectedStyles mismatches` is `None`.

- [x] **Step 5: Run tests and commit Task 3**

Run:

```powershell
npm test
npm run lint
git add scripts/validate-data-report.js
git commit -m "feat: report meta team validation warnings"
```

Expected:
- `npm test`: PASS.
- `npm run lint`: PASS.

### Task 4: Final Verification and Integration Readiness

**Files:**
- Modify only files touched in Tasks 1-3 if verification reveals a concrete issue.

- [x] **Step 1: Run full verification**

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
- `npm run validate:data-report`: exits `0` and includes the meta team warning sections.

- [x] **Step 2: Check git status**

Run:

```powershell
git status --short --branch
```

Expected: no unstaged source changes.

- [x] **Step 3: Commit any verification fixes**

If Step 1 required fixes, commit only those fixes:

```powershell
git add src/data/metaTeams.test.js src/data/meta_team_manifest.json scripts/validate-data-report.js
git commit -m "fix: polish meta team validation"
```

If no fixes were needed, do not create an empty commit.

## Self-Review

- Spec coverage: The plan adds strict six-style, duplicate, id/name, existing-style, and element coverage checks plus advisory meta team manifest warnings.
- Placeholder scan: No unresolved placeholders, `TODO`, or vague implementation steps remain.
- Type consistency: Manifest fields are consistently named `expectedStyles`, `sourceUrl`, `reviewStatus`, and `reviewedAt`; report warning keys are consistently `metaTeam...`.
