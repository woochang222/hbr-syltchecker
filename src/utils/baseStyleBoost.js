export const isBaseStyle = style => {
  const hasBaseStyleName = typeof style?.style_name === 'string' && style.style_name.startsWith('기본')
  const hasInitialNickname = Array.isArray(style?.nicknames) && style.nicknames.includes('초기')

  return hasBaseStyleName || hasInitialNickname
}

export const buildBaseStyleOwnershipByCharacter = (styles, ownedStyles) => {
  const baseOwnershipByCharacter = new Map()

  styles.forEach(style => {
    if (isBaseStyle(style)) {
      baseOwnershipByCharacter.set(style.character_name, ownedStyles[style.id])
    }
  })

  return baseOwnershipByCharacter
}

export const hasBaseStyleLimitBreakBoost = (style, ownedCount, baseOwnershipByCharacter) => {
  return ownedCount === 4 && baseOwnershipByCharacter.get(style.character_name) === 4
}
