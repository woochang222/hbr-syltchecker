import {
  existsSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GAME8_SOURCE_URL_PATTERN = /^https:\/\/game8\.jp\/heavenburnsred\/\d+$/
const STYLE_IMAGE_PREFIX = '/images/styles/'

export const readJsonFile = filePath => {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`Unable to read JSON file ${filePath}: ${error.message}`)
  }
}

const isPlainObject = value => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const addRequiredStringError = (errors, object, fieldName, label) => {
  if (typeof object[fieldName] !== 'string' || object[fieldName].trim() === '') {
    errors.push(`${label}.${fieldName} must be a non-empty string`)
  }
}

const addRequiredBooleanError = (errors, object, fieldName, label) => {
  if (typeof object[fieldName] !== 'boolean') {
    errors.push(`${label}.${fieldName} must be a boolean`)
  }
}

const addOptionalBooleanError = (errors, object, fieldName, label) => {
  if (object[fieldName] !== undefined && typeof object[fieldName] !== 'boolean') {
    errors.push(`${label}.${fieldName} must be a boolean when present`)
  }
}

const toPublicImagePath = imageUrl => {
  return `public${imageUrl}`
}

export const validateStyleDraft = ({
  draft,
  styles,
  manifest,
  imageExists
}) => {
  const errors = []

  if (!isPlainObject(draft)) {
    return ['draft must be a JSON object']
  }

  if (!isPlainObject(draft.style)) {
    errors.push('draft.style must be an object')
  }

  if (!isPlainObject(draft.manifest)) {
    errors.push('draft.manifest must be an object')
  }

  if (errors.length > 0) return errors

  const { style, manifest: manifestEntry } = draft

  addRequiredStringError(errors, style, 'id', 'style')
  addRequiredStringError(errors, style, 'character_name', 'style')
  addRequiredStringError(errors, style, 'style_name', 'style')
  addRequiredStringError(errors, style, 'unit', 'style')
  addRequiredStringError(errors, style, 'element', 'style')
  addRequiredStringError(errors, style, 'image_url', 'style')
  addRequiredBooleanError(errors, style, 'isLimited', 'style')
  addRequiredBooleanError(errors, style, 'isResonance', 'style')
  addRequiredBooleanError(errors, style, 'isUniform', 'style')
  addOptionalBooleanError(errors, style, 'isLatest', 'style')

  if (!Array.isArray(style.elements) || style.elements.length === 0) {
    errors.push('style.elements must be a non-empty array')
  } else if (style.elements.some(element => typeof element !== 'string' || element.trim() === '')) {
    errors.push('style.elements must contain only non-empty strings')
  }

  if (!Array.isArray(style.metaTags)) {
    errors.push('style.metaTags must be an array')
  } else if (style.metaTags.some(metaTag => typeof metaTag !== 'string')) {
    errors.push('style.metaTags must contain only strings')
  }

  if (!Array.isArray(style.nicknames)) {
    errors.push('style.nicknames must be an array')
  } else if (style.nicknames.some(nickname => typeof nickname !== 'string')) {
    errors.push('style.nicknames must contain only strings')
  }

  if (typeof style.id === 'string') {
    if (styles.some(existingStyle => existingStyle.id === style.id)) {
      errors.push(`style.id already exists in styles.json: ${style.id}`)
    }

    if (Object.hasOwn(manifest, style.id)) {
      errors.push(`style.id already exists in style_manifest.json: ${style.id}`)
    }
  }

  if (typeof style.image_url === 'string') {
    if (!style.image_url.startsWith(STYLE_IMAGE_PREFIX)) {
      errors.push('style.image_url must start with /images/styles/')
    } else if (!imageExists(toPublicImagePath(style.image_url))) {
      errors.push(`style.image_url file does not exist: ${toPublicImagePath(style.image_url)}`)
    }
  }

  if (Array.isArray(style.elements) && style.elements.length > 0 && style.element !== style.elements[0]) {
    errors.push('style.element must match style.elements[0]')
  }

  if (manifestEntry.expectedUnit !== style.unit) {
    errors.push('manifest.expectedUnit must match style.unit')
  }

  if (JSON.stringify(manifestEntry.expectedElements) !== JSON.stringify(style.elements)) {
    errors.push('manifest.expectedElements must match style.elements')
  }

  if (manifestEntry.expectedImageUrl !== style.image_url) {
    errors.push('manifest.expectedImageUrl must match style.image_url')
  }

  if (!GAME8_SOURCE_URL_PATTERN.test(manifestEntry.sourceUrl || '')) {
    errors.push('manifest.sourceUrl must match https://game8.jp/heavenburnsred/<id>')
  }

  if (manifestEntry.imageStatus !== 'verified') {
    errors.push('manifest.imageStatus must be verified')
  }

  return errors
}

