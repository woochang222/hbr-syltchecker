import { useState, useEffect } from 'react'
import stylesData from './data/styles.json'
import metaTeamsData from './data/meta_teams.json'
import FilterPanel from './components/FilterPanel'
import FilterSummary from './components/FilterSummary'
import StyleCard from './components/StyleCard'
import { ELEMENTS } from './data/elements'
import { buildFilterSummary, countMatchingStyles } from './utils/filterSummary'

function App() {
  const [styles] = useState(stylesData)
  const [metaTeams] = useState(metaTeamsData)
  
  const [ownedStyles, setOwnedStyles] = useState(() => {
    const saved = localStorage.getItem('hbr_owned_styles')
    return saved ? JSON.parse(saved) : {}
  })
  
  const [filters, setFilters] = useState({
    elements: [],
    units: [],
    tiers: []
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [activeMetaTeam, setActiveMetaTeam] = useState(null)
  
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('hbr_view_mode')
    return saved || 'dim'
  })
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('hbr_owned_styles', JSON.stringify(ownedStyles))
  }, [ownedStyles])

  useEffect(() => {
    localStorage.setItem('hbr_view_mode', viewMode)
  }, [viewMode])

  useEffect(() => {
    if (!isFilterDrawerOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFilterDrawerOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFilterDrawerOpen])

  const handleToggleOwned = (id) => {
    setOwnedStyles(prev => {
      const next = { ...prev }
      const current = prev[id]
      
      if (current === undefined) {
        next[id] = 0 // Not owned -> 0-break
      } else if (current === 4) {
        delete next[id] // 4-break -> Not owned
      } else {
        next[id] = current + 1 // 0->1, 1->2, 2->3, 3->4
      }
      
      return next
    })
  }

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      const currentFilters = prev[type]
      const nextFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value]
      return { ...prev, [type]: nextFilters }
    })
  }

  const handleMetaTeamChange = (teamId) => {
    setActiveMetaTeam(prev => prev === teamId ? null : teamId)
  }

  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'dim' ? 'hide' : 'dim')
  }

  const selectedTeamStyles = activeMetaTeam 
    ? metaTeams.find(t => t.id === activeMetaTeam)?.styles || []
    : []

  const filteredStyles = styles.map(style => {
    const matchElement = filters.elements.length === 0 || filters.elements.includes(style.element)
    const matchUnit = filters.units.length === 0 || filters.units.includes(style.unit)
    const matchTier = filters.tiers.length === 0 || filters.tiers.includes(style.tier)
    const matchSearch = searchTerm === '' || 
      style.character_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.style_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (style.nicknames && style.nicknames.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())))
    
    const isFilteredOut = !matchElement || !matchUnit || !matchTier || !matchSearch

    return {
      ...style,
      matchesFilters: !isFilteredOut,
      isDimmed: isFilteredOut && viewMode === 'dim',
      isHidden: isFilteredOut && viewMode === 'hide',
      isMetaHighlight: selectedTeamStyles.includes(style.id),
      ownedCount: ownedStyles[style.id] // Now can be undefined, 0, 1, 2, 3, or 4
    }
  })

  const visibleStyleCount = countMatchingStyles(filteredStyles)
  const filterSummaryLabels = buildFilterSummary({
    filters,
    activeMetaTeam,
    metaTeams,
    viewMode,
    visibleCount: visibleStyleCount
  })

  const totalStyles = styles.length
  const totalOwned = Object.keys(ownedStyles).length
  const ownershipRate = totalStyles > 0 ? Math.round((totalOwned / totalStyles) * 100) : 0

  const elementStats = ELEMENTS.map(el => {
    const totalByEl = styles.filter(s => s.element === el).length
    const ownedByEl = styles.filter(s => s.element === el && ownedStyles[s.id] !== undefined).length
    return { element: el, total: totalByEl, owned: ownedByEl }
  })

  return (
    <div className="app-container">
      <header>
        <h1>헤번레 스타일 체커</h1>
        <div className="control-toolbar">
          <button
            type="button"
            className="filter-drawer-button"
            onClick={() => setIsFilterDrawerOpen(true)}
            aria-expanded={isFilterDrawerOpen}
            aria-controls="filter-drawer"
          >
            필터
          </button>

          <div className="search-bar">
            <input
              type="text"
              placeholder="캐릭터 또는 스타일 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="검색어 지우기"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <FilterSummary labels={filterSummaryLabels} />
      </header>

      <section className="stats-dashboard">
        <div className="main-stats">
          <div className="stat-item total">
            <span className="label">전체 보유율</span>
            <span className="value">{ownershipRate}%</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${ownershipRate}%` }}></div>
            </div>
            <span className="count">{totalOwned} / {totalStyles}</span>
          </div>
        </div>
        <div className="element-stats">
          {elementStats.map(stat => (
            <div key={stat.element} className="el-stat-item">
              <span className="el-label">{stat.element}</span>
              <span className="el-count">{stat.owned}/{stat.total}</span>
            </div>
          ))}
        </div>
      </section>

      {isFilterDrawerOpen && (
        <div
          className="filter-drawer-overlay"
          onClick={() => setIsFilterDrawerOpen(false)}
        >
          <div
            id="filter-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              viewMode={viewMode}
              onToggleViewMode={handleToggleViewMode}
              metaTeams={metaTeams}
              activeMetaTeam={activeMetaTeam}
              onMetaTeamChange={handleMetaTeamChange}
              onClose={() => setIsFilterDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="style-list">
        {filteredStyles.map(style => (
          <StyleCard 
            key={style.id}
            style={style}
            ownedCount={style.ownedCount}
            onToggleOwned={handleToggleOwned}
            isDimmed={style.isDimmed}
            isHidden={style.isHidden}
            isMeta={style.isMetaHighlight}
          />
        ))}
      </main>
    </div>
  )
}

export default App
