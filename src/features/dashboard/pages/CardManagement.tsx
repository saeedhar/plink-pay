import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import CardDisplay from '../../../components/CardDisplay';
import { listCards, CardResponse, getCardFeatures, toggleCardFeature, CardFeatureResponse } from '../../../services/cardAPI';
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

const CardManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cardType, setCardType] = useState<'physical' | 'virtual'>('virtual');
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false);
  const [abroadPaymentsEnabled, setAbroadPaymentsEnabled] = useState(false);
  const [atmWithdrawalEnabled, setAtmWithdrawalEnabled] = useState(false);
  const [cardFrozen, setCardFrozen] = useState(true);
  const [featuresLoading, setFeaturesLoading] = useState(false);

  // API state
  const [allCards, setAllCards] = useState<CardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current card index for each type
  const [virtualCardIndex, setVirtualCardIndex] = useState(0);
  const [physicalCardIndex, setPhysicalCardIndex] = useState(0);
  
  // Animation direction state
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Load cards from API
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await listCards();
      setAllCards(cards);
      
      // Update freeze status for current card
      const currentCard = getCardsForTab()[getCurrentCardIndex()];
      if (currentCard) {
        setCardFrozen(currentCard.status === 'FROZEN');
      }
    } catch (err: any) {
      console.error('Failed to load cards:', err);
      setError(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  // Handle state updates from OTP verification
  useEffect(() => {
    const state = location.state as { cardFrozen?: boolean; action?: string } | null;
    if (state?.cardFrozen !== undefined) {
      setCardFrozen(state.cardFrozen);
      // Clear the state to prevent re-applying on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Get filtered cards based on type - only show ACTIVE cards (and ISSUANCE_IN_PROGRESS for physical)
  const getCardsForTab = (): CardResponse[] => {
    return allCards.filter(card => {
      // Filter by card form type first
      const matchesCardType = cardType === 'physical' 
        ? card.cardForm === 'PHYSICAL'
        : card.cardForm === 'VIRTUAL';
      
      if (!matchesCardType) {
        return false;
      }
      
      // For physical cards: show ACTIVE, FROZEN, and ISSUANCE_IN_PROGRESS
      // For virtual cards: show ACTIVE and FROZEN only
      if (cardType === 'physical') {
        return card.status === 'ACTIVE' || 
               card.status === 'FROZEN' || 
               card.status === 'ISSUANCE_IN_PROGRESS' ||
               card.status === 'REPLACEMENT_IN_PROGRESS';
      } else {
        return card.status === 'ACTIVE' || card.status === 'FROZEN';
      }
    });
  };

  const currentCards = getCardsForTab();
  const currentCardIndex = cardType === 'virtual' ? virtualCardIndex : physicalCardIndex;
  const setCurrentCardIndex = cardType === 'virtual' ? setVirtualCardIndex : setPhysicalCardIndex;
  
  const getCurrentCardIndex = () => currentCardIndex;
  
  // Navigation handlers
  const handlePreviousCard = () => {
    if (currentCards.length === 0) return;
    setSlideDirection('left');
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : currentCards.length - 1));
  };
  
  const handleNextCard = () => {
    if (currentCards.length === 0) return;
    setSlideDirection('right');
    setCurrentCardIndex((prev) => (prev < currentCards.length - 1 ? prev + 1 : 0));
  };

  // Reset card index when tab changes
  useEffect(() => {
    setVirtualCardIndex(0);
    setPhysicalCardIndex(0);
  }, [cardType]);

  // Load card features when current card changes
  const loadCardFeatures = async (cardId: string) => {
    try {
      setFeaturesLoading(true);
      const features = await getCardFeatures(cardId);
      
      // Update feature states from API response
      setNfcEnabled(features.nfcPayments?.enabled ?? false);
      setOnlinePaymentsEnabled(features.onlinePayments?.enabled ?? false);
      setAbroadPaymentsEnabled(features.abroadPayments?.enabled ?? false);
      setAtmWithdrawalEnabled(features.atmWithdrawal?.enabled ?? false);
    } catch (err: any) {
      console.error('Failed to load card features:', err);
      // Don't show error to user, just use defaults
    } finally {
      setFeaturesLoading(false);
    }
  };

  // Get current card ID
  const currentCard = currentCards[currentCardIndex];
  const currentCardId = currentCard?.id;

  // Update freeze status and load features when card changes
  useEffect(() => {
    if (currentCard) {
      setCardFrozen(currentCard.status === 'FROZEN');
      // Load features for current card
      loadCardFeatures(currentCard.id);
    } else {
      // Reset features if no card
      setNfcEnabled(false);
      setOnlinePaymentsEnabled(false);
      setAbroadPaymentsEnabled(false);
      setAtmWithdrawalEnabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCardId, cardType]);

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
                      disabled={currentCards.length <= 1}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="card-preview">
                      {loading ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          height: '100%',
                          color: '#666'
                        }}>
                          Loading cards...
                        </div>
                      ) : error ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          height: '100%',
                          color: '#d32f2f',
                          textAlign: 'center',
                          padding: '20px'
                        }}>
                          {error}
                        </div>
                      ) : currentCards.length > 0 && currentCards[currentCardIndex] ? (
                        <div 
                        key={`${cardType}-${currentCardIndex}`}
                        className={`card-image ${slideDirection ? `slide-${slideDirection}` : ''}`}
                        onAnimationEnd={() => setSlideDirection(null)}
                          style={{ width: '100%', height: '100%' }}
                        >
                          <CardDisplay card={currentCards[currentCardIndex]} />
                        </div>
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          height: '100%',
                          color: '#666',
                          textAlign: 'center',
                          padding: '20px'
                        }}>
                          No {cardType} cards available
                        </div>
                      )}
                    </div>
                    <button 
                      className="card-arrow card-arrow-right" 
                      onClick={handleNextCard}
                      aria-label="Next card"
                      disabled={currentCards.length <= 1}
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
                        onClick={() => {
                          const currentCard = currentCards[currentCardIndex];
                          if (!currentCard) return;
                          navigate('/app/services/cards/activate-physical', {
                            state: { cardId: currentCard.id }
                          });
                        }}
                        disabled={currentCards.length === 0}
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
                    onClick={() => {
                      const currentCard = currentCards[currentCardIndex];
                      if (!currentCard) return;
                      navigate('/app/services/cards/show-details/otp', {
                        state: { 
                          cardId: currentCard.id,
                          last4Digits: currentCard.last4Digits
                        }
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                    disabled={currentCards.length === 0}
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
                    onClick={() => {
                      const currentCard = currentCards[currentCardIndex];
                      if (!currentCard) return;
                      navigate('/app/services/cards/change-pin/otp', {
                        state: { cardId: currentCard.id }
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                    disabled={currentCards.length === 0}
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
                          const currentCard = currentCards[currentCardIndex];
                          if (!currentCard) return;
                          // Navigate to OTP screen with current frozen state and cardId
                          navigate('/app/services/cards/freeze/otp', {
                            state: { 
                              currentFrozenState: cardFrozen,
                              cardId: currentCard.id
                            }
                          });
                        }}
                        disabled={currentCards.length === 0}
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
                        disabled={featuresLoading || !currentCard}
                        onChange={async () => {
                          if (!currentCard) return;
                          
                          const newValue = !nfcEnabled;
                          try {
                            await toggleCardFeature(currentCard.id, 'nfc-payments', { enabled: newValue });
                            setNfcEnabled(newValue);
                          } catch (err: any) {
                            console.error('Failed to toggle NFC payments:', err);
                            // Revert on error
                          }
                        }}
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
                        disabled={featuresLoading || !currentCard}
                        onChange={async () => {
                          if (!currentCard) return;
                          
                          const newValue = !onlinePaymentsEnabled;
                          try {
                            await toggleCardFeature(currentCard.id, 'online-payments', { enabled: newValue });
                            setOnlinePaymentsEnabled(newValue);
                          } catch (err: any) {
                            console.error('Failed to toggle online payments:', err);
                            // Revert on error
                          }
                        }}
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
                        disabled={featuresLoading || !currentCard}
                        onChange={async () => {
                          if (!currentCard) return;
                          
                          const newValue = !abroadPaymentsEnabled;
                          try {
                            await toggleCardFeature(currentCard.id, 'abroad-payments', { enabled: newValue });
                            setAbroadPaymentsEnabled(newValue);
                          } catch (err: any) {
                            console.error('Failed to toggle abroad payments:', err);
                            // Revert on error
                          }
                        }}
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
                        disabled={featuresLoading || !currentCard}
                        onChange={async () => {
                          if (!currentCard) return;
                          
                          const newValue = !atmWithdrawalEnabled;
                          try {
                            await toggleCardFeature(currentCard.id, 'atm-withdrawal', { enabled: newValue });
                            setAtmWithdrawalEnabled(newValue);
                          } catch (err: any) {
                            console.error('Failed to toggle ATM withdrawal:', err);
                            // Revert on error
                          }
                        }}
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
                      const currentCard = currentCards[currentCardIndex];
                      if (!currentCard) return;
                      
                      const currentCardType = currentCard.cardType === 'MASTERCARD' 
                        ? 'mastercard' 
                        : currentCard.cardType === 'MADA' 
                        ? 'mada' 
                        : 'visa';
                      
                      navigate('/app/services/cards/report-replace', {
                        state: { 
                          originalCardType: currentCardType,
                          cardId: currentCard.id
                        }
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                    disabled={currentCards.length === 0}
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
                      const currentCard = currentCards[currentCardIndex];
                      if (!currentCard) return;
                      
                      const currentCardType = currentCard.cardType === 'MASTERCARD' 
                        ? 'mastercard' 
                        : currentCard.cardType === 'MADA' 
                        ? 'mada' 
                        : 'visa';
                      
                      navigate('/app/services/cards/stop-card', {
                        state: { 
                          originalCardType: currentCardType,
                          action: 'stop',
                          cardId: currentCard.id
                        }
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                    disabled={currentCards.length === 0}
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

