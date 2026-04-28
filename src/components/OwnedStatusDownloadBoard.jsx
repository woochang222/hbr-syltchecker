import React from 'react'
import {
  formatExportDate,
  getExportImageUrl,
  groupStylesForOwnedStatusExport
} from '../utils/ownedStatusExport'

const OwnedStatusTile = ({ style }) => {
  const imageUrl = getExportImageUrl(style.imageUrl, import.meta.env.BASE_URL)

  return (
    <div className={`owned-export-tile ${style.isOwned ? `owned count-${style.ownedCount}` : 'not-owned'}`}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className="owned-export-image" />
      ) : (
        <div className="owned-export-image-placeholder" />
      )}
      {style.isOwned && (
        <span className="owned-export-count-badge">{style.ownedCount}</span>
      )}
    </div>
  )
}

const OwnedStatusDownloadBoard = ({
  styles,
  ownedStyles,
  totalOwned,
  totalStyles,
  ownershipRate,
  generatedAt
}) => {
  const units = groupStylesForOwnedStatusExport(styles, ownedStyles)

  return (
    <div className="owned-status-export-board">
      <header className="owned-export-header">
        <div>
          <h2>헤번레 보유현황</h2>
          <p>{formatExportDate(generatedAt)} 생성</p>
        </div>
        <div className="owned-export-summary">
          <span>보유 {totalOwned} / {totalStyles}</span>
          <span>{ownershipRate}%</span>
        </div>
      </header>

      <div className="owned-export-units">
        {units.map(unit => (
          <section key={unit.unit} className="owned-export-unit">
            <div className="owned-export-unit-header">
              <h3>{unit.unit}</h3>
              <span>{unit.owned} / {unit.total}</span>
            </div>

            <div className="owned-export-characters">
              {unit.characters.map(character => (
                <section key={`${unit.unit}-${character.characterName}`} className="owned-export-character">
                  <div className="owned-export-character-header">
                    <strong>{character.characterName}</strong>
                    <span>{character.owned} / {character.total}</span>
                  </div>
                  <div className="owned-export-style-grid">
                    {character.styles.map(style => (
                      <OwnedStatusTile key={style.id} style={style} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default OwnedStatusDownloadBoard
