# Local Style Reader Implementation Plan

**Goal:** Read style-list screenshots offline on Windows and copy reviewed recognition results into the existing web importer.

**Architecture:** OpenCV detects complete landscape cards and matches their illustration features against the existing catalog. Small digit/icon templates handle limit-break and Daphne markers. A Tkinter desktop UI runs recognition in a worker, shows original crops and editable candidates, and exports only reviewed rows using recognition-import v1. Partial cards and party screens are excluded; conflicting duplicates block export.

**Tech Stack:** Python, OpenCV, Pillow, Tkinter, PyInstaller.

## Tasks
- [x] Probe detection and matching against the four supplied style-list screenshots. Keep user screenshots outside source control; derive only small UI marker templates.
- [x] Implement recognition engine, catalog loading, digit/icon matching, and strict export validation in `local-reader/engine.py` and `local-reader/export.py`.
- [x] Implement batch file selection, clipboard image input, crop preview, editable style/count/Daphne, review selection, progress and error reporting in `local-reader/app.py`.
- [x] Add Windows launch/build scripts and offline usage documentation; package catalog/images with the executable.
- [x] Test conflicts, null values, exports, complete-card detection, resized fixtures, and party rejection. Run screenshot evaluation, UI smoke test, and web payload interoperability checks.

## Acceptance
- No network access during recognition.
- All exported rows must be explicitly reviewed, have a known style ID, and at least one confirmed field. Missing values preserve website state.
- No claims of verified PC layout support without a real PC fixture.
- Source screenshots are test inputs, not bundled personal data.

## Verification Results

- 56 complete cards across four mobile screenshots: expected style and Daphne status matched for all 56. Counts: 46 read, 10 unknown, no incorrect confirmed values on these fixtures.
- The first 16 cards supply digit templates; independent count check on remaining 40 cards: 30 read, 10 unknown.
- Card detection counts survived 0.75/1.25 resize and horizontal padding. Three party screens and a blank image rejected.
- Four export unit tests passed. Tkinter widget selection/edit/review/export/search/exclusion smoke test passed. Desktop payload passed the actual web parser and retained unrelated state.
- Packaged executable self-test loaded 223 catalog entries and references, initialized Tkinter, and recognized all 16 complete cards in the third screenshot.
- Native screen capture was blank in this execution environment; widget behavior and geometry were tested, but a visual screenshot review of the native window was not available.
