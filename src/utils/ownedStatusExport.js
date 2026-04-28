import {
  buildBaseStyleOwnershipByCharacter,
  hasBaseStyleLimitBreakBoost
} from './baseStyleBoost.js'

const toDateParts = date => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return { year, month, day }
}

export const isOwnedStyle = ownedCount => ownedCount !== undefined

export const formatExportDate = date => {
  const { year, month, day } = toDateParts(date)
  return `${year}.${month}.${day}`
}

export const buildOwnedStatusFilename = date => {
  const { year, month, day } = toDateParts(date)
  return `hbr-owned-status-${year}-${month}-${day}.png`
}

export const getExportImageUrl = (imageUrl, baseUrl) => {
  if (!imageUrl) return ''
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedImage = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
  return `${normalizedBase}${normalizedImage}`
}

const createExportStyle = (style, ownedCount, baseOwnershipByCharacter) => ({
  id: style.id,
  characterName: style.character_name,
  styleName: style.style_name,
  imageUrl: style.image_url,
  ownedCount,
  isOwned: isOwnedStyle(ownedCount),
  hasBaseLimitBreakBoost: hasBaseStyleLimitBreakBoost(
    style,
    ownedCount,
    baseOwnershipByCharacter
  )
})

export const groupStylesForOwnedStatusExport = (styles, ownedStyles) => {
  const baseOwnershipByCharacter = buildBaseStyleOwnershipByCharacter(styles, ownedStyles)
  const units = []
  const unitsByName = new Map()

  styles.forEach(style => {
    if (!unitsByName.has(style.unit)) {
      const unitGroup = {
        unit: style.unit,
        total: 0,
        owned: 0,
        characters: []
      }
      unitsByName.set(style.unit, {
        group: unitGroup,
        charactersByName: new Map()
      })
      units.push(unitGroup)
    }

    const unitRecord = unitsByName.get(style.unit)
    const unitGroup = unitRecord.group

    if (!unitRecord.charactersByName.has(style.character_name)) {
      const characterGroup = {
        characterName: style.character_name,
        total: 0,
        owned: 0,
        styles: []
      }
      unitRecord.charactersByName.set(style.character_name, characterGroup)
      unitGroup.characters.push(characterGroup)
    }

    const characterGroup = unitRecord.charactersByName.get(style.character_name)
    const ownedCount = ownedStyles[style.id]
    const exportStyle = createExportStyle(style, ownedCount, baseOwnershipByCharacter)

    unitGroup.total += 1
    characterGroup.total += 1

    if (exportStyle.isOwned) {
      unitGroup.owned += 1
      characterGroup.owned += 1
    }

    characterGroup.styles.push(exportStyle)
  })

  return units
}
