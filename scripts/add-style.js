import { existsSync, writeFileSync } from 'node:fs'
import {
  applyStyleDraft,
  formatJson,
  readJsonFile,
  validateStyleDraft
} from './styleDraftWorkflow.js'

const draftPath = process.argv[2]

const stylesPath = new URL('../src/data/styles.json', import.meta.url)
const manifestPath = new URL('../src/data/style_manifest.json', import.meta.url)

const printUsage = () => {
  console.error('Usage: npm run add:style -- path/to/style-draft.json')
}

if (!draftPath) {
  printUsage()
  process.exitCode = 1
} else {
  try {
    const draft = readJsonFile(draftPath)
    const styles = readJsonFile(stylesPath)
    const manifest = readJsonFile(manifestPath)

    const styleId = draft?.style?.id || '(unknown style id)'
    const errors = validateStyleDraft({
      draft,
      styles,
      manifest,
      imageExists: imagePath => existsSync(new URL(`../${imagePath}`, import.meta.url))
    })

    if (errors.length > 0) {
      console.error(`Cannot add style ${styleId}:`)
      for (const error of errors) {
        console.error(`- ${error}`)
      }
      process.exitCode = 1
    } else {
      const updated = applyStyleDraft({ draft, styles, manifest })
      writeFileSync(stylesPath, formatJson(updated.styles))
      writeFileSync(manifestPath, formatJson(updated.manifest))

      console.log(`Added style ${draft.style.id}`)
      console.log('Updated src/data/styles.json')
      console.log('Updated src/data/style_manifest.json')
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