const removeLatestMarker = style => {
  const { isLatest: _isLatest, ...styleWithoutLatest } = style
  return styleWithoutLatest
}

export const applyStyleDraft = ({ draft, styles, manifest }) => ({
  styles: [
    ...(draft.style.isLatest === true ? styles.map(removeLatestMarker) : styles),
    draft.style
  ],
  manifest: {
    ...manifest,
    [draft.style.id]: draft.manifest
  }
})

export const formatJson = data => `${JSON.stringify(data, null, 2)}\n`

const defaultFsOps = {
  exists: existsSync,
  writeFile: writeFileSync,
  rename: renameSync,
  remove: unlinkSync
}

const toFileSystemPath = filePath => {
  return filePath instanceof URL ? fileURLToPath(filePath) : filePath
}

const removeIfExists = (fsOps, filePath) => {
  if (fsOps.exists(filePath)) {
    fsOps.remove(filePath)
  }
}

const createPreparedFile = ({ path, data }, tempSuffix, index) => {
  const targetPath = toFileSystemPath(path)
  const targetName = basename(targetPath)
  const targetDir = dirname(targetPath)

  return {
    targetPath,
    tempPath: join(targetDir, `.${targetName}.${tempSuffix}.${index}.tmp`),
    backupPath: join(targetDir, `.${targetName}.${tempSuffix}.${index}.bak`),
    contents: formatJson(data),
    backupCreated: false,
    replaced: false
  }
}

const rollbackPreparedFiles = (preparedFiles, fsOps) => {
  for (const preparedFile of preparedFiles.toReversed()) {
    if (preparedFile.replaced) {
      removeIfExists(fsOps, preparedFile.targetPath)
    }

    if (preparedFile.backupCreated && fsOps.exists(preparedFile.backupPath)) {
      fsOps.rename(preparedFile.backupPath, preparedFile.targetPath)
    }
  }
}

export const writeJsonFilesSafely = ({
  files,
  fsOps = defaultFsOps,
  tempSuffix = `${process.pid}-${Date.now()}`
}) => {
  const preparedFiles = files.map((file, index) => {
    return createPreparedFile(file, tempSuffix, index)
  })

  try {
    for (const preparedFile of preparedFiles) {
      fsOps.writeFile(preparedFile.tempPath, preparedFile.contents)
    }
  } catch (error) {
    for (const preparedFile of preparedFiles) {
      removeIfExists(fsOps, preparedFile.tempPath)
    }

    throw error
  }

  let replacementsCompleted = false

  try {
    for (const preparedFile of preparedFiles) {
      if (fsOps.exists(preparedFile.targetPath)) {
        fsOps.rename(preparedFile.targetPath, preparedFile.backupPath)
        preparedFile.backupCreated = true
      }

      fsOps.rename(preparedFile.tempPath, preparedFile.targetPath)
      preparedFile.replaced = true
    }

    replacementsCompleted = true
  } catch (error) {
    rollbackPreparedFiles(preparedFiles, fsOps)
    throw error
  } finally {
    for (const preparedFile of preparedFiles) {
      removeIfExists(fsOps, preparedFile.tempPath)

      if (replacementsCompleted) {
        removeIfExists(fsOps, preparedFile.backupPath)
      }
    }
  }
}
