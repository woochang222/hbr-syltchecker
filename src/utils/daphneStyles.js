export const DAPHNE_STATUS_APPLIED = 'applied'
export const DAPHNE_STATUS_UNAPPLIED = 'unapplied'
export const DAPHNE_STATUS_OPTIONS = [
  DAPHNE_STATUS_APPLIED,
  DAPHNE_STATUS_UNAPPLIED
]

export const normalizeDaphneStyles = value => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(([, hasDaphne]) => hasDaphne === true)
  )
}

export const toggleDaphneStyle = (daphneStyles, styleId) => {
  const next = normalizeDaphneStyles(daphneStyles)

  if (next[styleId] === true) {
    delete next[styleId]
  } else {
    next[styleId] = true
  }

  return next
}

export const hasDaphneStyle = (daphneStyles, styleId) => {
  return daphneStyles[styleId] === true
}

export const countDaphneStyles = daphneStyles => {
  return Object.values(normalizeDaphneStyles(daphneStyles)).length
}

export const matchesDaphneStatus = (hasDaphne, selectedStatuses = []) => {
  const wantsApplied = selectedStatuses.includes(DAPHNE_STATUS_APPLIED)
  const wantsUnapplied = selectedStatuses.includes(DAPHNE_STATUS_UNAPPLIED)

  if (wantsApplied === wantsUnapplied) return true
  return wantsApplied ? hasDaphne : !hasDaphne
}
