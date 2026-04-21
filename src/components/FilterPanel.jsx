import React from 'react';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  viewMode, 
  onToggleViewMode,
  metaTeams,
  activeMetaTeam,
  onMetaTeamChange
}) => {
  const elements = ['화염', '빙결', '뇌전', '광', '암', '무속성'];
  const units = ['31A', '31B', '31C', '30G', '31D', '31E', '31F', '31X'];
  const tiers = [0, 1, 2, 3];

  return (
    <div className="filter-panel">
      <div className="filter-group">
        <h3>메타 조합 (하이라이트)</h3>
        <div className="filter-buttons">
          {metaTeams.map(team => (
            <button 
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
          {elements.map(el => (
            <button 
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
          {units.map(u => (
            <button 
              key={u}
              className={filters.units.includes(u) ? 'active' : ''}
              onClick={() => onFilterChange('units', u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>티어 (성능)</h3>
        <div className="filter-buttons">
          {tiers.map(t => (
            <button 
              key={t}
              className={filters.tiers.includes(t) ? 'active' : ''}
              onClick={() => onFilterChange('tiers', t)}
            >
              T{t}
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
    </div>
  );
};

export default FilterPanel;
