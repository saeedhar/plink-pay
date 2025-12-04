import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import nfcActivationIcon from '../../../assets/card-service/nfc-activition.svg';
import wifiIcon from '../../../assets/card-service/wifi.svg';
import '../../../styles/dashboard.css';

const NFCActivation: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScanning = () => {
    setIsScanning(true);
    // TODO: Implement NFC scanning logic
    // This would typically use Web NFC API or communicate with backend
    console.log('Starting NFC scan...');
    
    // Simulate scanning process, then navigate to success
    setTimeout(() => {
      navigate('/app/services/cards/activate-physical/success');
    }, 2000);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="nfc-activation-screen">
            {/* Heading - Above container */}
            <h2 className="nfc-activation-heading">
              NFC Card Activation
            </h2>

            {/* Instructions - Above container */}
            <p className="nfc-activation-instruction">
              Hold your card close to the back of your device to activate.
            </p>

            {/* White Container */}
            <div className="nfc-activation-container">
              {/* NFC Icon */}
              <div className="nfc-activation-icon-container">
                <img src={nfcActivationIcon} alt="NFC Activation" className="nfc-activation-icon" />
              </div>

              {/* Ready to Scan Status */}
              <p className="nfc-activation-status">
                Ready to Scan
              </p>

              {/* Additional Instruction */}
              <p className="nfc-activation-sub-instruction">
                Click the button below to start scanning your card
              </p>

              {/* Start Scanning Button */}
              <button 
                className="nfc-activation-button"
                onClick={handleStartScanning}
                disabled={isScanning}
              >
                <img src={wifiIcon} alt="WiFi" className="nfc-activation-button-icon" />
                <span>Start Scanning</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFCActivation;

