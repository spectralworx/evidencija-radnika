import React, { useEffect, useState } from 'react';

const QRScanner = ({ onResult, onCancel, scanType, t }) => {
  const [cameraError, setCameraError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeScanner();
  }, []);

  const initializeScanner = async () => {
    try {
      // Proveri da li postoji Html5QrcodeScanner
      if (typeof window === 'undefined' || !window.Html5QrcodeScanner) {
        console.error('QR Scanner library not loaded');
        setCameraError(true);
        setIsInitializing(false);
        return;
      }

      const { Html5QrcodeScanner } = window;
      
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        false
      );

      const onScanSuccess = (decodedText) => {
        console.log('QR Code scanned:', decodedText);
        scanner.clear().catch(console.error);
        onResult(decodedText);
      };

      const onScanFailure = (error) => {
        // Ignoriši uobičajene greške skeniranja
        if (!error || error.includes('NotFoundException')) {
          return;
        }
        console.log('Scan error:', error);
      };

      await scanner.render(onScanSuccess, onScanFailure);
      setIsInitializing(false);
      
    } catch (error) {
      console.error('Scanner initialization failed:', error);
      setCameraError(true);
      setIsInitializing(false);
    }
  };

  const getScanTitle = () => {
    switch (scanType) {
      case 'dolazak': return 'Skeniraj QR kod za dolazak';
      case 'odlazak': return 'Skeniraj QR kod za odlazak';
      case 'pauza': return 'Skeniraj QR kod za pauzu';
      default: return 'Skeniraj QR kod';
    }
  };

  const handleManualInput = () => {
    const qrCode = prompt('Unesite QR kod ručno:');
    if (qrCode && qrCode.trim()) {
      onResult(qrCode.trim());
    }
  };

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <button className="btn btn-secondary back-btn" onClick={onCancel}>
          ← Nazad
        </button>
        <h2>{getScanTitle()}</h2>
      </div>
      
      <div className="scanner-content">
        {isInitializing && (
          <div className="scanner-loading">
            <div className="loading-spinner"></div>
            <p>Pokrećem kameru...</p>
          </div>
        )}

        {cameraError && (
          <div className="camera-error">
            <div className="error-icon">📷❌</div>
            <h3>Kamera nije dostupna</h3>
            <p>Problem sa pristupom kameri. Proverite dozvolu za kameru ili pokušajte ručni unos.</p>
            <button className="btn btn-primary" onClick={handleManualInput}>
              🔤 Ručni unos QR koda
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              🔄 Pokušaj ponovo
            </button>
          </div>
        )}

        {!cameraError && (
          <>
            <div id="qr-reader" className="qr-reader-container"></div>
            
            <div className="scanner-instructions">
              <div className="instruction-item">
                <span className="instruction-icon">📱</span>
                <span>Postavite QR kod unutar okvira</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">💡</span>
                <span>Dozvolite pristup kameri</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏱️</span>
                <span>Skeniranje je automatsko</span>
              </div>
            </div>

            <div className="scanner-actions">
              <button className="btn btn-secondary" onClick={handleManualInput}>
                🔤 Ručni unos
              </button>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                🔄 Restart kamere
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QRScanner;