# Sticky Ownership Summary Design

## Goal

Let users confirm their total owned style count while scrolling through the style grid.

## Scope

Included:
- A compact sticky summary bar above the style grid.
- Display of total owned styles, total styles, ownership percentage, and currently matching style count.
- Desktop and mobile styling that keeps the summary readable without covering style cards.
- Reuse of existing ownership and filter count calculations in `App.jsx`.

Excluded:
- Changing how ownership is counted.
- Changing the existing stats dashboard.
- Adding new filters or sort behavior.
- Persisting any new state.

## Design

Add a small `OwnershipStickySummary` component that receives:

- `totalOwned`
- `totalStyles`
- `ownershipRate`
- `visibleStyleCount`

`App.jsx` already calculates these values, so the feature should pass them to the component directly. The component should render a concise label such as:

```text
보유 84 / 212 · 39%
표시 120
```

The component should be placed after the existing stats dashboard and before `<main className="style-list">`. This keeps the summary visually tied to the list and makes `position: sticky` behave naturally as the user scrolls into the card grid.

## Layout

The sticky bar should:

- Use `position: sticky` with `top: 0`.
- Use a z-index lower than the filter drawer overlay.
- Use the existing dark surface, yellow highlight, and compact chip styling already present in the app.
- Stay one line on desktop.
- Compress spacing and typography on narrow screens.

The bar should not cover cards unexpectedly because it remains in normal document flow before becoming sticky.

## Error Handling

No new error paths are expected. If counts are zero, the component should still render a stable summary:

```text
보유 0 / 0 · 0%
표시 0
```

## Testing

Add a focused utility test only if new count formatting logic is extracted. If the component remains presentational and `App.jsx` continues to own the existing count calculations, automated verification should rely on:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
```

## Open Decisions

No open decisions remain. The selected approach is a sticky top summary bar rather than a floating badge or sticky full header.
