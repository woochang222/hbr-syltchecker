import React from 'react'
import { ELEMENTS } from '../data/elements'
import { FILTER_UNITS } from '../data/units'
import { OWNERSHIP_RANGE_LABELS } from '../utils/ownershipRange'

const FilterPanel = ({
  filters,
  onFilterChange,
  viewMode,
  onToggleViewMode,
  metaTeams,
  activeMetaTeam,
  onMetaTeamChange,
  onOwnershipRangeChange,
  highlightLatest,
  onToggleHighlightLatest,
  onResetFilters,
  onClose
}) => {
  const tiers = [0, 1, 2, 3]
  const ownershipRange = filters.ownershipRange || [-1, 4]
  const ownershipMin = ownershipRange[0]
  const ownershipMax = ownershipRange[1]
  const ownershipMinPercent = ((ownershipMin + 1) / 5) * 100
  const ownershipMaxPercent = ((ownershipMax + 1) / 5) * 100
  const formatOwnershipValue = (value) => value === -1 ? '미보유' : `${value}`

  return (
    <aside
      className="filter-panel"
      aria-label="필터 패널"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="filter-panel-header">
        <div>
          <h2>필터</h2>
          <p>프리셋을 먼저 고르고 필요한 조건만 좁히세요.</p>
        </div>
        <div className="filter-panel-actions">
          <button type="button" className="filter-reset-button" onClick={onResetFilters}>
            초기화
          </button>
          <button type="button" className="filter-close-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>

      <div className="filter-group preset-group">
        <h3>메타 조합</h3>
        <div className="filter-buttons vertical">
          {metaTeams.map(team => (
            <button
              type="button"
              key={team.id}
              className={activeMetaTeam === team.id ? 'active meta' : ''}
              onClick={() => onMetaTeamChange(team.id)}
            >
              {team.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>원소</h3>
        <div className="filter-buttons">
          {ELEMENTS.map(el => (
            <button
              type="button"
              key={el}
              className={filters.elements.includes(el) ? 'active' : ''}
              onClick={() => onFilterChange('elements', el)}
            >
              {el}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>부대</h3>
        <div className="filter-buttons">
          {FILTER_UNITS.map(unit => (
            <button
              type="button"
              key={unit}
              className={filters.units.includes(unit) ? 'active' : ''}
              onClick={() => onFilterChange('units', unit)}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>티어</h3>
        <div className="filter-buttons">
          {tiers.map(tier => (
            <button
              type="button"
              key={tier}
              className={filters.tiers.includes(tier) ? 'active' : ''}
              onClick={() => onFilterChange('tiers', tier)}
            >
              T{tier}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group ownership-range-group">
        <h3>보유/돌파 수</h3>
        <div className="ownership-range-values" aria-live="polite">
          <span>{formatOwnershipValue(ownershipMin)}</span>
          <span>~</span>
          <span>{formatOwnershipValue(ownershipMax)}</span>
        </div>
        <div
          className="ownership-range-slider"
          style={{
            '--range-start': `${ownershipMinPercent}%`,
            '--range-end': `${ownershipMaxPercent}%`
          }}
        >
          <input
            type="range"
            min="-1"
            max="4"
            step="1"
            value={ownershipMin}
            aria-label="보유/돌파 최소값"
            onChange={(event) => onOwnershipRangeChange([Number(event.target.value), ownershipMax])}
          />
          <input
            type="range"
            min="-1"
            max="4"
            step="1"
            value={ownershipMax}
            aria-label="보유/돌파 최대값"
            onChange={(event) => onOwnershipRangeChange([ownershipMin, Number(event.target.value)])}
          />
        </div>
        <div className="ownership-range-scale" aria-hidden="true">
          {OWNERSHIP_RANGE_LABELS.map(label => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      <div className="view-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={viewMode === 'hide'}
            onChange={onToggleViewMode}
          />
          필터 제외 대상 숨기기
        </label>
      </div>

      <div className="view-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={highlightLatest}
            onChange={onToggleHighlightLatest}
          />
          최신 발매 스타일 돋보이기
        </label>
      </div>
    </aside>
  )
}

export default FilterPanel
