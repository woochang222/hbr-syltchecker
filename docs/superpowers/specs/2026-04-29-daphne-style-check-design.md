# Daphne Style Check Design

## Goal

Add a per-style Daphne item check to the HBR style checker. Daphne is an item that raises a character's stats, but in this app it is tracked per style. Each style can have at most one Daphne applied.

## Decisions

- Daphne state is tracked per style, not per character.
- A style either has Daphne or does not. There is no Daphne count above one.
- Daphne state is independent from owned/limit-break state.
- Normal card click keeps the existing owned/limit-break cycle.
- Right-click and mobile long-press toggle Daphne for the clicked style.
- Applied Daphne is shown with a small Daphne image badge near the lower-middle area of the card, avoiding existing badges and border effects.
- Daphne status participates in filtering, summary counts, and PNG export.

## State And Storage

Add a new `daphneStyles` state object:

```js
{
  [styleId]: true
}
```

The localStorage key is:

```text
hbr_daphne_styles
```

When a style is toggled on, set `daphneStyles[styleId] = true`. When toggled off, delete the key. This keeps the state compact and preserves the invariant that a style can only have one Daphne.

The existing `hbr_owned_styles` format is unchanged. No migration is needed because Daphne is stored separately from ownership.

## Card Interaction

`StyleCard` keeps the current click behavior:

- `click`: cycle owned/limit-break state.
- `contextmenu`: prevent the browser context menu and toggle Daphne.
- `long-press`: toggle Daphne on touch devices.

Long-press must not also trigger the normal click cycle. The implementation should suppress the follow-up click after a successful long-press Daphne toggle.

## Card Display

When a style has Daphne, show the Daphne image as a small badge near the lower-middle area of the card. The badge should not overlap:

- the existing limit-break badge,
- the latest badge,
- meta/latest/base-boost border effects,
- the main style image enough to obscure recognition.

The badge uses the Daphne image supplied by the user:

```text
https://img.game8.jp/9964740/e31a8b2432a406c337833dad73728fa6.png/show
```

For production stability, the implementation should prefer a local public asset copied from that image rather than loading it from Game8 at runtime.

## Filtering

Extend `filters` with a Daphne status selection.

Default behavior shows all styles regardless of Daphne status. The filter supports:

- Daphne applied
- Daphne not applied

If neither status is selected, Daphne does not filter results. If both statuses are selected, the result is equivalent to all styles and the filter summary should omit a Daphne label.

If exactly one status is selected, filtering narrows styles accordingly and the filter summary shows:

- `다프네 적용`
- `다프네 미적용`

## Summaries

Add a Daphne count to the app summaries:

- Stats dashboard: show Daphne applied count against total styles.
- Sticky summary: add a compact `다프네 N` chip.

Daphne count is independent from owned count. A style can be unowned and still have Daphne checked unless a later product decision forbids it.

## PNG Export

The owned status PNG export includes Daphne state:

- Export tiles with Daphne show the same lower-middle badge.
- The PNG header summary includes the Daphne applied count.
- Export grouping remains by unit and character.

The export helper should include `hasDaphne` in each export style object so the board component stays presentational.

## Testing

Add focused tests for the data and filtering behavior:

- Daphne state helper validates and normalizes plain object storage.
- Daphne toggle helper adds and removes style IDs while preserving the one-Daphne-per-style invariant.
- Filter matching handles default, applied-only, and unapplied-only Daphne filters.
- Filter summary labels only show Daphne status when exactly one Daphne status is selected.
- Export grouping includes `hasDaphne` and computes the Daphne count used by summaries.

Run verification after implementation:

```powershell
npm test
npm run lint
npm run build
git diff --check
```

Manual verification:

- Normal card click still changes only owned/limit-break state.
- Right-click toggles Daphne without opening the browser context menu.
- Long-press toggles Daphne without also changing owned/limit-break state.
- Daphne applied and unapplied filters narrow the grid correctly.
- Sticky summary, stats dashboard, and PNG export show Daphne counts.
- PNG export renders the Daphne badge on applied styles.

## Out Of Scope

- Character-level Daphne tracking.
- Daphne counts above one per style.
- Changing the existing owned/limit-break storage format.
- Blocking Daphne on unowned styles.
