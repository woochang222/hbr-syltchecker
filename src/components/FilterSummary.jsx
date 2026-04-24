import React from 'react'

const FilterSummary = ({ labels }) => {
  return (
    <div className="filter-summary" aria-label="현재 필터 조건">
      {labels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={index === 0 ? 'summary-chip primary' : 'summary-chip'}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export default FilterSummary
