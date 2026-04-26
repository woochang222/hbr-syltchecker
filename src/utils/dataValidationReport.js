export const hasValidationWarnings = warnings => Object.values(warnings)
  .some(items => items.length > 0)
