import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import config from '../config';

const QrCodePage = () => {
  const [currentQrCode, setCurrentQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loadCurrentQrCode();
  }, []);

  const loadCurrentQrCode = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/current-qr`);
      if (response.data.success) {
        setCurrentQrCode(response.data.qrCode);
      }
    } catch (error) {
      console.error('Greška pri učitavanju QR koda:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQrCode = async () => {
    try {
      setGenerating(true);
      const response = await axios.post(`${config.API_BASE_URL}/generate-qr`);
      if (response.data.success) {
        setCurrentQrCode(response.data.qrCode);
      }
    } catch (error) {
      console.error('Greška pri generisanju QR koda:', error);
      alert('Greška pri generisanju QR koda: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
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
          <div className="qr-content">
            <div className="qr-display">
              <div className="qr-image-container">
                <img 
                  src={currentQrCode.qr_image} 
                  alt="QR Code" 
                  className="qr-image" 
                />
              </div>
              
              <div className="qr-actions">
                <button 
                  className="btn btn-primary"
                  onClick={generateNewQrCode}
                  disabled={generating}
                >
                  {generating ? '⏳ Generišem...' : '🔄 Generiši Novi QR Kod'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={loadCurrentQrCode}
                >
                  🔄 Osveži
                </button>
              </div>
            </div>
            
            <div className="qr-info">
              <div className="info-section">
                <h3>📋 Informacije o QR Kodu</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value status-active">Aktivan</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Generisan:</span>
                    <span className="info-value">{formatDateTime(currentQrCode.vreme_generisanja)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Važi do:</span>
                    <span className="info-value">{formatDateTime(currentQrCode.vazeci_do)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Kod:</span>
                    <span className="info-value code">{currentQrCode.kod}</span>
                  </div>
                </div>
              </div>

              <div className="instructions-section">
                <h3>📱 Kako koristiti</h3>
                <div className="instructions-list">
                  <div className="instruction-item">
                    <span className="step-number">1</span>
                    <span className="step-text">Otvori aplikaciju na telefonu</span>
                  </div>
                  <div className="instruction-item">
                    <span className="step-number">2</span>
                    <span className="step-text">Idi na sekciju za skeniranje</span>
                  </div>
                  <div className="instruction-item">
                    <span className="step-number">3</span>
                    <span className="step-text">Skeniraj QR kod kamerom</span>
                  </div>
                  <div className="instruction-item">
                    <span className="step-number">4</span>
                    <span className="step-text">Potvrdi akciju (dolazak/odlazak/pauza)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-qr">
            <div className="no-qr-icon">⏳</div>
            <h3>Čekanje na QR kod</h3>
            <p>QR kod će se uskoro generisati automatski</p>
            <button 
              className="btn btn-primary"
              onClick={generateNewQrCode}
              disabled={generating}
            >
              {generating ? '⏳ Generišem...' : '🚀 Generiši QR Kod Odmah'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCodePage;