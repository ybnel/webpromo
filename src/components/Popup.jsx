import React from 'react';
import './Popup.css'; // Add styling here

const Popup = ({ onClose, promo, onPromoClick }) => {
  if (!promo) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>&times;</button>
        <div className="popup-image-container" onClick={() => onPromoClick(promo)} style={{cursor: 'pointer'}}>
          <img src={promo.imageUrl} alt={promo.title} className="popup-image" />
        </div>
        <div className="popup-details">
          <h2>{promo.title}</h2>
          <p>{promo.description}</p>
          <button className="popup-action" onClick={() => onPromoClick(promo)}>Show Full T&C</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
