import React from 'react';
import './CitySelector.css';

const CitySelector = ({ group, onCitySelect, onClose }) => {
  if (!group) return null;

  return (
    <div className="city-selector-overlay" onClick={onClose}>
      <div className="city-selector-content" onClick={(e) => e.stopPropagation()}>
        <div className="city-selector-header">
          <h2>Pilih Lokasi</h2>
          <p>Promo <strong>"{group.title}"</strong> tersedia di beberapa lokasi. Silakan pilih lokasi untuk melihat detail.</p>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="city-list">
          {group.availableCities.map(city => (
            <button 
              key={city} 
              className="city-item"
              onClick={() => onCitySelect(group, city)}
            >
              <span className="city-icon">📍</span>
              <span className="city-name">{city}</span>
              <span className="arrow-icon">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitySelector;
