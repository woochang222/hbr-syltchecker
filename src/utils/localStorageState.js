export const isPlainObject = value => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const removeInvalidStorageValue = (storage, key) => {
  try {
    storage.removeItem(key)
  } catch {
    // Ignore cleanup failures; callers still get their fallback value.
  }
}

export const readJsonStorage = (storage, key, fallback, isValid) => {
  let rawValue

  try {
    rawValue = storage.getItem(key)
  } catch {
    return fallback
  }

  if (rawValue === null) {
    return fallback
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    if (isValid(parsedValue)) {
      return parsedValue
    }
  } catch {
    removeInvalidStorageValue(storage, key)
    return fallback
  }

  removeInvalidStorageValue(storage, key)
  return fallback
}

export const readStringStorage = (storage, key, fallback, allowedValues) => {
  let value

  try {
    value = storage.getItem(key)
  } catch {
    return fallback
  }

  if (value === null) {
    return fallback
  }

  if (allowedValues.includes(value)) {
    return value
  }

  removeInvalidStorageValue(storage, key)
  return fallback
}
