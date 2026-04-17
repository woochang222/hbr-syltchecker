import React from 'react';

const FilterPanel = ({ filters, onFilterChange, viewMode, onToggleViewMode }) => {
  const elements = ['화염', '빙결', '뇌전', '광', '암', '무속성'];
  const units = ['31A', '31B', '31C', '30G', '31D', '31E', '31F', '31X'];

  return (
    <div className="filter-panel">
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
