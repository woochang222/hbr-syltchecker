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

  const isOwned = ownedCount !== undefined;

  return (
    <div 
      className={`style-card ${isOwned ? `count-${ownedCount} owned` : 'not-owned'} ${isDimmed ? 'dimmed' : ''} ${isUniform ? 'uniform' : ''} ${isMeta ? 'meta-highlight' : ''}`}
      onClick={() => onToggleOwned(id)}
    >
      <div className="card-inner">
        {isOwned && <span className="limit-break-badge">{ownedCount}</span>}
        
        <div className="style-image-container">
          {image_url ? (
            <img 
              src={`${import.meta.env.BASE_URL}${image_url.startsWith('/') ? image_url.slice(1) : image_url}`} 
              alt={character_name} 
              className="style-image" 
            />
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
