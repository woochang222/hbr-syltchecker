export const formatOwnershipSummary = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  visibleStyleCount,
  daphneCount = 0
}) => ({
  ownershipLabel: `보유 ${totalOwned} / ${totalStyles}`,
  rateLabel: `${ownershipRate}%`,
  visibleLabel: `표시 ${visibleStyleCount}`,
  daphneLabel: `다프네 ${daphneCount}`
})
