export const OWNERSHIP_RANGE_MIN = -1
export const OWNERSHIP_RANGE_MAX = 4
export const DEFAULT_OWNERSHIP_RANGE = [OWNERSHIP_RANGE_MIN, OWNERSHIP_RANGE_MAX]

export const OWNERSHIP_RANGE_LABELS = ['미보유', '0', '1', '2', '3', '4']

export const normalizeOwnershipRange = (range = DEFAULT_OWNERSHIP_RANGE) => {
  const [rawMin, rawMax] = range.map(Number)
  const clampedMin = Math.max(OWNERSHIP_RANGE_MIN, Math.min(OWNERSHIP_RANGE_MAX, rawMin))
  const clampedMax = Math.max(OWNERSHIP_RANGE_MIN, Math.min(OWNERSHIP_RANGE_MAX, rawMax))

  return clampedMin <= clampedMax ? [clampedMin, clampedMax] : [clampedMax, clampedMin]
}

export const matchesOwnershipRange = (ownedCount, range = DEFAULT_OWNERSHIP_RANGE) => {
  const [min, max] = normalizeOwnershipRange(range)
  const value = ownedCount === undefined ? OWNERSHIP_RANGE_MIN : ownedCount

  return value >= min && value <= max
}

export const buildOwnershipRangeLabel = (range = DEFAULT_OWNERSHIP_RANGE) => {
  const [min, max] = normalizeOwnershipRange(range)

  if (min === OWNERSHIP_RANGE_MIN && max === OWNERSHIP_RANGE_MAX) return null
  if (min === OWNERSHIP_RANGE_MIN && max === OWNERSHIP_RANGE_MIN) return '미보유'
  if (min === 0 && max === OWNERSHIP_RANGE_MAX) return '보유만'
  if (max === OWNERSHIP_RANGE_MAX) return `돌파 ${min}개 이상`
  if (min === OWNERSHIP_RANGE_MIN) return `돌파 ${max}개 이하`
  if (min === max) return `돌파 ${min}개`

  return `돌파 ${min}~${max}개`
}
