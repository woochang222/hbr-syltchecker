# Local Storage State Design

## Goal

Prevent corrupt or invalid `localStorage` values from crashing the app during initial render.

## Scope

Included:
- Safe JSON localStorage reads for persisted app state.
- Validation before accepting parsed values.
- Cleanup of invalid persisted values when possible.
- Tests for parse failures, validation failures, missing values, and cleanup failure tolerance.
- `App.jsx` usage for owned styles and latest-style highlighting.
- Validation for `viewMode` string values.

Excluded:
- Changing localStorage key names.
- Migrating old storage schemas.
- Adding user-visible error messages.
- Changing write behavior for valid app state.

## Design

Add `src/utils/localStorageState.js` with small, testable helpers:

- `readJsonStorage(storage, key, fallback, isValid)`: reads a JSON string from `storage`, parses it, validates it, and returns either the parsed value or `fallback`.
- `readStringStorage(storage, key, fallback, allowedValues)`: reads a raw string setting and returns it only when it is in `allowedValues`.

When a stored value is malformed or fails validation, the helper should attempt `storage.removeItem(key)` and still return `fallback` if cleanup fails.

`App.jsx` should use the helpers during state initialization:

- `hbr_owned_styles`: fallback `{}`, validator accepts plain objects.
- `hbr_highlight_latest`: fallback `DEFAULT_HIGHLIGHT_LATEST`, validator accepts booleans.
- `hbr_view_mode`: fallback `dim`, allowed values `dim` and `hide`.

## Error Handling

The app should not throw from localStorage read paths when:
- JSON is malformed.
- Parsed JSON has the wrong type.
- `getItem` throws.
- `removeItem` throws during cleanup.

In each case, the initializer returns the configured fallback.

## Testing

Add `src/utils/localStorageState.test.js` covering:
- Valid JSON returns the parsed value.
- Missing JSON returns fallback without cleanup.
- Malformed JSON returns fallback and removes the key.
- Validator failure returns fallback and removes the key.
- Cleanup failure does not throw.
- Valid string storage values are accepted.
- Invalid string storage values fall back and remove the key.

Existing verification remains:

```powershell
npm test
npm run lint
npm run build
npm run validate:data-report
```

## Open Decisions

No open decisions remain. The first version intentionally keeps recovery silent and non-visual.
