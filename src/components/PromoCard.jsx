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
    
    // 2. Kirim analitik berupa penambahan angka views ke Google Sheets 
    // Menggunakan URL Web App Google Apps Script Anda (Typo huruf kapital 'I' dan kecil 'l' sudah diperbaiki):
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzKFkflkBRgXGKsCowxpjbEDc4_SNB29IEqGKgrpMpydHvcYDdDx9B27trVAlDzQOKh/exec'; 
    // Tambahkan parameter title dari promo yang di-klik ke dalam URL
    const hitUrl = `${scriptUrl}?title=${encodeURIComponent(promo.title)}`;
    
    // "no-cors" digunakan supaya request tidak diblokir oleh sistem keamanan browser (CORS)
    fetch(hitUrl, { mode: 'no-cors' }).catch((err) => {
      console.log("Analytics error:", err);
    });
  };

  return (
    <div className="promo-card" onClick={handleCardClick}>
      <div className="promo-image-wrapper">
        <img src={promo.imageUrl} alt={promo.title} loading="lazy" />
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
