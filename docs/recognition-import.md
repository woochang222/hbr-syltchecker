# Recognition import v1

The local screenshot reader exports UTF-8 JSON. The website previews and merges it into the current browser's localStorage. No server upload occurs.

```json
{
  "format": "hbr-style-recognition",
  "version": 1,
  "styles": [
    { "id": "kayamori_ruka_base", "limitBreak": 2, "daphne": true }
  ]
}
```

- `id`: exact ID from `src/data/styles.json`.
- `limitBreak`: integer 0 through 4. Omit or use null when unreadable.
- `daphne`: true or false only when positively determined. Omit or use null when unreadable.
- Missing fields and styles preserve existing data. Zero means owned with no limit breaks.
- Unknown IDs, invalid values, unsupported versions, and conflicting duplicates reject the entire import.
- The producer must exclude uncertain guesses and incomplete cards. This payload is for confirmed results, not raw recognition candidates.
- Only style-list screenshots are in scope. Party and support recognition are excluded.
