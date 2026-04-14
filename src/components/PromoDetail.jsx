import React from 'react';
import './PromoDetail.css';

const PromoDetail = ({ promo, onBack }) => {
  if (!promo) return null;

  const endDate = new Date(promo.endDate);

  // Kumpulkan semua note yang tersedia beserta ID-nya
  const notesList = [
    { id: 'note1', content: promo.note1 },
    { id: 'note2', content: promo.note2 },
    { id: 'note3', content: promo.note3 }
  ].filter(n => n.content && typeof n.content === 'string' && n.content.trim().length > 0);

  // Fungsi untuk mem-parse `**kata**` menjadi bold/strong
  const renderTextWithBold = (text) => {
    if (!text) return '';
    // 1. Amankan tag HTML agar mencegah XSS
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // 2. Ganti **kata** menjadi <strong>kata</strong>
    const htmlText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return <span dangerouslySetInnerHTML={{ __html: htmlText }} />;
  };

  const isRetention = promo.kategori === 'Retention Student';
  
  const labelStyle = isRetention 
    ? { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' } // Orange theme
    : { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }; // Blue theme
    
  const finalLabelStyle = {
    padding: '0.6rem 1.25rem',
    borderRadius: '12px',
    display: 'inline-block',
    fontWeight: '700',
    fontSize: '0.95rem',
    ...labelStyle
  };

  return (
    <div className="promo-detail-container">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={finalLabelStyle}>
          🏷️ Promo Khusus {promo.kategori === 'Keduanya' ? 'Semua Kategori' : promo.kategori}
        </div>
      </div>
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
          <p className="detail-description">{renderTextWithBold(promo.description)}</p>

          {notesList.map((note, idx) => {
            const lines = note.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length === 0) return null;
            
            const isAlternate = idx % 2 !== 0; // Untuk membedakan warna antar box jika ada banyak

            // KHUSUS NOTE 3: Render Pasangan Teks (Ganjil) dan Tombol Link (Genap)
            if (note.id === 'note3') {
              const pairs = [];
              for (let i = 0; i < lines.length; i += 2) {
                pairs.push({ text: lines[i], url: lines[i+1] || '' });
              }

              return (
                <div key={idx} className="tnc-section" style={isAlternate ? { backgroundColor: '#fdf8f6', borderColor: '#fed7aa' } : {}}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {pairs.map((pair, pIdx) => (
                      <div key={pIdx}>
                        <p style={{ lineHeight: '1.6', color: '#1e293b', whiteSpace: 'pre-wrap', fontWeight: '600', marginBottom: pair.url ? '1.25rem' : '0' }}>
                          {renderTextWithBold(pair.text)}
                        </p>
                        {pair.url && (
                          <a 
                            href={pair.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="kompetisi-button"
                          >
                            More Info
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // NOTE 1 & 2 NORMAL
            const itemTitle = lines[0];
            const itemContent = lines.slice(1).join('\n');

            return (
              <div key={idx} className="tnc-section" style={isAlternate ? { backgroundColor: '#fdf8f6', borderColor: '#fed7aa' } : {}}>
                <h3>{renderTextWithBold(itemTitle)}</h3>
                {itemContent && (
                  <p style={{ marginTop: '0.75rem', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-wrap' }}>
                    {renderTextWithBold(itemContent)}
                  </p>
                )}
              </div>
            );
          })}

          {notesList.length === 0 && (
             <div className="tnc-section">
                <h3>Informasi</h3>
                <p>Tidak ada informasi tambahan.</p>
             </div>
          )}

          <div className="action-section" style={{ marginTop: '2rem' }}>
            <button className="use-promo-button" onClick={onBack}>Back to Promos</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoDetail;
