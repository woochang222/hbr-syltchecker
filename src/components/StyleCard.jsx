import React from 'react';

const StyleCard = ({ style, ownedCount, onToggleOwned, isDimmed, isHidden, isMeta }) => {
  if (isHidden) return null;

  const {
    id,
    character_name,
    isUniform,
    element,
    image_url
  } = style;

  return (
    <div 
      className={`style-card count-${ownedCount} ${isDimmed ? 'dimmed' : ''} ${isUniform ? 'uniform' : ''} ${isMeta ? 'meta-highlight' : ''}`}
      onClick={() => onToggleOwned(id)}
    >
      <div className="card-inner">
        {ownedCount > 0 && <span className="limit-break-badge">{ownedCount}</span>}
        
        <div className="style-image-container">
          {image_url ? (
            <img src={image_url} alt={character_name} className="style-image" />
          ) : (
            <div className="style-icon-placeholder">
              <span className="element-icon">{element}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleCard;
