export const buildOwnedStatusSummaryLabels = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  daphneCount = 0
}) => [
  `보유 ${totalOwned} / ${totalStyles}`,
  `${ownershipRate}%`,
  `다프네 ${daphneCount}`
]

export const buildOwnedStatusTileClassName = style => [
  'owned-export-tile',
  style.isOwned ? `owned count-${style.ownedCount}` : 'not-owned',
  style.hasBaseLimitBreakBoost ? 'base-boosted' : '',
  style.hasDaphne ? 'has-daphne' : ''
].filter(Boolean).join(' ')
