import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  applyStyleDraft,
  formatJson,
  validateStyleDraft,
  writeJsonFilesSafely
} from './styleDraftWorkflow.js'

const validStyle = {
  id: 'sample_character_new_style',
  character_name: '샘플 캐릭터',
  style_name: '샘플 스타일',
  unit: '31A',
  element: '화',
  elements: ['화'],
  image_url: '/images/styles/sample_character_new_style.webp',
  isLimited: false,
  isResonance: false,
  isUniform: false,
  metaTags: [],
  nicknames: []
}

const validManifestEntry = {
  expectedUnit: '31A',
  expectedElements: ['화'],
  expectedImageUrl: '/images/styles/sample_character_new_style.webp',
  sourceUrl: 'https://game8.jp/heavenburnsred/426190',
  imageStatus: 'verified'
}

const createDraft = (overrides = {}) => ({
  style: {
    ...validStyle,
    ...overrides.style
  },
  manifest: {
    ...validManifestEntry,
    ...overrides.manifest
  }
})

const existingStyles = [
  {
    ...validStyle,
    id: 'existing_style',
    image_url: '/images/styles/existing_style.webp'
  }
]

const existingManifest = {
  existing_style: {
    ...validManifestEntry,
    expectedImageUrl: '/images/styles/existing_style.webp'
  }
}

const existingImages = new Set([
  'public/images/styles/sample_character_new_style.webp'
])

describe('validateStyleDraft', () => {
  it('accepts a valid one-style draft', () => {
    assert.deepEqual(
      validateStyleDraft({
        draft: createDraft(),
        styles: existingStyles,
        manifest: existingManifest,
        imageExists: imagePath => existingImages.has(imagePath)
      }),
      []
    )
  })

  it('accepts optional isLatest when it is a boolean', () => {
    assert.deepEqual(
      validateStyleDraft({
        draft: createDraft({
          style: {
            isLatest: true
          }
        }),
        styles: existingStyles,
        manifest: existingManifest,
        imageExists: imagePath => existingImages.has(imagePath)
      }),
      []
    )
  })

  it('rejects missing isUniform and missing metaTags', () => {
    const styleWithoutRequiredFields = { ...validStyle }
    delete styleWithoutRequiredFields.isUniform
    delete styleWithoutRequiredFields.metaTags
    const errors = validateStyleDraft({
      draft: {
        style: styleWithoutRequiredFields,
        manifest: validManifestEntry
      },
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: imagePath => existingImages.has(imagePath)
    })

    assert.deepEqual(errors, [
      'style.isUniform must be a boolean',
      'style.metaTags must be an array'
    ])
  })

  it('rejects non-string metaTags and non-boolean isLatest when present', () => {
    const errors = validateStyleDraft({
      draft: createDraft({
        style: {
          metaTags: ['화', 31],
          isLatest: 'false'
        }
      }),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: imagePath => existingImages.has(imagePath)
    })

    assert.deepEqual(errors, [
      'style.isLatest must be a boolean when present',
      'style.metaTags must contain only strings'
    ])
  })

  it('rejects duplicate ids in styles and manifest', () => {
    const errors = validateStyleDraft({
      draft: createDraft({
        style: {
          id: 'existing_style',
          image_url: '/images/styles/sample_character_new_style.webp'
        }
      }),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: imagePath => existingImages.has(imagePath)
    })

    assert.deepEqual(errors, [
      'style.id already exists in styles.json: existing_style',
      'style.id already exists in style_manifest.json: existing_style'
    ])
  })

  it('rejects a missing local image file', () => {
    const errors = validateStyleDraft({
      draft: createDraft(),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: () => false
    })

    assert.deepEqual(errors, [
      'style.image_url file does not exist: public/images/styles/sample_character_new_style.webp'
    ])
  })

  it('rejects manifest fields that do not match the style row', () => {
    const errors = validateStyleDraft({
      draft: createDraft({
        manifest: {
          expectedUnit: '31B',
          expectedElements: ['빙'],
          expectedImageUrl: '/images/styles/other.webp'
        }
      }),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: imagePath => existingImages.has(imagePath)
    })

    assert.deepEqual(errors, [
      'manifest.expectedUnit must match style.unit',
      'manifest.expectedElements must match style.elements',
      'manifest.expectedImageUrl must match style.image_url'
    ])
  })

  it('rejects invalid source URL and unverified image status', () => {
    const errors = validateStyleDraft({
      draft: createDraft({
        manifest: {
          sourceUrl: 'https://example.com/heavenburnsred/426190',
          imageStatus: 'needs-review'
        }
      }),
      styles: existingStyles,
      manifest: existingManifest,
      imageExists: imagePath => existingImages.has(imagePath)
    })

    assert.deepEqual(errors, [
      'manifest.sourceUrl must match https://game8.jp/heavenburnsred/<id>',
      'manifest.imageStatus must be verified'
    ])
  })
})

