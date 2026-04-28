import React from 'react'
import { formatOwnershipSummary } from '../utils/ownershipSummary'

const OwnershipStickySummary = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  visibleStyleCount
}) => {
  const {
    ownershipLabel,
    rateLabel,
    visibleLabel
  } = formatOwnershipSummary({
    totalOwned,
    totalStyles,
    ownershipRate,
    visibleStyleCount
  })

  return (
    <section className="ownership-sticky-summary" aria-label="보유 스타일 요약">
      <div className="ownership-sticky-summary-inner">
        <span className="ownership-summary-chip primary">{ownershipLabel}</span>
        <span className="ownership-summary-chip rate">{rateLabel}</span>
        <span className="ownership-summary-chip">{visibleLabel}</span>
      </div>
    </section>
  )
}

export default OwnershipStickySummary
