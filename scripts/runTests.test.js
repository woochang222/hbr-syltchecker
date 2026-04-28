import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { buildNodeTestArgs, collectTestFiles } from './runTests.js'

describe('collectTestFiles', () => {
  it('finds src and scripts test files in stable slash-normalized order', async () => {
    const files = await collectTestFiles(new URL('../', import.meta.url))

    assert(files.includes('src/utils/ownedStatusExport.test.js'))
    assert(files.includes('scripts/styleDraftWorkflow.test.js'))
    assert.deepEqual([...files], [...files].sort())
    assert(files.every(file => file.endsWith('.test.js')))
    assert(files.every(file => file.startsWith('src/') || file.startsWith('scripts/')))
  })
})

describe('buildNodeTestArgs', () => {
  it('omits test isolation for Node versions that do not support it', () => {
    assert.deepEqual(
      buildNodeTestArgs(['src/example.test.js'], { supportsTestIsolation: false }),
      ['--test', 'src/example.test.js']
    )
  })
})
