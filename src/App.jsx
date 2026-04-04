import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromoGrid from './components/PromoGrid';
import Popup from './components/Popup';
import PromoDetail from './components/PromoDetail';
import { fetchPromosFromSheet } from './data/sheetService';
import './App.css';

function App() {
  const [currentLocation, setCurrentLocation] = useState('All Locations');
  const [filteredPromos, setFilteredPromos] = useState([]);
  const [allPromos, setAllPromos] = useState([]); // Store all fetched promos
  const [showPopup, setShowPopup] = useState(false);
  const [popupPromo, setPopupPromo] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationsList, setLocationsList] = useState(['All Locations']);
  const [hasInitialPopupShown, setHasInitialPopupShown] = useState(false);
  const [activeTab, setActiveTab] = useState('New Student'); // Default tab

  // 1. Fetch data from Google Sheets source on mount
  useEffect(() => {
    setIsLoading(true);
    fetchPromosFromSheet()
      .then(data => {
        setAllPromos(data);
        setIsLoading(false);
        
        // Build dynamic locations list (e.g., from CSV column "location")
        const uniqueLocs = new Set();
        data.forEach(p => {
          if (Array.isArray(p.location)) {
            p.location.forEach(loc => uniqueLocs.add(loc));
          }
        });
        uniqueLocs.delete('All Locations');
        setLocationsList(['All Locations', ...Array.from(uniqueLocs)]);
      })
      .catch(err => {
        console.error("Gagal mendownload data dari URL Sheets", err);
        setIsLoading(false);
      });
  }, []);

  // 2. Filter the UI whenever data is updated or region changes
  useEffect(() => {
    if (allPromos.length === 0) return;

    const now = new Date();
    const activePromos = allPromos.filter(promo => {
      const isStarted = new Date(promo.startDate) <= now;
      const isNotExpired = new Date(promo.endDate) >= now;
      
      const locationMatch = currentLocation === 'All Locations' 
        || (Array.isArray(promo.location) && promo.location.includes('All Locations'))
        || (Array.isArray(promo.location) && promo.location.includes(currentLocation));

      // Kategori Match Logic
      const pKat = promo.kategori ? promo.kategori.toLowerCase() : '';
      const isBoth = pKat.includes('kedua') || pKat.includes('all') || pKat === '';
      const tabMatch = isBoth || pKat.includes(activeTab.toLowerCase().replace(' student', ''));

      return isStarted && isNotExpired && locationMatch && tabMatch;
    }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    setFilteredPromos(activePromos);
  }, [currentLocation, allPromos, activeTab]);

  // 3. Geolocation automation (Silently auto-select location)
  useEffect(() => {
    if ("geolocation" in navigator && locationsList.length > 1) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            
            if (data && data.address) {
              const cityStr = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state || "";
              
              const matchedLoc = locationsList.find(loc => 
                cityStr.toLowerCase().includes(loc.toLowerCase()) && loc !== "All Locations"
              );
              
              if (matchedLoc) {
                setCurrentLocation(matchedLoc);
              }
            }
          } catch (e) {
            console.error("Gagal mendeteksi lokasi:", e);
          }
        },
        () => {
          // Silent fail for location tracking
        }
      );
    }
  }, [locationsList]);

  // 4. Trigger localized popup after data is loaded and location is likely detected
  useEffect(() => {
    if (!isLoading && allPromos.length > 0 && !hasInitialPopupShown) {
      // Small delay to allow geolocation to potentially update currentLocation first
      const timer = setTimeout(() => {
        const now = new Date();
        const activePromos = allPromos.filter(promo => {
          const isStarted = new Date(promo.startDate) <= now;
          const isNotExpired = new Date(promo.endDate) >= now;
          return isStarted && isNotExpired;
        }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

        if (activePromos.length === 0) return;

        // Try to find a promo specific to the detected location first
        let bestPopup = activePromos.find(p => 
          currentLocation !== 'All Locations' && 
          Array.isArray(p.location) && 
          p.location.includes(currentLocation)
        );

        // Fallback to "All Locations" if no specific city promo is found
        if (!bestPopup) {
          bestPopup = activePromos.find(p => 
            Array.isArray(p.location) && p.location.includes('All Locations')
          );
        }

        // Absolute fallback to the first active promo
        if (!bestPopup) bestPopup = activePromos[0];

        if (bestPopup) {
          setPopupPromo(bestPopup);
          setShowPopup(true);
          setHasInitialPopupShown(true);
        }
      }, 1500); // 1.5 seconds wait for more accurate initial location

      return () => clearTimeout(timer);
    }
  }, [isLoading, allPromos, currentLocation, hasInitialPopupShown]);

  const handleClosePopup = () => setShowPopup(false);

  const handlePromoClick = (promo) => {
    setSelectedPromo(promo);
    setShowPopup(false); 
  };

  const handleBackToHome = () => setSelectedPromo(null);

  // Re-use Header but pass dynamic locations
  // We need to pass the list to Header since it was statically imported before
  return (
    <div className="app-container">
      <Header 
        currentLocation={currentLocation} 
        onLocationChange={setCurrentLocation} 
        dynamicLocations={locationsList}
        onLogoClick={handleBackToHome}
      />
      
      <main className="main-content">
        {selectedPromo ? (
          <PromoDetail promo={selectedPromo} onBack={handleBackToHome} />
        ) : (
          <>
            <div className="section-title">
              <h2>Active Promotions</h2>
              <p>Current active promotions available for customers.</p>
            </div>
            
            <div className="promo-tabs-container">
              <div className="promo-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'New Student' ? 'active' : ''}`}
                  onClick={() => setActiveTab('New Student')}
                >
                  New Student
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'Retention Student' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Retention Student')}
                >
                  Retention Student
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <h3 style={{ fontWeight: 500 }}>⏳ Loading Data from Server...</h3>
              </div>
            ) : (
              <PromoGrid promos={filteredPromos} onPromoClick={handlePromoClick} />
            )}
          </>
        )}
      </main>

      {showPopup && !selectedPromo && popupPromo && (
        <Popup promo={popupPromo} onClose={handleClosePopup} onPromoClick={handlePromoClick} />
      )}
    </div>
  );
}

export default App;
