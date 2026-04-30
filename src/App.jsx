import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromoGrid from './components/PromoGrid';
import PromoDetail from './components/PromoDetail';
import { fetchPromosFromSheet } from './data/sheetService';
import CitySelector from './components/CitySelector';
import './App.css';

function App() {
  const [currentLocation, setCurrentLocation] = useState('All Locations');
  const [filteredPromos, setFilteredPromos] = useState([]);
  const [allPromos, setAllPromos] = useState([]); 
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationsList, setLocationsList] = useState(['All Locations']);
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

    // Selalu gunakan zona waktu WIB (GMT+7) untuk komparasi tanggal
    const nowStr = new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"});
    const now = new Date(nowStr);
    const activePromos = allPromos.filter(promo => {
      const isStarted = new Date(promo.startDate) <= now;
      const endOfPromoDay = new Date(new Date(promo.endDate).setHours(23, 59, 59, 999));
      const isNotExpired = endOfPromoDay >= now;
      
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

  const handlePromoClick = (promo) => {
    if (currentLocation === 'All Locations' && promo.isGrouped) {
      setSelectingGroup(promo);
      return;
    }
    setSelectedPromo(promo);
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
