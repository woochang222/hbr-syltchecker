import React from 'react'
import { ELEMENTS } from '../data/elements'

const FilterPanel = ({
  filters,
  onFilterChange,
  viewMode,
  onToggleViewMode,
  metaTeams,
  activeMetaTeam,
  onMetaTeamChange,
  onClose
}) => {
  const units = ['31A', '31B', '31C', '30G', '31D', '31E', '31F', '31X']
  const tiers = [0, 1, 2, 3]

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
        <button type="button" className="filter-close-button" onClick={onClose}>
          닫기
        </button>
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
          {units.map(unit => (
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
    </aside>
  )
}

export default FilterPanel
