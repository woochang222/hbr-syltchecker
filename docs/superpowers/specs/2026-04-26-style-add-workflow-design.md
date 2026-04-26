# Style Add Workflow Design

## Goal

Reduce mistakes when adding a new style by making `styles.json` and `style_manifest.json` update together through one repeatable command.

The workflow should keep image acquisition and source review human-controlled, while automating deterministic JSON edits and validation checks.

## Scope

Included:
- A draft JSON input format for one new style.
- A Node CLI script that validates the draft.
- Automatic updates to `src/data/styles.json`.
- Automatic updates to `src/data/style_manifest.json`.
- Checks that the referenced local image file already exists.
- Tests for the reusable validation and merge helpers.
- README usage notes.

Excluded:
- Downloading images from the network.
- Copying or transforming image files.
- Scraping Game8 or other source pages.
- Updating `meta_teams.json`.
- Multi-style batch import in the first version.
- Interactive prompts.

## User Workflow

1. Add the local image file under `public/images/styles/`.
2. Create a draft JSON file from `scripts/style-draft.example.json`.
3. Run:

```powershell
npm run add:style -- path/to/style-draft.json
```

4. Run verification:

```powershell
npm test
npm run lint
npm run validate:data-report
```

5. Run `npm run validate:source-urls` when network access is available and source URL reachability matters.

## Draft Format

The draft file contains one `style` object and one `manifest` object:

```json
{
  "style": {
    "id": "sample_character_new_style",
    "character_name": "샘플 캐릭터",
    "style_name": "샘플 스타일",
    "unit": "31A",
    "element": "화",
    "elements": ["화"],
    "image_url": "/images/styles/sample_character_new_style.webp",
    "isLimited": false,
    "isResonance": false,
    "isUniform": false,
    "metaTags": [],
    "nicknames": []
  },
  "manifest": {
    "expectedUnit": "31A",
    "expectedElements": ["화"],
    "expectedImageUrl": "/images/styles/sample_character_new_style.webp",
    "sourceUrl": "https://game8.jp/heavenburnsred/426190",
    "imageStatus": "verified"
  }
}
```

The `manifest` object is written under the key `style.id` in `style_manifest.json`; the draft does not repeat that key.

## Validation Rules

The command fails without writing files when:
- The draft is not valid JSON.
- `style` or `manifest` is missing.
- `style.id` already exists in `styles.json`.
- `style.id` already exists in `style_manifest.json`.
- Required style fields are missing or have the wrong type.
- `style.image_url` does not start with `/images/styles/`.
- The referenced image file does not exist under `public/`.
- `style.element` does not equal `style.elements[0]`.
- `style.elements` is empty.
- `style.isUniform` is missing or is not a boolean.
- `style.metaTags` is missing or contains non-string values.
- `style.isLatest` is present and is not a boolean.
- `manifest.expectedUnit` does not equal `style.unit`.
- `manifest.expectedElements` does not equal `style.elements`.
- `manifest.expectedImageUrl` does not equal `style.image_url`.
- `manifest.sourceUrl` is not a Game8 Heaven Burns Red URL.
- `manifest.imageStatus` is not `verified`.

The first version requires `imageStatus: "verified"` because `npm run validate:data-report` currently fails on any warning section. This keeps the add workflow aligned with the repository's strict validation posture.

## Architecture

Add reusable helper functions in `scripts/styleDraftWorkflow.js`:
- `readJsonFile(path)`: reads and parses JSON with useful error messages.
- `validateStyleDraft({ draft, styles, manifest, imageExists })`: returns a list of validation errors.
- `applyStyleDraft({ draft, styles, manifest })`: returns updated in-memory data.
- `formatJson(data)`: serializes JSON using two-space indentation and a trailing newline.
- `writeJsonFilesSafely({ files })`: serializes both JSON payloads, writes both temp files, then replaces both targets with backup/rollback behavior.

Add a CLI wrapper in `scripts/add-style.js`:
- Parses the draft path from `process.argv`.
- Loads `styles.json` and `style_manifest.json`.
- Calls the helper validation.
- Prints grouped validation errors and exits nonzero if invalid.
- Writes both JSON files only after all validation passes, using temp files and rollback backups so a later replacement failure restores earlier targets.
- Prints the added style id and the files updated.

The helper module keeps most behavior testable without spawning a child process. The CLI remains thin and focused on file IO.

## File Layout

Add:
- `scripts/add-style.js`
- `scripts/styleDraftWorkflow.js`
- `scripts/styleDraftWorkflow.test.js`
- `scripts/style-draft.example.json`

Modify:
- `package.json` to add `add:style`.
- `README.md` to document the workflow.

## Data Flow

1. User supplies a draft path.
2. CLI loads the draft, current styles, and current manifest.
3. Validation checks the draft against current data and the local image file.
4. If validation fails, no files are written.
5. If validation passes, the style is appended to `styles.json`.
6. The manifest entry is added to `style_manifest.json` under `style.id`.
7. Both files are serialized, written to temp files, and then replaced with rollback backups.

## Error Handling

The command should print concise, actionable errors, for example:

```text
Cannot add style sample_character_new_style:
- style.image_url file does not exist: public/images/styles/sample_character_new_style.webp
- manifest.sourceUrl must match https://game8.jp/heavenburnsred/<id>
```

The command exits with code `1` for validation failures, malformed JSON, unreadable input files, or write failures.

## Testing

Unit tests should cover:
- Valid draft produces updated `styles` and `manifest` data.
- Duplicate style id fails.
- Missing image file fails.
- Manifest/style field mismatch fails.
- Invalid source URL fails.
- Non-verified image status fails.
- Missing `isUniform`, missing or invalid `metaTags`, and invalid optional `isLatest` fail.
- Paired JSON writes restore both targets when a later replacement fails.
- Formatting keeps two-space JSON and a trailing newline.

Integration-level verification after implementation:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
```

`npm run validate:source-urls` is useful but requires network access, so it should remain a manual verification step rather than part of the local deterministic test suite.

## Open Decisions

No open decisions remain for the first version. Batch import, image copying, and interactive prompts are intentionally deferred.
