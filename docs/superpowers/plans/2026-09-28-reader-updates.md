# Local Reader Data Updates

## Scope

Use the downloaded game Select cards and add an explicit GitHub data-update action to the offline reader. Do not add party recognition, upload screenshots, or directly modify browser storage.

## Completed Implementation

- [x] Match 223 source cards one-to-one to the web style catalog. Require strong feature matches and reject duplicate mappings; verify source-character consistency. Persist stable mappings for future maintainer review.
- [x] Publish a catalog containing Korean labels, local IDs, game IDs, image paths and SHA-256 checksums. Reject missing mappings and changed image hashes when building the catalog.
- [x] Use landscape reference images without square distortion. Preserve existing digit and Daphne handling.
- [x] Download only new/changed images on explicit button click. Reuse verified bundled or cached images.
- [x] Validate all data before atomically activating the new catalog. Store cache under LOCALAPPDATA; retain previous catalog on failure/cancel and fall back to bundled data for corrupted cache.
- [x] Wire background update progress/success/failure into the native UI and reset the recognizer after successful updates.
- [x] Verify published endpoint and packaged executable; distribute updated ZIP.

## Verification

Tests cover metadata validation, first download, no-change update, one new file, bundled reuse, connection/hash/image failures, cancellation before and after files, corrupt cache recovery, and offline fallback. UI tests cover new-catalog activation and failed updates. Screenshot evaluation retains the original 56 expected style matches and 46 confirmed limit-break values; 10 remain unknown. These figures are fixture results, not general accuracy guarantees.

Published GitHub endpoint smoke test passed: 223 bundled files reused, one deliberately missing cached image downloaded alone, then zero image downloads on the next check. The cached catalog initialized all 223 recognition references offline. Updated packaged executable loaded 223 game-card references and recognized all 16 complete cards in the test screenshot. Export/updater unit tests: 13 passed. Native widget smoke test and ESLint passed.
