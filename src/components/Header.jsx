import React from 'react';
import './Header.css';

const Header = ({ currentLocation, onLocationChange, dynamicLocations = ['All Locations'], onLogoClick, activeCategory }) => {
  const isRetention = activeCategory === 'Retention Student';
  const categoryLabel = isRetention ? 'RS' : 'NS';

  return (
    <header className="header">
      <div className="header-container">
        <div className="brand" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="EdukaPromo Logo" className="brand-logo" />
          <h1>EdukaPromo</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={`category-badge ${isRetention ? 'retention' : 'new'}`}>
            {categoryLabel}
          </div>
          
          <div className="location-selector">
            <label htmlFor="location">Location:</label>
            <div className="select-wrapper">
              <select 
                id="location" 
                value={currentLocation} 
                onChange={(e) => onLocationChange(e.target.value)}
              >
                {dynamicLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
