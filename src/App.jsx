import { useState, useEffect } from 'react'
import stylesData from './data/styles.json'
import metaTeamsData from './data/meta_teams.json'
import FilterPanel from './components/FilterPanel'
import FilterSummary from './components/FilterSummary'
import OwnershipStickySummary from './components/OwnershipStickySummary'
import StyleCard from './components/StyleCard'
import { ELEMENTS } from './data/elements'
import { buildFilterSummary, countMatchingStyles, getRenderableStyles } from './utils/filterSummary'
import {
  DEFAULT_HIGHLIGHT_LATEST,
  createDefaultFilters,
  resetFilterState
} from './utils/filterState'
import { matchesOwnershipRange, normalizeOwnershipRange } from './utils/ownershipRange'
import { sortStylesByOfficialOrder } from './utils/styleOrder'
import { getStyleElements, hasStyleElement } from './utils/styleElements'
import {
  isPlainObject,
  readJsonStorage,
  readStringStorage
} from './utils/localStorageState'

function App() {
  const [styles] = useState(() => sortStylesByOfficialOrder(stylesData))
  const [metaTeams] = useState(metaTeamsData)
  
  const [ownedStyles, setOwnedStyles] = useState(() => {
    return readJsonStorage(localStorage, 'hbr_owned_styles', {}, isPlainObject)
  })
  
  const [filters, setFilters] = useState(() => createDefaultFilters())

  const [searchTerm, setSearchTerm] = useState('')
  const [activeMetaTeam, setActiveMetaTeam] = useState(null)
  
  const [viewMode, setViewMode] = useState(() => {
    return readStringStorage(localStorage, 'hbr_view_mode', 'dim', ['dim', 'hide'])
  })
  const [highlightLatest, setHighlightLatest] = useState(() => {
    return readJsonStorage(
      localStorage,
      'hbr_highlight_latest',
      DEFAULT_HIGHLIGHT_LATEST,
      value => typeof value === 'boolean'
    )
  })
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('hbr_owned_styles', JSON.stringify(ownedStyles))
  }, [ownedStyles])

  useEffect(() => {
    localStorage.setItem('hbr_view_mode', viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem('hbr_highlight_latest', JSON.stringify(highlightLatest))
  }, [highlightLatest])

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

  const handleOwnershipRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      ownershipRange: normalizeOwnershipRange(range)
    }))
  }

  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'dim' ? 'hide' : 'dim')
  }

  const handleToggleHighlightLatest = () => {
    setHighlightLatest(prev => !prev)
  }

  const handleResetFilters = () => {
    const nextState = resetFilterState()
    setFilters(nextState.filters)
    setSearchTerm(nextState.searchTerm)
    setActiveMetaTeam(nextState.activeMetaTeam)
  }

  const selectedTeamStyles = activeMetaTeam 
    ? metaTeams.find(t => t.id === activeMetaTeam)?.styles || []
    : []

  const filteredStyles = styles.map(style => {
    const matchElement = hasStyleElement(style, filters.elements)
    const matchUnit = filters.units.length === 0 || filters.units.includes(style.unit)
    const matchTier = filters.tiers.length === 0 || filters.tiers.includes(style.tier)
    const matchOwnership = matchesOwnershipRange(ownedStyles[style.id], filters.ownershipRange)
    const matchSearch = searchTerm === '' || 
      style.character_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.style_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (style.nicknames && style.nicknames.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())))
    
    const isFilteredOut = !matchElement || !matchUnit || !matchTier || !matchOwnership || !matchSearch

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
  const renderableStyles = getRenderableStyles(filteredStyles, viewMode)

  const totalStyles = styles.length
  const totalOwned = Object.keys(ownedStyles).length
  const ownershipRate = totalStyles > 0 ? Math.round((totalOwned / totalStyles) * 100) : 0

  const elementStats = ELEMENTS.map(el => {
    const totalByEl = styles.filter(s => getStyleElements(s).includes(el)).length
    const ownedByEl = styles.filter(s => getStyleElements(s).includes(el) && ownedStyles[s.id] !== undefined).length
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

      <OwnershipStickySummary
        totalOwned={totalOwned}
        totalStyles={totalStyles}
        ownershipRate={ownershipRate}
        visibleStyleCount={visibleStyleCount}
      />

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
              onOwnershipRangeChange={handleOwnershipRangeChange}
              highlightLatest={highlightLatest}
              onToggleHighlightLatest={handleToggleHighlightLatest}
              onResetFilters={handleResetFilters}
              onClose={() => setIsFilterDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="style-list">
        {renderableStyles.map(style => (
          <StyleCard 
            key={style.id}
            style={style}
            ownedCount={style.ownedCount}
            onToggleOwned={handleToggleOwned}
            isDimmed={style.isDimmed}
            isMeta={style.isMetaHighlight}
            highlightLatest={highlightLatest}
          />
        ))}
      </main>
    </div>
  )
}

export default App
