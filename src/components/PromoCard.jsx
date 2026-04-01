import React from 'react';
import './PromoCard.css';

const PromoCard = ({ promo, onClick }) => {
  const endDate = new Date(promo.endDate);
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  const isEndingSoon = daysLeft <= 2 && daysLeft > 0;

  return (
    <div className="promo-card" onClick={onClick}>
      <div className="promo-image-wrapper">
        <img src={promo.imageUrl} alt={promo.title} loading="lazy" />
        <div className="promo-location-badge">📍 {Array.isArray(promo.location) ? promo.location.join(', ') : promo.location}</div>
        {isEndingSoon && (
          <div className="promo-status-badge">Berakhir dalam {daysLeft} Hari</div>
        )}
      </div>
      <div className="promo-info">
        <h3>{promo.title}</h3>
      </div>
    </div>
  );
};

export default PromoCard;
