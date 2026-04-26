import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  applyStyleDraft,
  formatJson,
  validateStyleDraft
} from './styleDraftWorkflow.js'

const validStyle = {
  id: 'sample_character_new_style',
  character_name: '샘플 캐릭터',
  style_name: '샘플 스타일',
  unit: '31A',
  element: '화',
  elements: ['화'],
  tier: 0,
  image_url: '/images/styles/sample_character_new_style.webp',
  isLimited: false,
  isResonance: false,
  isLatest: false,
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
})

describe('formatJson', () => {
  it('uses two-space JSON and a trailing newline', () => {
    assert.equal(formatJson({ alpha: true }), '{\n  "alpha": true\n}\n')
  })
})
