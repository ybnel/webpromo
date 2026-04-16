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

  return (
    <div className="promo-detail-container">
      <div className="promo-detail-content">
        <div className="promo-detail-image-wrapper">
          <img src={promo.imageUrl} alt={promo.title} />
          {/* <span className="detail-badge-absolute location">
            📍 {Array.isArray(promo.location) ? promo.location.join(', ') : promo.location}
          </span> */}
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
                <div key={idx} style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {pairs.map((pair, pIdx) => (
                      <div key={pIdx}>
                        {pair.url ? (
                          <a 
                            href={pair.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`kompetisi-button color-${pIdx % 4}`}
                          >
                            {renderTextWithBold(pair.text)}
                          </a>
                        ) : (
                          <p style={{ lineHeight: '1.6', color: '#1e293b', whiteSpace: 'pre-wrap', fontWeight: '600' }}>
                            {renderTextWithBold(pair.text)}
                          </p>
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
            <button className="use-promo-button" onClick={onBack}>Back to Promo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoDetail;
