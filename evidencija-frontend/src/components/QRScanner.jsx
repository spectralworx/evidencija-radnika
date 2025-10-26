import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onResult, onCancel, scanType, t }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Čekaj da se komponenta mount-uje pre nego što inicijalizuješ skener
    const initializeScanner = () => {
      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
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
          if (isScanning) return;
          setIsScanning(true);
          
          setTimeout(() => {
            html5QrcodeScanner.clear().catch(() => {});
            onResult(decodedText);
            setIsScanning(false);
          }, 500);
        };

        const onScanFailure = (error) => {
          // Ignoriši uobičajene greške
          if (!error.includes('NotFoundException')) {
            console.log('Scan error:', error);
          }
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        setScanner(html5QrcodeScanner);

      } catch (error) {
        console.error('Scanner init error:', error);
      }
    };

    // Dodaj mali delay da se izbegne dupli skener
    const timer = setTimeout(initializeScanner, 100);
    
    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, []);

  const getScanTitle = () => {
    switch (scanType) {
      case 'dolazak': return t('scanForCheckIn');
      case 'odlazak': return t('scanForCheckOut');
      case 'pauza': return t('scanForBreak');
      default: return t('scanQrCode');
    }
  };

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <h2>{getScanTitle()}</h2>
      </div>
      
      <div className="scanner-content">
        <div id="qr-reader"></div>
        
        <div className="scanner-instructions">
          <p>📱 {t('positionQrCode')}</p>
          <p>💡 {t('allowCameraAccess')}</p>
          <p>⏱️ {t('scanAutomatically')}</p>
        </div>

        <div className="scanner-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            ❌ {t('cancel')}
          </button>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            🔄 {t('restartCamera')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;