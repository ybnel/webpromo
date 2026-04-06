import React from 'react';
import PromoCard from './PromoCard';
import './PromoGrid.css';

const PromoGrid = ({ promos, onPromoClick }) => {
  if (!promos || promos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">😔</div>
        <h2>No Active Promos</h2>
      </div>
    );
  }

  return (
    <div className="promo-grid">
      {promos.map(promo => (
        <PromoCard key={promo.id} promo={promo} onClick={() => onPromoClick(promo)} />
      ))}
    </div>
  );
};

export default PromoGrid;
