# Owned Status Screenshot Download Design

## Goal

Let users download a PNG image of their full owned-style status for sharing or personal record keeping.

## Scope

Included:
- A PNG download button in the stats dashboard area.
- A download-only board that includes every style, independent of current filters, search, scroll position, and view mode.
- Unit and character grouping in the generated image.
- Style cards that show only the style image and ownership step badge.
- Unowned styles shown in grayscale/dimmed state.
- 0-break styles treated as owned and highlighted with a `0` badge, matching current app ownership counting.
- A fixed-width, single long PNG.
- Minimal image header with title, generated date, owned count, total count, and ownership rate.
- GitHub Pages compatibility with static client-side generation only.

Excluded:
- JSON export or import.
- Multiple PNG files split by unit.
- Current-filter-only exports.
- User-selectable export layouts or image sizes.
- Server-side rendering, server APIs, or backend image generation.
- Adding character or style names inside each card in the first version.

## User Flow

1. User clicks a `보유현황 PNG` button in the stats dashboard area.
2. The app renders a fixed-width download-only board off the normal visual path.
3. The app waits for all board images to finish loading.
4. The app converts the board DOM to a PNG.
5. The app downloads the file as `hbr-owned-status-YYYY-MM-DD.png`.

If image generation fails, the app should keep the current page usable and show a short failure state on the button or nearby status text.

## Architecture

Use a client-side DOM-to-PNG library such as `html-to-image`. This keeps the feature compatible with GitHub Pages because all work happens in the browser and no server endpoint is required.

Add a download-only React component named `OwnedStatusDownloadBoard` that receives:

- Sorted full style data.
- Current `ownedStyles`.
- Total owned count.
- Total style count.
- Ownership rate.
- Generated date string.

The board should not use `filteredStyles` or `renderableStyles`. It should use the full sorted `styles` array so the output is stable and independent of the active UI filters.

`App.jsx` should own the download action because it already owns the source state and derived counts. The download handler should:

- Render the board in the DOM.
- Wait until the board is ready.
- Wait for all images inside the board to load or fail.
- Call the DOM-to-PNG library.
- Trigger a browser download through an object URL or data URL.
- Clean up transient download state.

## Data and Grouping

The output groups styles by:

1. Unit.
2. Character within each unit.
3. Existing style order within each character.

The first implementation should reuse the current sorted style order from `sortStylesByOfficialOrder(stylesData)` and derive group boundaries from `unit` and `character_name`. It should not introduce a separate custom order.

Ownership state follows the existing app convention:

- `undefined`: unowned.
- `0`, `1`, `2`, `3`, `4`: owned, with the number shown as the badge.

`0` must count and render as owned because the main app already treats any defined ownership value as owned.

## Image URL Handling

The download board must resolve local style images with `import.meta.env.BASE_URL`, matching `StyleCard`. This is required for GitHub Pages where the app is hosted under `/hbr-syltchecker/`.

External image URLs are not in scope for the first version. The existing validation requires local image files for the style data, which avoids cross-origin canvas tainting problems during DOM-to-PNG generation.

## Layout

Use a fixed export width, initially `1200px`.

The PNG should contain:

- Header title: `헤번레 보유현황`.
- Generated date.
- Summary chips or compact stat blocks:
  - Owned count / total count.
  - Ownership rate.
- Unit sections.
- Character rows or groups.
- Compact style image tiles with ownership badges.

Unowned tiles should be grayscale and dimmed. Owned tiles should retain color and use the existing ownership step visual language where practical.

The generated image may be long. The first version downloads one PNG rather than splitting by unit.

## UI Placement

Place the download button in the stats dashboard area near the existing overall ownership rate. This keeps the action close to the data it exports and avoids mixing export behavior into the filter drawer.

The button should have clear loading and disabled states while image generation is running. It should not block normal ownership toggling outside the short generation window.

## Error Handling

Handle these cases:

- DOM-to-PNG generation failure.
- Missing image load completion.
- Browser download limitations.

The app should surface a short Korean message such as `이미지 생성에 실패했습니다` and leave the current owned state unchanged.

If a browser opens the PNG instead of downloading it, that is acceptable for the first version as long as the generated image is available to the user.

## Testing

Add focused unit tests for pure helpers if grouping or filename/date formatting is extracted.

Verification should include:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
```

Manual or browser verification should confirm:

- The button appears in the stats dashboard area.
- Clicking the button creates a PNG download.
- The PNG includes all styles, regardless of active filters.
- The PNG works under the configured Vite base path used by GitHub Pages.
- 0-break styles render as owned with a `0` badge.
- Unowned styles render dimmed/grayscale.

## Open Decisions

No open decisions remain. The selected design is a GitHub Pages-compatible client-side PNG export using a hidden fixed-width DOM board and a DOM-to-PNG library.
