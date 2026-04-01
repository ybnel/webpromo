import React from 'react';
import './PromoDetail.css';

const PromoDetail = ({ promo, onBack }) => {
  if (!promo) return null;

  const endDate = new Date(promo.endDate);

  return (
    <div className="promo-detail-container">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="promo-detail-content">
        <div className="promo-detail-image-wrapper">
          <img src={promo.imageUrl} alt={promo.title} />
          <div className="detail-tags">
            <span className="detail-badge location">📍 {Array.isArray(promo.location) ? promo.location.join(', ') : promo.location}</span>
            <span className="detail-badge validity">
              Valid until {endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="promo-detail-info">
          <h1>{promo.title}</h1>
          <p className="detail-description">{promo.description}</p>

          <div className="tnc-section">
            <h3>Terms and Conditions</h3>
            {promo.termsAndConditions && promo.termsAndConditions.length > 0 ? (
              <ul>
                {promo.termsAndConditions.map((tnc, index) => (
                  <li key={index}>{tnc}</li>
                ))}
              </ul>
            ) : (
              <p>No specific terms and conditions.</p>
            )}
          </div>

          {promo.contoh && (
            <div className="tnc-section" style={{ backgroundColor: '#fdf8f6', borderColor: '#fed7aa' }}>
              <h3>How It Works / Example</h3>
              <p style={{ marginTop: '0.75rem', lineHeight: '1.6', color: '#475569' }}>
                {promo.contoh.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
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
