import { useState, useEffect } from 'react'
import stylesData from './data/styles.json'
import FilterPanel from './components/FilterPanel'
import StyleCard from './components/StyleCard'

function App() {
  const [styles] = useState(stylesData)
  
  const [ownedStyles, setOwnedStyles] = useState(() => {
    const saved = localStorage.getItem('hbr_owned_styles')
    return saved ? JSON.parse(saved) : []
  })
  
  const [filters, setFilters] = useState({
    elements: [],
    units: []
  })
  
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('hbr_view_mode')
    return saved || 'dim'
  })

  useEffect(() => {
    localStorage.setItem('hbr_owned_styles', JSON.stringify(ownedStyles))
  }, [ownedStyles])

  useEffect(() => {
    localStorage.setItem('hbr_view_mode', viewMode)
  }, [viewMode])

  const handleToggleOwned = (id) => {
    setOwnedStyles(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
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

  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'dim' ? 'hide' : 'dim')
  }

  const filteredStyles = styles.map(style => {
    const matchElement = filters.elements.length === 0 || filters.elements.includes(style.element)
    const matchUnit = filters.units.length === 0 || filters.units.includes(style.unit)
    const isFilteredOut = !matchElement || !matchUnit

    return {
      ...style,
      isDimmed: isFilteredOut && viewMode === 'dim',
      isHidden: isFilteredOut && viewMode === 'hide'
    }
  })

  return (
    <div className="app-container">
      <header>
        <h1>HBR Style Checker</h1>
      </header>
      
      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
      />

      <main className="style-list">
        {filteredStyles.map(style => (
          <StyleCard 
            key={style.id}
            style={style}
            isOwned={ownedStyles.includes(style.id)}
            onToggleOwned={handleToggleOwned}
            isDimmed={style.isDimmed}
            isHidden={style.isHidden}
          />
        ))}
      </main>
    </div>
  )
}

export default App
