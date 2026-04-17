import React from 'react';

const StyleCard = ({ style, isOwned, onToggleOwned, isDimmed, isHidden }) => {
  if (isHidden) return null;

  const {
    id,
    character_name,
    style_name,
    isResonance,
    isLimited,
    isUniform,
    element,
    tier
  } = style;

  return (
    <div 
      className={`style-card ${isOwned ? 'owned' : ''} ${isDimmed ? 'dimmed' : ''} ${isUniform ? 'uniform' : ''}`}
      onClick={() => onToggleOwned(id)}
    >
      <div className="card-inner">
        {isResonance && <span className="badge resonance">R</span>}
        {isLimited && <span className="badge limited">L</span>}
        
        <div className="style-icon-placeholder">
          {/* 실제 이미지가 없으므로 원소/캐릭터명으로 대체 */}
          <span className="element-icon">{element}</span>
          <div className="char-name">{character_name}</div>
        </div>
        
        <div className="style-info">
          <div className="style-name">{style_name}</div>
          <div className="tier-tag">T{tier}</div>
        </div>
      </div>
    </div>
  );
};

export default StyleCard;
