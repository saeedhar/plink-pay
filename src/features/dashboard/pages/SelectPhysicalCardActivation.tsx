import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import physicalCardIcon from '../../../assets/card-service/physical-card.svg';
import nfcIcon from '../../../assets/card-service/NFC.svg';
import manualActiveIcon from '../../../assets/card-service/manual-active.svg';
import warningIcon from '../../../assets/warning.svg';
import NFCNotSupportedModal from '../../../components/modals/NFCNotSupportedModal';
import '../../../styles/dashboard.css';

type ActivationMethod = 'nfc' | 'manual';

// Check if NFC is supported in the browser
const checkNFCSupport = (): boolean => {
  // Check for Web NFC API support
  if (typeof window !== 'undefined' && 'NDEFReader' in window) {
    return true;
  }
  // Also check for older API
  if (typeof navigator !== 'undefined' && 'nfc' in navigator) {
    return true;
  }
  return false;
};

const SelectPhysicalCardActivation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { cardId?: string } | null;
  const cardId = state?.cardId;
  const [selectedMethod, setSelectedMethod] = useState<ActivationMethod>('nfc');
  const [showNFCNotSupportedModal, setShowNFCNotSupportedModal] = useState(false);

  const handleCancel = () => {
    navigate('/app/services/cards');
  };

  const handleContinue = () => {
    if (!cardId) {
      // If no cardId, navigate back to cards
      navigate('/app/services/cards');
      return;
    }

    if (selectedMethod === 'nfc') {
      // Check if NFC is supported
      const isNFCSupported = checkNFCSupport();
      if (isNFCSupported) {
        // Navigate to NFC activation screen
        navigate('/app/services/cards/activate-physical/nfc', {
          state: { cardId }
        });
      } else {
        // Show modal that NFC is not supported
        setShowNFCNotSupportedModal(true);
      }
    } else {
      // Navigate to manual activation screen
      navigate('/app/services/cards/activate-physical/manual', {
        state: { cardId }
      });
    }
  };

  const handleContinueToManual = () => {
    setShowNFCNotSupportedModal(false);
    navigate('/app/services/cards/activate-physical/manual', {
      state: { cardId }
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="select-physical-card-activation-screen">
            <div className="select-physical-card-activation-container">
              {/* Card Icon */}
              <div className="select-physical-card-activation-icon">
                <img src={physicalCardIcon} alt="Card" />
              </div>

              {/* Title */}
              <h2 className="select-physical-card-activation-title">
                Select Physical Card Activation
              </h2>

              {/* Warning Alert */}
              <div className="select-physical-card-activation-warning">
                <img src={warningIcon} alt="Warning" className="select-physical-card-activation-warning-icon" />
                <p className="select-physical-card-activation-warning-text">
                  Please have your card with you before continuing.
                </p>
              </div>

              {/* Sub-heading */}
              <h3 className="select-physical-card-activation-subheading">
                Choose activation method:
              </h3>

              {/* Activation Methods */}
              <div className="select-physical-card-activation-methods">
                {/* NFC Activation */}
                <div 
                  className={`select-physical-card-activation-method ${selectedMethod === 'nfc' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('nfc')}
                >
                  <div className="select-physical-card-activation-method-icon">
                    <img src={nfcIcon} alt="NFC" />
                  </div>
                  <div className="select-physical-card-activation-method-content">
                    <span className="select-physical-card-activation-method-title">NFC Activation</span>
                    <span className="select-physical-card-activation-method-description">
                      Activate your card instantly using NFC.
                    </span>
                  </div>
                  <div className="select-physical-card-activation-radio">
                    {selectedMethod === 'nfc' ? (
                      <div className="select-physical-card-activation-radio-filled"></div>
                    ) : null}
                  </div>
                </div>

                {/* Manual Activation */}
                <div 
                  className={`select-physical-card-activation-method ${selectedMethod === 'manual' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('manual')}
                >
                  <div className="select-physical-card-activation-method-icon">
                    <img src={manualActiveIcon} alt="Manual" />
                  </div>
                  <div className="select-physical-card-activation-method-content">
                    <span className="select-physical-card-activation-method-title">Manual Activation</span>
                    <span className="select-physical-card-activation-method-description">
                      Enter the last 4 digits of your card.
                    </span>
                  </div>
                  <div className="select-physical-card-activation-radio">
                    {selectedMethod === 'manual' ? (
                      <div className="select-physical-card-activation-radio-filled"></div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="select-physical-card-activation-buttons">
                <button 
                  className="select-physical-card-activation-button select-physical-card-activation-button-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  className="select-physical-card-activation-button select-physical-card-activation-button-continue"
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFC Not Supported Modal */}
      <NFCNotSupportedModal
        isOpen={showNFCNotSupportedModal}
        onClose={() => setShowNFCNotSupportedModal(false)}
        onContinueToManual={handleContinueToManual}
      />
    </div>
  );
};

export default SelectPhysicalCardActivation;

