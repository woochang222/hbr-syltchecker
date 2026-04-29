import React from 'react'
import { formatOwnershipSummary } from '../utils/ownershipSummary'

const OwnershipStickySummary = ({
  totalOwned,
  totalStyles,
  ownershipRate,
  visibleStyleCount,
  daphneCount
}) => {
  const {
    ownershipLabel,
    rateLabel,
    visibleLabel,
    daphneLabel
  } = formatOwnershipSummary({
    totalOwned,
    totalStyles,
    ownershipRate,
    visibleStyleCount,
    daphneCount
  })

  return (
    <section className="ownership-sticky-summary" aria-label="보유 스타일 요약">
      <div className="ownership-sticky-summary-inner">
        <span className="ownership-summary-chip primary">{ownershipLabel}</span>
        <span className="ownership-summary-chip rate">{rateLabel}</span>
        <span className="ownership-summary-chip daphne">{daphneLabel}</span>
        <span className="ownership-summary-chip">{visibleLabel}</span>
      </div>
    </section>
  )
}

export default OwnershipStickySummary
