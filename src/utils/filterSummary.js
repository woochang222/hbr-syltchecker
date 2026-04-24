const formatSelection = (items, singularLabel) => {
  if (items.length === 0) return null
  if (items.length === 1) return String(items[0])
  return `${singularLabel} ${items.length}개`
}

const formatTierSelection = (tiers) => {
  if (tiers.length === 0) return null
  if (tiers.length === 1) return `T${tiers[0]}`
  return `티어 ${tiers.length}개`
}

export const buildFilterSummary = ({
  filters,
  activeMetaTeam,
  metaTeams,
  viewMode,
  visibleCount
}) => {
  const activeTeam = metaTeams.find(team => team.id === activeMetaTeam)
  const labels = []

  if (activeMetaTeam) {
    labels.push(activeTeam?.name || '선택한 조합')
  }

  const elementLabel = formatSelection(filters.elements, '원소')
  const unitLabel = formatSelection(filters.units, '부대')
  const tierLabel = formatTierSelection(filters.tiers)

  if (elementLabel) labels.push(elementLabel)
  if (unitLabel) labels.push(unitLabel)
  if (tierLabel) labels.push(tierLabel)

  if (labels.length === 0) {
    labels.push('전체 스타일')
  }

  labels.push(viewMode === 'hide' ? '숨김 모드' : '흐림 모드')
  labels.push(`결과 ${visibleCount}개`)

  return labels
}

export const countVisibleStyles = (styles) => {
  return styles.filter(style => !style.isHidden).length
}
