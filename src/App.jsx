import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromoGrid from './components/PromoGrid';
import Popup from './components/Popup';
import PromoDetail from './components/PromoDetail';
import { fetchPromosFromSheet } from './data/sheetService';
import CitySelector from './components/CitySelector';
import './App.css';

function App() {
  const [currentLocation, setCurrentLocation] = useState('All Locations');
  const [filteredPromos, setFilteredPromos] = useState([]);
  const [allPromos, setAllPromos] = useState([]); 
  const [showPopup, setShowPopup] = useState(false);
  const [popupPromo, setPopupPromo] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationsList, setLocationsList] = useState(['All Locations']);
  const [hasInitialPopupShown, setHasInitialPopupShown] = useState(false);
  const [activeTab, setActiveTab] = useState('New Student'); 
  const [selectingGroup, setSelectingGroup] = useState(null);
  // 1. Fetch data from Google Sheets source on mount & background polling
  useEffect(() => {
    const loadData = () => {
      fetchPromosFromSheet()
        .then(data => {
          setAllPromos(data);
          setIsLoading(false);
          
          // Build dynamic locations list
          const uniqueLocs = new Set();
          data.forEach(p => {
            if (Array.isArray(p.location)) {
              p.location.forEach(loc => uniqueLocs.add(loc));
            }
          });
          uniqueLocs.delete('All Locations');
          const newLocs = ['All Locations', ...Array.from(uniqueLocs)];
          
          setLocationsList(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(newLocs)) {
              return newLocs;
            }
            return prev;
          });
        })
        .catch(err => {
          console.error("Gagal mendownload data dari URL Sheets", err);
          setIsLoading(false);
        });
    };

    // Initial load
    setIsLoading(true);
    loadData();


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
    }).sort((a, b) => {
      // 1. Sort by Priority first (1 is highest, 999 is lowest)
      if (a.prioritas !== b.prioritas) {
        return a.prioritas - b.prioritas;
      }
      // 2. If priority is the same, sort by ending soonest
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });

    let displayPromos = activePromos;

    if (currentLocation === 'All Locations') {
      const groups = {};
      activePromos.forEach(p => {
        if (!groups[p.title]) {
          groups[p.title] = { 
            ...p, 
            id: `group-${p.title.replace(/\s+/g, '-').toLowerCase()}`,
            isGrouped: true, 
            items: [p] 
          };
        } else {
          groups[p.title].items.push(p);
        }
      });
      
      displayPromos = Object.values(groups).map(group => {
        const allCitiesInGroup = new Set();
        let hasAllLocations = false;
        
        group.items.forEach(item => {
          if (Array.isArray(item.location)) {
            item.location.forEach(loc => {
              if (loc === 'All Locations') hasAllLocations = true;
              else allCitiesInGroup.add(loc);
            });
          }
        });
        
        const availableCities = hasAllLocations 
          ? locationsList.filter(l => l !== 'All Locations') 
          : Array.from(allCitiesInGroup).sort();
          
        return { ...group, availableCities };
      });
    }

    setFilteredPromos(displayPromos);
  }, [currentLocation, allPromos, activeTab, locationsList]);

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
        const locString = currentLocation;
        
        // Filter: Get all active promos valid for THIS specific city (including "All Locations")
        const activeCityPromos = allPromos.filter(promo => {
          const isStarted = new Date(promo.startDate) <= now;
          const isNotExpired = new Date(promo.endDate) >= now;
          const isLocMatch = (Array.isArray(promo.location) && promo.location.includes(locString)) || 
                             promo.location === locString || 
                             (Array.isArray(promo.location) && promo.location.includes('All Locations')) ||
                             promo.location === 'All Locations';
          return isStarted && isNotExpired && isLocMatch;
        }).sort((a, b) => {
          // 1. Sort by Priority (Manual Priority)
          if (a.prioritas !== b.prioritas) {
            return a.prioritas - b.prioritas;
          }
          // 2. Sort by Expiry Date (Ending Soonest)
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });

        if (activeCityPromos.length > 0) {
          setPopupPromo(activeCityPromos[0]); // Take the top priority card for THIS city
          setShowPopup(true);
          setHasInitialPopupShown(true);
        }
      }, 1500); // 1.5 seconds wait for initial location discovery

      return () => clearTimeout(timer);
    }
  }, [isLoading, allPromos, currentLocation, hasInitialPopupShown]);

  const handleClosePopup = () => setShowPopup(false)

  const handlePromoClick = (promo) => {
    if (currentLocation === 'All Locations' && promo.isGrouped) {
      setSelectingGroup(promo);
      return;
    }
    setSelectedPromo(promo);
    setShowPopup(false); 
  };

  const handleCitySelect = (group, city) => {
    // Find the best matching promo item for this city
    const matchedPromo = group.items.find(item => 
      (Array.isArray(item.location) && item.location.includes(city)) || 
      (Array.isArray(item.location) && item.location.includes('All Locations')) ||
      item.location === city ||
      item.location === 'All Locations'
    ) || group.items[0]; // fallback to first item

    setSelectedPromo(matchedPromo);
    setSelectingGroup(null);
    setShowPopup(false);
  };

  const handleBackToHome = () => {
    setSelectedPromo(null);
    setSelectingGroup(null);
  };

  return (
    <div className="app-container">
      <Header 
        currentLocation={currentLocation} 
        onLocationChange={setCurrentLocation} 
        dynamicLocations={locationsList}
        onLogoClick={handleBackToHome}
        activeCategory={activeTab}
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

      {selectingGroup && (
        <CitySelector 
          group={selectingGroup} 
          onCitySelect={handleCitySelect} 
          onClose={() => setSelectingGroup(null)} 
        />
      )}
    </div>
  );
}

export default App;
