import React, { useState } from 'react';
import './CalculatorPopup.css';

const CalculatorPopup = ({ onClose, calcType = 'indodana' }) => {
  const [price, setPrice] = useState('');

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPrice(value);
  };

  const calculateInstallment = (tenor) => {
    if (!price) return 0;
    const numPrice = parseInt(price, 10);
    let adminFee = 0;
    
    // Logika perbedaan rumus berdasarkan tipe kalkulator
    if (calcType === 'indodana') {
      // Admin Indodana berbeda tiap tenor (3 bln = 3%, 6 bln = 6%, 12 bln = 12%)
      let feePercentage = 0;
      if (tenor === 3) feePercentage = 0.03;
      else if (tenor === 6) feePercentage = 0.06;
      else if (tenor === 12) feePercentage = 0.12;
      
      adminFee = numPrice * feePercentage;
    } else if (calcType === 'bca') {
      adminFee = 0; // Contoh rumus lain: Admin 0%
    }
    // Anda bisa tambahkan rumus lain di sini nanti
    
    const totalTrx = numPrice + adminFee;
    return Math.round(totalTrx / tenor);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="calc-popup-overlay" onClick={onClose}>
      <div className="calc-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="calc-popup-close" onClick={onClose}>&times;</button>
        <div className="calc-popup-header">
          <h2>{calcType === 'indodana' ? 'Kalkulator Indodana' : 'Kalkulator Cicilan'}</h2>
          <p>Hitung estimasi cicilan bulanan</p>
        </div>
        
        <div className="calc-popup-body">
          <div className="calc-input-group">
            <label>Masukkan Harga(Rp)</label>
            <input 
              type="text" 
              value={price ? new Intl.NumberFormat('id-ID').format(price) : ''}
              onChange={handlePriceChange}
              placeholder="Contoh: 5100000"
            />
          </div>

          <div className="calc-results-table">  
            <div className="calc-table-header">
              <div className="calc-col">Tenor</div>
              <div className="calc-col right">Jumlah Cicilan / Bulan</div>
            </div>
            
            <div className="calc-table-row">
              <div className="calc-col"><strong>3 Bulan</strong></div>
              <div className="calc-col right calc-amount">{formatRupiah(calculateInstallment(3))}</div>
            </div>
            
            <div className="calc-table-row">
              <div className="calc-col"><strong>6 Bulan</strong></div>
              <div className="calc-col right calc-amount">{formatRupiah(calculateInstallment(6))}</div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CalculatorPopup;
