import React from 'react'
import {
  formatExportDate,
  getExportImageUrl,
  groupStylesForOwnedStatusExport
} from '../utils/ownedStatusExport'
import {
  buildOwnedStatusSummaryLabels,
  buildOwnedStatusTileClassName
} from '../utils/ownedStatusExportPresentation'

const DAPHNE_ICON_URL = `${import.meta.env.BASE_URL}images/ui/daphne.png`

const OwnedStatusTile = ({ style }) => {
  const imageUrl = getExportImageUrl(style.imageUrl, import.meta.env.BASE_URL)

  return (
    <div className={buildOwnedStatusTileClassName(style)}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className="owned-export-image" />
      ) : (
        <div className="owned-export-image-placeholder" />
      )}
      {style.hasDaphne && (
        <span className="owned-export-daphne-badge" aria-label="다프네 적용">
          <img src={DAPHNE_ICON_URL} alt="" />
        </span>
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
  daphneStyles,
  totalOwned,
  totalStyles,
  ownershipRate,
  daphneCount,
  generatedAt
}) => {
  const units = groupStylesForOwnedStatusExport(styles, ownedStyles, daphneStyles)
  const summaryLabels = buildOwnedStatusSummaryLabels({
    totalOwned,
    totalStyles,
    ownershipRate,
    daphneCount
  })

  return (
    <div className="owned-status-export-board">
      <header className="owned-export-header">
        <div>
          <h2>헤번레 보유현황</h2>
          <p>{formatExportDate(generatedAt)} 생성</p>
        </div>
        <div className="owned-export-summary">
          {summaryLabels.map(label => (
            <span key={label}>{label}</span>
          ))}
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
