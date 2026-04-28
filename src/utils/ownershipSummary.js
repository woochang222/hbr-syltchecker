export const formatOwnershipSummary = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  visibleStyleCount
}) => ({
  ownershipLabel: `보유 ${totalOwned} / ${totalStyles}`,
  rateLabel: `${ownershipRate}%`,
  visibleLabel: `표시 ${visibleStyleCount}`
})