describe('applyStyleDraft', () => {
  it('appends the style and adds a manifest entry keyed by style id', () => {
    const result = applyStyleDraft({
      draft: createDraft(),
      styles: existingStyles,
      manifest: existingManifest
    })

    assert.deepEqual(result.styles.map(style => style.id), [
      'existing_style',
      'sample_character_new_style'
    ])
    assert.deepEqual(result.manifest.sample_character_new_style, validManifestEntry)
    assert.equal(existingStyles.length, 1)
    assert.equal(existingManifest.sample_character_new_style, undefined)
  })

  it('removes previous latest markers when the added draft is latest', () => {
    const result = applyStyleDraft({
      draft: createDraft({
        style: {
          isLatest: true
        }
      }),
      styles: [
        {
          ...validStyle,
          id: 'previous_latest_style',
          image_url: '/images/styles/previous_latest_style.webp',
          isLatest: true
        },
        {
          ...validStyle,
          id: 'older_style',
          image_url: '/images/styles/older_style.webp'
        }
      ],
      manifest: existingManifest
    })

    assert.deepEqual(
      result.styles.map(style => ({ id: style.id, isLatest: style.isLatest })),
      [
        { id: 'previous_latest_style', isLatest: undefined },
        { id: 'older_style', isLatest: undefined },
        { id: 'sample_character_new_style', isLatest: true }
      ]
    )
  })

  it('keeps previous latest markers when the added draft is not latest', () => {
    const result = applyStyleDraft({
      draft: createDraft(),
      styles: [
        {
          ...validStyle,
          id: 'previous_latest_style',
          image_url: '/images/styles/previous_latest_style.webp',
          isLatest: true
        }
      ],
      manifest: existingManifest
    })

    assert.deepEqual(
      result.styles.map(style => ({ id: style.id, isLatest: style.isLatest })),
      [
        { id: 'previous_latest_style', isLatest: true },
        { id: 'sample_character_new_style', isLatest: undefined }
      ]
    )
  })
})

describe('formatJson', () => {
  it('uses two-space JSON and a trailing newline', () => {
    assert.equal(formatJson({ alpha: true }), '{\n  "alpha": true\n}\n')
  })
})

describe('writeJsonFilesSafely', () => {
  it('restores both target files when a later replacement fails', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'style-draft-write-'))
    const stylesPath = join(tempDir, 'styles.json')
    const manifestPath = join(tempDir, 'style_manifest.json')

    writeFileSync(stylesPath, 'original styles\n')
    writeFileSync(manifestPath, 'original manifest\n')

    let failedReplacement = false
    const fsOps = {
      exists: existsSync,
      writeFile: writeFileSync,
      rename: (from, to) => {
        if (
          !failedReplacement &&
          String(from).includes('.tmp') &&
          to === manifestPath
        ) {
          failedReplacement = true
          throw new Error('simulated manifest replacement failure')
        }

        renameSync(from, to)
      },
      remove: unlinkSync
    }

    try {
      assert.throws(
        () => writeJsonFilesSafely({
          files: [
            { path: stylesPath, data: [{ id: 'new_style' }] },
            { path: manifestPath, data: { new_style: { imageStatus: 'verified' } } }
          ],
          fsOps,
          tempSuffix: 'rollback-test'
        }),
        /simulated manifest replacement failure/
      )

      assert.equal(readFileSync(stylesPath, 'utf8'), 'original styles\n')
      assert.equal(readFileSync(manifestPath, 'utf8'), 'original manifest\n')
      assert.deepEqual(readdirSync(tempDir).sort(), [
        'style_manifest.json',
        'styles.json'
      ])
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
