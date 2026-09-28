export function parseRecognitionImport(text, styles) {
  if (text.length > 1000000) throw new Error('입력 데이터가 너무 큽니다.')
  let data
  try { data = JSON.parse(text) } catch { throw new Error('올바른 인식 결과 JSON이 아닙니다.') }
  if (data?.format !== 'hbr-style-recognition' || data.version !== 1 || !Array.isArray(data.styles)) {
    throw new Error('지원하지 않는 인식 결과 형식입니다.')
  }
  if (!data.styles.length || data.styles.length > 2000) throw new Error('스타일 개수를 확인해주세요.')
  const known = new Map(styles.map(style => [style.id, style]))
  const entries = new Map()
  for (const row of data.styles) {
    if (!row || !known.has(row.id)) throw new Error('등록되지 않은 스타일이 포함되어 있습니다. 최신 스타일 데이터를 확인해주세요.')
    const count = row.limitBreak
    const daphne = row.daphne
    if (count != null && (!Number.isInteger(count) || count < 0 || count > 4)) throw new Error('돌파 수는 0~4 정수여야 합니다.')
    if (daphne != null && typeof daphne !== 'boolean') throw new Error('다프네 값은 true, false 또는 null이어야 합니다.')
    const previous = entries.get(row.id) || { id: row.id }
    for (const [key, value] of [['limitBreak', count], ['daphne', daphne]]) {
      if (value == null) continue
      if (previous[key] !== undefined && previous[key] !== value) throw new Error('같은 스타일의 인식 결과가 충돌합니다.')
      previous[key] = value
    }
    entries.set(row.id, previous)
  }
  return [...entries.values()].filter(row => row.limitBreak !== undefined || row.daphne !== undefined)
}

export function mergeRecognitionImport(rows, owned, daphne) {
  const ownedStyles = { ...owned }
  const daphneStyles = { ...daphne }
  for (const row of rows) {
    if (row.limitBreak !== undefined) ownedStyles[row.id] = row.limitBreak
    if (row.daphne === true) daphneStyles[row.id] = true
    if (row.daphne === false) delete daphneStyles[row.id]
  }
  return { ownedStyles, daphneStyles }
}
