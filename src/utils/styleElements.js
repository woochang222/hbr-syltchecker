export const getStyleElements = (style) => {
  if (Array.isArray(style.elements) && style.elements.length > 0) {
    return style.elements
  }

  return style.element ? [style.element] : []
}

export const hasStyleElement = (style, selectedElements) => {
  if (selectedElements.length === 0) return true

  const styleElements = getStyleElements(style)
  return selectedElements.some(element => styleElements.includes(element))
}
