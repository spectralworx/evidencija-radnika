import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const QrCodePage = () => {
  const [currentQrCode, setCurrentQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadCurrentQrCode();
  }, []);

  const loadCurrentQrCode = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/current-qr');
      if (response.data.success) {
        setCurrentQrCode(response.data.qrCode);
        
        // DEBUG informacije
        console.log('🔍 QR Code Debug:');
        console.log('Vazeci do (raw):', response.data.qrCode.vazeci_do);
        console.log('Vazeci do (Srbija):', formatDateTime(response.data.qrCode.vazeci_do));
      }
    } catch (error) {
      console.error('Greška pri učitavanju QR koda:', error);
    } finally {
      setLoading(false);
    }
  };

  // ISPRAVNA funkcija za formatiranje datuma
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Koristi Europe/Belgrade timezone (Srbija)
      return date.toLocaleString('sr-RS', {
        timeZone: 'Europe/Belgrade',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Greška pri formatiranju datuma:', error);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="qr-code-page loading">
        <div className="loading-spinner">⏳</div>
        <p>Učitavam QR kod...</p>
      </div>
    );
  }

  return (
    <div className="qr-code-page">
      <div className="qr-container">
        <header className="qr-header">
          <h1>🔷 QR Kod za Evidenciju</h1>
          <p>Skenirajte QR kod aplikacijom za evidenciju dolazaka i odlazaka</p>
        </header>

        {currentQrCode ? (
          <div className="qr-content-simple">
            <div className="qr-display-simple">
              <div className="qr-image-container-large">
                <img 
                  src={currentQrCode.qr_image} 
                  alt="QR Code" 
                  className="qr-image-large" 
                />
              </div>
            </div>
            
            <div className="qr-info-simple">
              <div className="info-item-simple">
                <span className="info-label">QR Kod:</span>
                <span className="info-value">Aktivan</span>
              </div>
              <div className="info-item-simple">
                <span className="info-label">Automatska promena:</span>
                <span className="info-value">Nasumično</span>
              </div>
              
              
            </div>
          </div>
        ) : (
          <div className="no-qr">
            <div className="no-qr-icon">⏳</div>
            <h3>Čekanje na QR kod</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCodePage;