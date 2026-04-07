import React from 'react';
import './PromoDetail.css';

const PromoDetail = ({ promo, onBack }) => {
  if (!promo) return null;

  const endDate = new Date(promo.endDate);

  // Kumpulkan semua note yang tersedia
  const notesRaw = [promo.note1, promo.note2, promo.note3].filter(n => n && typeof n === 'string' && n.trim().length > 0);

  // Fungsi untuk mem-parse `**kata**` menjadi bold/strong
  const renderTextWithBold = (text) => {
    // 1. Amankan tag HTML agar mencegah XSS
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // 2. Ganti **kata** menjadi <strong>kata</strong>
    const htmlText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return <span dangerouslySetInnerHTML={{ __html: htmlText }} />;
  };

  return (
    <div className="promo-detail-container">
      <div className="promo-detail-content">
        <div className="promo-detail-image-wrapper">
          <img src={promo.imageUrl} alt={promo.title} />
          <span className="detail-badge-absolute location">
            📍 {Array.isArray(promo.location) ? promo.location.join(', ') : promo.location}
          </span>
          <span className="detail-badge-absolute validity">
            Valid until {endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="promo-detail-info">
          <h1>{promo.title}</h1>
          <p className="detail-description">{promo.description}</p>

          {notesRaw.map((noteText, idx) => {
            const lines = noteText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length === 0) return null;
            
            const itemTitle = lines[0];
            const itemContent = lines.slice(1).join('\n');
            const isAlternate = idx % 2 !== 0; // Untuk membedakan warna antar box jika ada banyak

            return (
              <div key={idx} className="tnc-section" style={isAlternate ? { backgroundColor: '#fdf8f6', borderColor: '#fed7aa' } : {}}>
                <h3>{itemTitle}</h3>
                {itemContent && (
                  <p style={{ marginTop: '0.75rem', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-wrap' }}>
                    {renderTextWithBold(itemContent)}
                  </p>
                )}
              </div>
            );
          })}

          {notesRaw.length === 0 && (
             <div className="tnc-section">
                <h3>Informasi</h3>
                <p>Tidak ada informasi tambahan.</p>
             </div>
          )}

          <div className="action-section">
            <button className="use-promo-button" onClick={onBack}>Back to Promos</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoDetail;
