import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { collectSourceUrlRecords, validateSourceUrlRecords } from './sourceUrlValidation.js'

describe('source URL validation', () => {
  it('collects style and meta team source URLs', () => {
    const records = collectSourceUrlRecords({
      styleManifest: {
        kayamori_ruka_base: { sourceUrl: 'https://game8.jp/heavenburnsred/426190' }
      },
      metaTeamManifest: {
        best_fire: { sourceUrl: 'https://game8.jp/heavenburnsred/425429' }
      }
    })

    assert.deepEqual(records, [
      {
        id: 'kayamori_ruka_base',
        type: 'style',
        sourceUrl: 'https://game8.jp/heavenburnsred/426190'
      },
      {
        id: 'best_fire',
        type: 'metaTeam',
        sourceUrl: 'https://game8.jp/heavenburnsred/425429'
      }
    ])
  })

  it('flags missing or non-Game8 Heaven Burns Red source URLs', () => {
    const invalidRecords = validateSourceUrlRecords([
      {
        id: 'valid',
        type: 'style',
        sourceUrl: 'https://game8.jp/heavenburnsred/426190'
      },
      {
        id: 'wrong_domain',
        type: 'style',
        sourceUrl: 'https://example.com/heavenburnsred/426190'
      },
      {
        id: 'wrong_path',
        type: 'metaTeam',
        sourceUrl: 'https://game8.jp/other/426190'
      },
      {
        id: 'missing',
        type: 'style'
      }
    ])

    assert.deepEqual(invalidRecords, [
      {
        id: 'wrong_domain',
        type: 'style',
        sourceUrl: 'https://example.com/heavenburnsred/426190'
      },
      {
        id: 'wrong_path',
        type: 'metaTeam',
        sourceUrl: 'https://game8.jp/other/426190'
      },
      {
        id: 'missing',
        type: 'style',
        sourceUrl: null
      }
    ])
  })
})
