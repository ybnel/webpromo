import React from 'react';
import './Header.css';

const Header = ({ currentLocation, onLocationChange, dynamicLocations = ['All Locations'] }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="brand">
          <span className="brand-logo">🏷️</span>
          <h1>WebPromo</h1>
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
    </header>
  );
};

export default Header;
