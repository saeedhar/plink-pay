import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardIcon from '../../../assets/card-service/physical-card.svg';
import checkCircle from '../../../assets/check_circle.svg';
import '../../../styles/dashboard.css';

const ConfirmCardPIN: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { cardType?: 'mada' | 'mastercard'; pin?: string; source?: string } | null;
  const isChangePin = state?.source === 'change-card-pin';
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handlePinChange = (value: string, index: number) => {
    // Only allow numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) return;
    
    const newPin = [...confirmPin];
    newPin[index] = numericValue;
    setConfirmPin(newPin);

    // Clear error when user starts typing
    if (error) setError('');

    // Auto-focus next input
    if (numericValue && index < 3) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !confirmPin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    navigate('/app/services/cards/set-pin', {
      state: { 
        cardType: state?.cardType,
        source: state?.source
      }
    });
  };

  const handleConfirm = () => {
    const confirmPinString = confirmPin.join('');
    
    if (confirmPinString.length !== 4) {
      setError('Please enter the complete 4-digit PIN');
      return;
    }
    
    if (confirmPinString !== state?.pin) {
      setError('PINs do not match. Please try again.');
      setConfirmPin(['', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return;
    }

    // PIN confirmed successfully
    // TODO: Implement API call to save PIN
    
    if (isChangePin) {
      // Navigate to final success screen for change PIN
      navigate('/app/services/cards/change-pin/final-success', { replace: true });
    } else {
      // Show success screen for new card
      setShowSuccessScreen(true);
    }
  };

  const handleSuccessDone = () => {
    navigate('/app/services/cards', {
      state: { 
        cardRequested: true,
        cardType: state?.cardType,
        pinSet: true
      }
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Show success screen if PIN is confirmed
  if (showSuccessScreen) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
          }}
        />

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Success Card */}
            <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <img src={checkCircle} alt="Success" className="w-24 h-24" />
              </div>

              {/* Success Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#022466] mb-4">
                  Request Received
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  Dear customer, your request to issue a Virtual card has been successfully received on ({getCurrentDate()}). Your request will now be reviewed. Thank you for choosing Tayseer Wallet Company.
                </p>
              </div>

              {/* Done Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSuccessDone}
                  className="w-full max-w-xs py-3 px-6 rounded-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="set-card-pin-screen">
            <div className="set-card-pin-container">
              <div className="set-card-pin-header">
                <div className="set-card-pin-icon">
                  <img src={cardIcon} alt="Card" />
                </div>
                <h2 className="set-card-pin-title">Confirm Your PIN</h2>
                <p className="set-card-pin-description">
                  Re-enter your PIN to confirm it.
                </p>
              </div>

              <div className="set-card-pin-inputs">
                {confirmPin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit ? '*' : ''}
                    onChange={(e) => handlePinChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="set-card-pin-input"
                  />
                ))}
              </div>

              {error && (
                <div className="set-card-pin-error">
                  {error}
                </div>
              )}

              <div className="set-card-pin-actions">
                <button 
                  className="set-card-pin-back-button"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="set-card-pin-confirm-button"
                  onClick={handleConfirm}
                  disabled={confirmPin.join('').length !== 4}
                >
                  Confirm PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCardPIN;

