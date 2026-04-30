import React from 'react';
import './PromoCard.css';

const PromoCard = ({ promo, onClick }) => {
  const endDate = new Date(promo.endDate);
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  const isEndingSoon = daysLeft <= 2 && daysLeft > 0;

  const handleCardClick = () => {
    // 1. Jalankan fungsi bawaan untuk membuka popup
    if (onClick) onClick(); 
    
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyY1pcKze3S0yN428x1edfykD2urJGtnSg9zvJTVeRfui0ZsHMLtbpzvCqqBvTclTwb/exec'; 
    const locationStr = promo.isGrouped ? 'All Locations' : (Array.isArray(promo.location) ? promo.location[0] : promo.location);

    // Tambahkan parameter title dan location ke dalam URL
    const hitUrl = `${scriptUrl}?title=${encodeURIComponent(promo.title)}&location=${encodeURIComponent(locationStr)}`;
    
    // "no-cors" digunakan supaya request tidak diblokir oleh sistem keamanan browser (CORS)
    fetch(hitUrl, { mode: 'no-cors' }).catch((err) => {
      console.log("Analytics error:", err);
    });
  };

  // Membuat URL gambar otomatis menggunakan judul promo.
  // Jika di database/Google Sheet kolom imageUrl dikosongkan, maka otomatis pakai ini.
  const dynamicImageUrl = `https://placehold.co/800x600/A1CDFA/000000?text=${encodeURIComponent(promo.title)}`;
  const displayImage = promo.imageUrl ? promo.imageUrl : dynamicImageUrl;

  return (
    <div className="promo-card" onClick={handleCardClick}>
      <div className="promo-image-wrapper">
        <img src={displayImage} alt={promo.title} loading="lazy" />
        <div className="promo-location-badge">
          📍 {promo.isGrouped 
            ? `${promo.availableCities.length} Lokasi Tersedia` 
            : (Array.isArray(promo.location) ? promo.location.join(', ') : promo.location)
          }
        </div>
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
 