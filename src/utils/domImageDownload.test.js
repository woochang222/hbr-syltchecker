import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { copyBlobToClipboard } from './domImageDownload.js'

describe('copyBlobToClipboard', () => {
  it('writes a png blob to the clipboard as a ClipboardItem', async () => {
    const writes = []
    class ClipboardItemStub {
      constructor(items) {
        this.items = items
      }
    }
    const clipboard = {
      write: async items => writes.push(items)
    }
    const blob = { type: 'image/png' }

    await copyBlobToClipboard(blob, { clipboard, ClipboardItemCtor: ClipboardItemStub })

    assert.equal(writes.length, 1)
    assert.equal(writes[0].length, 1)
    assert.equal(writes[0][0].items['image/png'], blob)
  })

  it('rejects when image clipboard writing is unavailable', async () => {
    await assert.rejects(
      copyBlobToClipboard({ type: 'image/png' }, { clipboard: null, ClipboardItemCtor: null }),
      /Clipboard image copy is not supported/
    )
  })
})
