import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import eyeIcon from '../../../assets/card-service/eye.svg';
import pinIcon from '../../../assets/card-service/pin.svg';
import changePinIcon from '../../../assets/card-service/change-pin.svg';
import freezeCardIcon from '../../../assets/card-service/freeze-card.svg';
import nfcIcon from '../../../assets/card-service/NFC.svg';
import onlineIcon from '../../../assets/card-service/online.svg';
import airplaneIcon from '../../../assets/card-service/AirplaneIcon.svg';
import atmIcon from '../../../assets/card-service/ATM.svg';
import replaceIcon from '../../../assets/card-service/replace.svg';
import stopIcon from '../../../assets/card-service/stop.svg';
import applePayIcon from '../../../assets/topup/apple-pay.svg';
import masterCardIcon from '../../../assets/topup/cards/master-card.svg';
import visaMadaIcon from '../../../assets/topup/cards/visa-mada.svg';
import visaIcon from '../../../assets/topup/cards/visa.svg';

const CardManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cardType, setCardType] = useState<'physical' | 'virtual'>('virtual');
  const [nfcEnabled, setNfcEnabled] = useState(true);
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false);
  const [abroadPaymentsEnabled, setAbroadPaymentsEnabled] = useState(false);
  const [atmWithdrawalEnabled, setAtmWithdrawalEnabled] = useState(false);
  const [cardFrozen, setCardFrozen] = useState(true);

  // Handle state updates from OTP verification
  useEffect(() => {
    const state = location.state as { cardFrozen?: boolean; action?: string } | null;
    if (state?.cardFrozen !== undefined) {
      setCardFrozen(state.cardFrozen);
      // Clear the state to prevent re-applying on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Card arrays for carousel
  const virtualCards = [visaMadaIcon, visaIcon, visaMadaIcon];
  const physicalCards = [masterCardIcon, visaMadaIcon, masterCardIcon];
  
  // Current card index for each type
  const [virtualCardIndex, setVirtualCardIndex] = useState(0);
  const [physicalCardIndex, setPhysicalCardIndex] = useState(0);
  
  // Get current cards based on type
  const currentCards = cardType === 'virtual' ? virtualCards : physicalCards;
  const currentCardIndex = cardType === 'virtual' ? virtualCardIndex : physicalCardIndex;
  const setCurrentCardIndex = cardType === 'virtual' ? setVirtualCardIndex : setPhysicalCardIndex;
  
  // Animation direction state
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  
  // Navigation handlers
  const handlePreviousCard = () => {
    setSlideDirection('left');
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : currentCards.length - 1));
  };
  
  const handleNextCard = () => {
    setSlideDirection('right');
    setCurrentCardIndex((prev) => (prev < currentCards.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>

          <div className="card-management-layout">
            {/* Left Container: Card Management */}
            <div className="card-management-left">
              <div className="card-management-wrapper">
                <h2 className="card-section-title">Card Management</h2>
                <div className="card-management-section">
                  {/* Card Type Selector */}
                <div className="card-type-selector">
                  <button
                    className={`card-type-button ${cardType === 'physical' ? 'active' : ''}`}
                    onClick={() => setCardType('physical')}
                  >
                    Physical card
                  </button>
                  <button
                    className={`card-type-button ${cardType === 'virtual' ? 'active' : ''}`}
                    onClick={() => setCardType('virtual')}
                  >
                    Virtual card
                  </button>
                </div>

                {/* Card Display */}
                <div className="card-display-container">
                  <div className="card-display-inner">
                    <button 
                      className="card-arrow card-arrow-left" 
                      onClick={handlePreviousCard}
                      aria-label="Previous card"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="card-preview">
                      <img 
                        key={`${cardType}-${currentCardIndex}`}
                        src={currentCards[currentCardIndex]} 
                        alt={`${cardType === 'virtual' ? 'Virtual' : 'Physical'} Card ${currentCardIndex + 1}`}
                        className={`card-image ${slideDirection ? `slide-${slideDirection}` : ''}`}
                        onAnimationEnd={() => setSlideDirection(null)}
                      />
                    </div>
                    <button 
                      className="card-arrow card-arrow-right" 
                      onClick={handleNextCard}
                      aria-label="Next card"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  {cardType === 'virtual' ? (
                    <button 
                      className="request-card-button"
                      onClick={() => navigate('/app/services/cards/request-virtual')}
                    >
                      Request Virtual Card
                    </button>
                  ) : (
                    <div className="physical-card-buttons">
                      <button 
                        className="request-card-button"
                        onClick={() => navigate('/app/services/cards/request-physical')}
                      >
                        Request Physical Card
                      </button>
                      <button 
                        className="request-card-button request-card-button-activation"
                        onClick={() => navigate('/app/services/cards/activate-physical')}
                      >
                        <span>Request Physical</span>
                        <span>Card Activation</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="card-actions">
                  <div 
                    className="card-action-item"
                    onClick={() => navigate('/app/services/cards/show-details/otp')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-action-icon">
                      <img src={eyeIcon} alt="Show Card Details" />
                    </div>
                    <span className="card-action-text">Show Card Details</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                    </svg>
                  </div>
                  <div 
                    className="card-action-item"
                    onClick={() => navigate('/app/services/cards/display-pin/otp')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-action-icon">
                      <img src={pinIcon} alt="Display Card PIN" />
                    </div>
                    <span className="card-action-text">Display Card PIN</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                    </svg>
                  </div>
                  <div 
                    className="card-action-item"
                    onClick={() => navigate('/app/services/cards/change-pin/otp')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-action-icon">
                      <img src={changePinIcon} alt="Change Card PIN" />
                    </div>
                    <span className="card-action-text">Change Card PIN</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                    </svg>
                  </div>
                  <div className="card-action-item">
                    <div className="card-action-icon">
                      <img src={freezeCardIcon} alt={cardFrozen ? "Unfreeze Card" : "Freeze Card"} />
                    </div>
                    <span className="card-action-text">{cardFrozen ? "Unfreeze Card" : "Freeze Card"}</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={!cardFrozen}
                        onChange={() => {
                          // Navigate to OTP screen with current frozen state
                          navigate('/app/services/cards/freeze/otp', {
                            state: { currentFrozenState: cardFrozen }
                          });
                        }}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Right Container: Two Sections */}
            <div className="card-management-right">
              {/* Top Right: Card Control */}
              <div className="card-control-wrapper">
                <h2 className="card-section-title">Card Control</h2>
                <div className="card-control-section">
                  <div className="card-control-list">
                  <div className="card-control-item">
                    <div className="card-control-content">
                      <div className="card-control-icon">
                        <img src={nfcIcon} alt="NFC Payments" />
                      </div>
                      <div className="card-control-info">
                        <span className="card-control-title">NFC Payments</span>
                        <span className="card-control-description">Enable or disable contactless payments for your card.</span>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={nfcEnabled}
                        onChange={() => setNfcEnabled(!nfcEnabled)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="card-item-divider"></div>
                  </div>

                  <div className="card-control-item">
                    <div className="card-control-content">
                      <div className="card-control-icon">
                        <img src={onlineIcon} alt="Online Payments" />
                      </div>
                      <div className="card-control-info">
                        <span className="card-control-title">Online Payments</span>
                        <span className="card-control-description">Enable or disable online payments for your card.</span>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={onlinePaymentsEnabled}
                        onChange={() => setOnlinePaymentsEnabled(!onlinePaymentsEnabled)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="card-item-divider"></div>
                  </div>

                  <div className="card-control-item">
                    <div className="card-control-content">
                      <div className="card-control-icon">
                        <img src={airplaneIcon} alt="Abroad Payments" />
                      </div>
                      <div className="card-control-info">
                        <span className="card-control-title">Abroad Payments</span>
                        <span className="card-control-description">Enable or disable abroad payments for your card.</span>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={abroadPaymentsEnabled}
                        onChange={() => setAbroadPaymentsEnabled(!abroadPaymentsEnabled)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="card-item-divider"></div>
                  </div>

                  <div className="card-control-item">
                    <div className="card-control-content">
                      <div className="card-control-icon">
                        <img src={atmIcon} alt="ATM Withdrawal" />
                      </div>
                      <div className="card-control-info">
                        <span className="card-control-title">ATM Withdrawal</span>
                        <span className="card-control-description">Enable or disable ATM withdrawals.</span>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={atmWithdrawalEnabled}
                        onChange={() => setAtmWithdrawalEnabled(!atmWithdrawalEnabled)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  </div>
                </div>
              </div>

              {/* Bottom Right: Other Services */}
              <div className="other-services-wrapper">
                <h2 className="card-section-title">Other Services</h2>
                <div className="other-services-section">
                  <div className="other-services-list">
                  <div 
                    className="other-service-item"
                    onClick={() => {
                      // Determine the current card type based on the selected card
                      // For now, we'll use a default or get it from the current card
                      // TODO: Get actual card type from API or card selection
                      const currentCardType = cardType === 'physical' 
                        ? (physicalCardIndex === 0 ? 'mastercard' : 'mada') // Simplified logic
                        : 'mada'; // Default for virtual
                      
                      navigate('/app/services/cards/report-replace', {
                        state: { originalCardType: currentCardType }
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="other-service-icon">
                      <img src={replaceIcon} alt="Report & Replace Card" />
                    </div>
                    <span className="other-service-text">Report & Replace Card</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                    </svg>
                    <div className="card-item-divider"></div>
                  </div>
                  <div 
                    className="other-service-item"
                    onClick={() => {
                      // Determine the current card type based on the selected card
                      const currentCardType = cardType === 'physical' 
                        ? (physicalCardIndex === 0 ? 'mastercard' : 'mada')
                        : 'mada';
                      
                      navigate('/app/services/cards/stop-card', {
                        state: { 
                          originalCardType: currentCardType,
                          action: 'stop'
                        }
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="other-service-icon">
                      <img src={stopIcon} alt="Stop Card" />
                    </div>
                    <span className="other-service-text">Stop Card</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                    </svg>
                    <div className="card-item-divider"></div>
                  </div>
                  <div className="other-service-item">
                    <div className="other-service-icon-apple">
                      <img src={applePayIcon} alt="Payment & Apple Pay" />
                    </div>
                    <span className="other-service-text">Payment & Apple Pay</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                    </svg>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardManagement;

