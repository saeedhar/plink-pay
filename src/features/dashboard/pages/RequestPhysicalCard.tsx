import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import madaIcon from '../../../assets/card-service/mada.svg';
import mastercardLogoIcon from '../../../assets/topup/cards/mastercard-logo.svg';
import requestIcon from '../../../assets/card-service/request.svg';
import '../../../styles/dashboard.css';

const RequestPhysicalCard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCardType, setSelectedCardType] = useState<'mada' | 'mastercard' | null>(null);

  const handleBack = () => {
    navigate('/app/services/cards');
  };

  const handleContinue = () => {
    if (selectedCardType) {
      navigate('/app/services/cards/request-physical/fee', {
        state: { cardType: selectedCardType }
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="request-virtual-card-screen">
            <div className="request-virtual-card-container">
              <div className="request-virtual-card-header">
                <div className="request-virtual-card-icon">
                  <img src={requestIcon} alt="Request" />
                </div>
                <h2 className="request-virtual-card-title">Select Physical Card Type</h2>
                <p className="request-virtual-card-description">
                  Choose the type of physical card you'd like to request.
                </p>
              </div>
              
              <div className="request-virtual-card-options">
                <div 
                  className={`request-virtual-card-option ${selectedCardType === 'mada' ? 'selected' : ''}`}
                  onClick={() => setSelectedCardType('mada')}
                >
                  <img src={madaIcon} alt="Mada" className="request-virtual-card-option-icon" />
                  <span className="request-virtual-card-option-text">Mada Physical Card</span>
                </div>
                
                <div 
                  className={`request-virtual-card-option ${selectedCardType === 'mastercard' ? 'selected' : ''}`}
                  onClick={() => setSelectedCardType('mastercard')}
                >
                  <img src={mastercardLogoIcon} alt="Mastercard" className="request-virtual-card-option-icon" />
                  <span className="request-virtual-card-option-text">Master Card Physical Card</span>
                </div>
              </div>
              
              <div className="request-virtual-card-actions">
                <button 
                  className="request-virtual-card-back-button"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="request-virtual-card-continue-button"
                  onClick={handleContinue}
                  disabled={!selectedCardType}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPhysicalCard;

