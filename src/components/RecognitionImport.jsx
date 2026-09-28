import { useState } from 'react'
import { parseRecognitionImport } from '../utils/recognitionImport'

export default function RecognitionImport({ styles, ownedStyles, daphneStyles, onApply }) {
  const [text, setText] = useState('')
  const [rows, setRows] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const validate = () => {
    setMessage('')
    setError('')
    try {
      const parsed = parseRecognitionImport(text, styles)
      if (!parsed.length) throw new Error('반영할 인식 결과가 없습니다.')
      setRows(parsed)
    } catch (err) { setRows(null); setError(err.message) }
  }
  return (
    <details className="recognition-import">
      <summary>인식 결과 가져오기</summary>
      <label htmlFor="recognition-input">인식 결과</label>
      <textarea id="recognition-input" value={text} maxLength={1000000} spellCheck={false}
        onChange={event => { setText(event.target.value); setRows(null); setMessage(''); setError('') }} />
      <button type="button" className="owned-status-download-button" disabled={!text.trim()} onClick={validate}>변경 내용 확인</button>
      {error && <p role="alert">{error}</p>}
      {rows && <>
        <div className="recognition-preview">
          <table>
            <thead><tr><th>스타일</th><th>돌파</th><th>다프네</th></tr></thead>
            <tbody>{rows.map(row => {
              const style = styles.find(item => item.id === row.id)
              return <tr key={row.id}>
                <td>{style.character_name}<br />{style.style_name}</td>
                <td>{row.limitBreak === undefined ? '유지' : `${ownedStyles[row.id] ?? '미보유'} → ${row.limitBreak}`}</td>
                <td>{row.daphne === undefined ? '유지' : `${daphneStyles[row.id] === true ? '적용' : '미적용'} → ${row.daphne ? '적용' : '미적용'}`}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
        <button type="button" className="owned-status-download-button" onClick={() => {
          onApply(rows)
          setMessage(`${rows.length}개 스타일을 반영했습니다.`)
          setRows(null)
          setText('')
        }}>이 브라우저에 반영</button>
      </>}
      {message && <p role="status">{message}</p>}
    </details>
  )
}
