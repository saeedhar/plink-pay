import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { checkPhysicalCardEligibility } from '../../../services/cardAPI';
import madaIcon from '../../../assets/card-service/mada.svg';
import mastercardLogoIcon from '../../../assets/topup/cards/mastercard-logo.svg';
import requestIcon from '../../../assets/card-service/request.svg';
import '../../../styles/dashboard.css';

const RequestPhysicalCard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCardType, setSelectedCardType] = useState<'mada' | 'mastercard' | null>(null);
  const [showEligibilityError, setShowEligibilityError] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const handleBack = () => {
    navigate('/app/services/cards');
  };

  const handleContinue = async () => {
    if (!selectedCardType) return;

    try {
      setIsCheckingEligibility(true);
      // Check eligibility first
      const eligibility = await checkPhysicalCardEligibility();
      
      if (!eligibility.eligible) {
        // Show error popup
        setEligibilityError(eligibility.reason || 'You already have an active physical card');
        setShowEligibilityError(true);
        setIsCheckingEligibility(false);
        return;
      }

      // If eligible, proceed to fee calculation
      navigate('/app/services/cards/request-physical/fee', {
        state: { cardType: selectedCardType }
      });
    } catch (error: any) {
      console.error('Failed to check eligibility:', error);
      setEligibilityError(error.message || 'Failed to check eligibility. Please try again.');
      setShowEligibilityError(true);
    } finally {
      setIsCheckingEligibility(false);
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
                  disabled={!selectedCardType || isCheckingEligibility}
                >
                  {isCheckingEligibility ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Error Popup */}
      {showEligibilityError && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
          }}
        >
          <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white max-w-md mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Not Eligible</h3>
              <p className="text-gray-600 mb-6">{eligibilityError}</p>
              <button
                onClick={() => {
                  setShowEligibilityError(false);
                  setEligibilityError('');
                }}
                className="w-full py-3 px-6 rounded-full bg-[#022466] text-white font-medium hover:bg-[#011a4d] transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPhysicalCard;

