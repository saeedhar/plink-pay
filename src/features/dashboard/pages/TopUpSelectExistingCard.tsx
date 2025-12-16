import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import CardDisplay from '../../../components/CardDisplay';
import { listCards, CardResponse } from '../../../services/cardAPI';
import cardHeaderIcon from '../../../assets/topup/card.svg';

const TopUpSelectExistingCard: React.FC = () => {
  const navigate = useNavigate();
  const [cardType, setCardType] = useState<'physical' | 'virtual'>('virtual');
  const [allCards, setAllCards] = useState<CardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [virtualCardIndex, setVirtualCardIndex] = useState(0);
  const [physicalCardIndex, setPhysicalCardIndex] = useState(0);
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
    } catch (err: any) {
      console.error('Failed to load cards:', err);
      setError(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  // Get filtered cards based on type - only show ACTIVE cards (and ISSUANCE_IN_PROGRESS for physical)
  const getCardsForTab = (): CardResponse[] => {
    if (cardType === 'physical') {
      // For physical cards: show ACTIVE, FROZEN, ISSUANCE_IN_PROGRESS, REPLACEMENT_IN_PROGRESS
      return allCards.filter(card => 
        card.cardForm === 'PHYSICAL' && 
        (card.status === 'ACTIVE' || 
         card.status === 'FROZEN' || 
         card.status === 'ISSUANCE_IN_PROGRESS' || 
         card.status === 'REPLACEMENT_IN_PROGRESS')
      );
    } else {
      // For virtual cards: show ACTIVE and FROZEN only
      return allCards.filter(card => 
        card.cardForm === 'VIRTUAL' && 
        (card.status === 'ACTIVE' || card.status === 'FROZEN')
      );
    }
  };

  const currentCards = getCardsForTab();
  const currentCardIndex = cardType === 'virtual' ? virtualCardIndex : physicalCardIndex;
  const setCurrentCardIndex = cardType === 'virtual' ? setVirtualCardIndex : setPhysicalCardIndex;
  const currentCard = currentCards[currentCardIndex] || null;

  // Reset index when card type changes
  useEffect(() => {
    setCurrentCardIndex(0);
  }, [cardType, setCurrentCardIndex]);

  const handlePreviousCard = () => {
    if (currentCards.length === 0) return;
    const newIndex = currentCardIndex > 0 ? currentCardIndex - 1 : currentCards.length - 1;
    setSlideDirection('right');
    setCurrentCardIndex(newIndex);
  };

  const handleNextCard = () => {
    if (currentCards.length === 0) return;
    const newIndex = currentCardIndex < currentCards.length - 1 ? currentCardIndex + 1 : 0;
    setSlideDirection('left');
    setCurrentCardIndex(newIndex);
  };

  const goBack = () => navigate('/services/topup');
  const handleContinue = () => {
    if (currentCard) {
      navigate('/services/topup/card/cvv', {
        state: { cardId: currentCard.id }
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Top Up</h1>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="wallet-management-card" style={{ maxWidth: 600, margin: '0 auto' }}>
              <div className="wallet-header">
                <div className="wallet-header-icon">
                  <img src={cardHeaderIcon} alt="Top Up" className="wallet-header-icon-img" />
                </div>
                <div className="wallet-header-text">
                  <h2 className="wallet-header-title">Select Saved Card</h2>
                  <p className="wallet-header-subtitle">Select how you want to top up using a card.</p>
                </div>
              </div>
              <div className="wallet-header-divider"></div>

              <div>
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

              {/* Card Display Container */}
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
                      >
                        <CardDisplay card={currentCards[currentCardIndex]} smallText={true} />
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button className="limits-button limits-button-secondary" onClick={goBack}>Back</button>
                <button className="limits-button limits-button-primary" onClick={handleContinue} disabled={!currentCard}>Continue</button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpSelectExistingCard;


