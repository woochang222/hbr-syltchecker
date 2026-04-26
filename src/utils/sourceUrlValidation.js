const GAME8_SOURCE_URL_PATTERN = /^https:\/\/game8\.jp\/heavenburnsred\/\d+$/

export const collectSourceUrlRecords = ({ styleManifest, metaTeamManifest }) => [
  ...Object.entries(styleManifest).map(([id, entry]) => ({
    id,
    type: 'style',
    sourceUrl: entry.sourceUrl
  })),
  ...Object.entries(metaTeamManifest).map(([id, entry]) => ({
    id,
    type: 'metaTeam',
    sourceUrl: entry.sourceUrl
  }))
]

export const validateSourceUrlRecords = records => records
  .filter(record => !GAME8_SOURCE_URL_PATTERN.test(record.sourceUrl || ''))
  .map(record => ({
    id: record.id,
    type: record.type,
    sourceUrl: record.sourceUrl || null
  }))
