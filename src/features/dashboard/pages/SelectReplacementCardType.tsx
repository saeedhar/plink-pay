import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardIcon from '../../../assets/card-service/physical-card.svg';
import '../../../styles/card-management.css';

type CardType = 'virtual' | 'physical';

const SelectReplacementCardType: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { reason: string; originalCardType?: 'mada' | 'mastercard'; action?: 'replace' | 'stop' } | null;
  const action = state?.action || 'replace';
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(null);

  const handleBack = () => {
    const route = action === 'stop' 
      ? '/app/services/cards/stop-card'
      : '/app/services/cards/report-replace';
    navigate(route, {
      state: { 
        originalCardType: state?.originalCardType,
        action
      }
    });
  };

  const handleContinue = () => {
    if (!selectedCardType) {
      // TODO: Show error message
      return;
    }
    
    if (action === 'stop') {
      // For stop card, navigate to OTP screen
      const otpRoute = action === 'stop'
        ? '/app/services/cards/stop-card/otp'
        : '/app/services/cards/report-replace/otp';
      
      navigate(otpRoute, { 
        state: { 
          reason: state?.reason, 
          cardType: selectedCardType,
          originalCardType: state?.originalCardType,
          action
        } 
      });
    } else if (selectedCardType === 'physical') {
      // For physical card replacement, skip card type selection and go directly to fee screen
      // Use the original card's type (default to 'mada' if not provided)
      const cardType = state?.originalCardType || 'mada';
      navigate('/app/services/cards/request-physical/fee', {
        state: {
          cardType: cardType,
          source: 'card-replacement',
          reason: state?.reason
        }
      });
    } else {
      // For virtual card replacement, navigate to OTP screen
      navigate('/app/services/cards/report-replace/otp', { 
        state: { 
          reason: state?.reason, 
          cardType: selectedCardType,
          action
        } 
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
          
          <div className="select-replacement-card-type-screen">
            <div className="select-replacement-card-type-container">
              {/* Header */}
              <div className="select-replacement-card-type-header">
                <div className="select-replacement-card-type-icon">
                  <img src={cardIcon} alt="Card" />
                </div>
                <h2 className="select-replacement-card-type-title">
                  {action === 'stop' ? 'Select Card Type' : 'Select Replacement Card Type'}
                </h2>
                <p className="select-replacement-card-type-description">
                  {action === 'stop'
                    ? 'Please select the type of card you would like to stop (Virtual or Physical).'
                    : 'Please select the type of replacement card you would like to receive (Virtual or Physical).'}
                </p>
              </div>

              {/* Card Type Options */}
              <div className="select-replacement-card-type-options">
                <div 
                  className={`select-replacement-card-type-option ${selectedCardType === 'virtual' ? 'selected' : ''}`}
                  onClick={() => setSelectedCardType('virtual')}
                >
                  <div className="select-replacement-card-type-option-icon">
                    <img src={cardIcon} alt="Virtual Card" />
                  </div>
                  <span className="select-replacement-card-type-option-label">
                    {action === 'stop' ? 'Virtual Card' : 'Request Virtual Card'}
                  </span>
                </div>

                <div 
                  className={`select-replacement-card-type-option ${selectedCardType === 'physical' ? 'selected' : ''}`}
                  onClick={() => setSelectedCardType('physical')}
                >
                  <div className="select-replacement-card-type-option-icon">
                    <img src={cardIcon} alt="Physical Card" />
                  </div>
                  <span className="select-replacement-card-type-option-label">
                    {action === 'stop' ? 'Physical Card' : 'Request Physical Card'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="select-replacement-card-type-actions">
                <button 
                  className="select-replacement-card-type-back-button"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="select-replacement-card-type-continue-button"
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

export default SelectReplacementCardType;

