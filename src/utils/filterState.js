import { DEFAULT_OWNERSHIP_RANGE } from './ownershipRange.js'

export const DEFAULT_FILTERS = {
  elements: [],
  units: [],
  tiers: [],
  ownershipRange: DEFAULT_OWNERSHIP_RANGE
}

export const DEFAULT_HIGHLIGHT_LATEST = true

export const createDefaultFilters = () => ({
  elements: [],
  units: [],
  tiers: [],
  ownershipRange: [...DEFAULT_OWNERSHIP_RANGE]
})

export const resetFilterState = () => ({
  filters: createDefaultFilters(),
  searchTerm: '',
  activeMetaTeam: null
})
