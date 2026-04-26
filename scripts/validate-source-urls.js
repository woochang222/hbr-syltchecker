import { readFileSync } from 'node:fs'
import { collectSourceUrlRecords, validateSourceUrlRecords } from '../src/utils/sourceUrlValidation.js'

const styleManifest = JSON.parse(readFileSync(new URL('../src/data/style_manifest.json', import.meta.url), 'utf8'))
const metaTeamManifest = JSON.parse(readFileSync(new URL('../src/data/meta_team_manifest.json', import.meta.url), 'utf8'))

const REQUEST_TIMEOUT_MS = 10_000
const CONCURRENCY = 8

const records = collectSourceUrlRecords({ styleManifest, metaTeamManifest })
const shapeFailures = validateSourceUrlRecords(records)

const uniqueRecordsByUrl = new Map()
for (const record of records) {
  if (record.sourceUrl && !uniqueRecordsByUrl.has(record.sourceUrl)) {
    uniqueRecordsByUrl.set(record.sourceUrl, record)
  }
}

const checkUrl = async record => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(record.sourceUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'hbr-syltchecker-source-url-validator/1.0'
      }
    })

    return {
      ...record,
      ok: response.status >= 200 && response.status < 400,
      status: response.status
    }
  } catch (error) {
    return {
      ...record,
      ok: false,
      status: 'request_failed',
      error: error.name === 'AbortError' ? 'timeout' : error.message
    }
  } finally {
    clearTimeout(timeout)
  }
}

const checkInBatches = async uniqueRecords => {
  const results = []

  for (let index = 0; index < uniqueRecords.length; index += CONCURRENCY) {
    const batch = uniqueRecords.slice(index, index + CONCURRENCY)
    results.push(...await Promise.all(batch.map(checkUrl)))
  }

  return results
}

const printFailures = (title, failures) => {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))

  if (failures.length === 0) {
    console.log('None')
    return
  }

  for (const failure of failures) {
    console.log(`- ${JSON.stringify(failure)}`)
  }
}

console.log('Source URL validation report')
console.log(`Checking ${uniqueRecordsByUrl.size} unique URLs from ${records.length} manifest entries.`)

const networkResults = await checkInBatches([...uniqueRecordsByUrl.values()])
const networkFailures = networkResults
  .filter(result => !result.ok)
  .map(({ id, type, sourceUrl, status, error }) => ({ id, type, sourceUrl, status, error }))

printFailures('Invalid source URL shapes', shapeFailures)
printFailures('Unreachable source URLs', networkFailures)

if (shapeFailures.length > 0 || networkFailures.length > 0) {
  process.exitCode = 1
}
