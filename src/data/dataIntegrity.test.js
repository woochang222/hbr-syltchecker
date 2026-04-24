import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('./styles.json', import.meta.url), 'utf8'))

describe('style data integrity', () => {
  it('uses unique style ids', () => {
    const ids = styles.map(style => style.id)
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)

    assert.deepEqual(duplicateIds, [])
  })

  it('uses one local image file per style entry', () => {
    const imageUrls = styles.map(style => style.image_url)
    const duplicateImageUrls = imageUrls.filter((url, index) => imageUrls.indexOf(url) !== index)

    assert.deepEqual(duplicateImageUrls, [])
  })

  it('has no missing or unreferenced style image files', () => {
    const imageUrls = new Set(styles.map(style => style.image_url))
    const missingFiles = [...imageUrls]
      .filter(url => !existsSync(new URL(`../../public${url}`, import.meta.url)))

    const referencedFileNames = new Set([...imageUrls].map(url => url.split('/').at(-1)))
    const imageFiles = readdirSync(new URL('../../public/images/styles', import.meta.url))
      .filter(file => file.endsWith('.webp'))
    const unreferencedFiles = imageFiles.filter(file => !referencedFileNames.has(file))

    assert.deepEqual({ missingFiles, unreferencedFiles }, { missingFiles: [], unreferencedFiles: [] })
  })

  it('restores the missing Ogasawara Hisame styles that replaced duplicate Tezuka rows', () => {
    const styleMap = new Map(styles.map(style => [style.id, style]))

    assert.deepEqual(
      [
        styleMap.get('ogasawara_hisame_cat_ears'),
        styleMap.get('ogasawara_hisame_initial'),
        styleMap.get('ogasawara_hisame_base')
      ].map(style => ({
        id: style?.id,
        character_name: style?.character_name,
        unit: style?.unit,
        image_url: style?.image_url
      })),
      [
        {
          id: 'ogasawara_hisame_cat_ears',
          character_name: '오가사와라 히사메',
          unit: '30G',
          image_url: '/images/styles/ogasawara_hisame_cat_ears.webp'
        },
        {
          id: 'ogasawara_hisame_initial',
          character_name: '오가사와라 히사메',
          unit: '30G',
          image_url: '/images/styles/ogasawara_hisame_initial.webp'
        },
        {
          id: 'ogasawara_hisame_base',
          character_name: '오가사와라 히사메',
          unit: '30G',
          image_url: '/images/styles/ogasawara_hisame_base.webp'
        }
      ]
    )
  })
})
