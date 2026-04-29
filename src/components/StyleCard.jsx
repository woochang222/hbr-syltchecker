import React, { useRef } from 'react';

const LONG_PRESS_MS = 550;
const DAPHNE_ICON_URL = `${import.meta.env.BASE_URL}images/ui/daphne.png`;

const StyleCard = ({
  style,
  ownedCount,
  onToggleOwned,
  onToggleDaphne = () => {},
  hasDaphne = false,
  isDimmed,
  isMeta,
  highlightLatest,
  hasBaseLimitBreakBoost
}) => {
  const longPressTimerRef = useRef(null);
  const suppressClickRef = useRef(false);

  const {
    id,
    character_name,
    isUniform,
    element,
    isLatest,
    image_url
  } = style;

  const isOwned = ownedCount !== undefined;
  const isLatestHighlighted = Boolean(highlightLatest && isLatest);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    onToggleOwned(id);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    onToggleDaphne(id);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') {
      return;
    }

    clearLongPressTimer();
    suppressClickRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      onToggleDaphne(id);
      suppressClickRef.current = true;
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  };

  return (
    <div 
      className={`style-card ${isOwned ? `count-${ownedCount} owned` : 'not-owned'} ${isDimmed ? 'dimmed' : ''} ${isUniform ? 'uniform' : ''} ${isMeta ? 'meta-highlight' : ''} ${isLatestHighlighted ? 'latest-highlight' : ''} ${hasBaseLimitBreakBoost ? 'base-boosted' : ''} ${hasDaphne ? 'has-daphne' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={clearLongPressTimer}
      onPointerCancel={clearLongPressTimer}
      onPointerLeave={clearLongPressTimer}
    >
      <div className="card-inner">
        {isOwned && <span className="limit-break-badge">{ownedCount}</span>}
        {isLatestHighlighted && <span className="latest-badge">최신</span>}
        {hasDaphne && (
          <span className="daphne-badge" aria-label="다프네 적용">
            <img src={DAPHNE_ICON_URL} alt="" />
          </span>
        )}
        
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
