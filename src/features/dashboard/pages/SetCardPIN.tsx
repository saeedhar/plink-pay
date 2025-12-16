import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardIcon from '../../../assets/card-service/physical-card.svg';
import '../../../styles/dashboard.css';

const SetCardPIN: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    cardType?: 'mada' | 'mastercard'; 
    source?: string;
    cardId?: string;
    otpToken?: string;
  } | null;
  const source = state?.source;
  const isChangePin = source === 'change-card-pin';
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isEnteringCurrentPin, setIsEnteringCurrentPin] = useState(isChangePin);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const currentPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // PIN requirements validation
  const pinString = pin.join('');
  const requirements = useMemo(() => {
    const has4Digits = pinString.length === 4;
    const isNumericOnly = /^\d*$/.test(pinString);
    
    // Check if sequential (1234, 4321, etc.)
    let isNotSequential = true;
    if (pinString.length === 4) {
      const digits = pinString.split('').map(Number);
      const ascending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
      const descending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);
      isNotSequential = !ascending && !descending;
    }
    
    // Check if repeated (1111, 2222, etc.)
    const isNotRepeated = pinString.length === 0 || new Set(pinString.split('')).size > 1;
    
    return {
      has4Digits,
      isNumericOnly,
      isNotSequential,
      isNotRepeated
    };
  }, [pinString]);

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      if (isEnteringCurrentPin) {
        currentPinRefs.current[0]?.focus();
      } else {
        inputRefs.current[0]?.focus();
      }
    }, 100);
  }, [isEnteringCurrentPin]);

  const handlePinChange = (value: string, index: number) => {
    // Only allow numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) return;
    
    const newPin = [...pin];
    newPin[index] = numericValue;
    setPin(newPin);

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
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    if (isChangePin && isEnteringCurrentPin) {
      navigate('/app/services/cards/change-pin/success');
    } else if (isChangePin && !isEnteringCurrentPin) {
      setIsEnteringCurrentPin(true);
      setError('');
      setTimeout(() => {
        currentPinRefs.current[0]?.focus();
      }, 100);
    } else {
      navigate('/app/services/cards/request-virtual/otp', {
        state: { cardType: state?.cardType }
      });
    }
  };

  const handleCurrentPinNext = () => {
    const currentPinString = currentPin.join('');
    
    if (currentPinString.length !== 4) {
      setError('Please enter your current 4-digit PIN');
      return;
    }
    
    if (!/^\d{4}$/.test(currentPinString)) {
      setError('PIN must contain numbers only');
      return;
    }

    // Store current PIN and move to new PIN entry
    setIsEnteringCurrentPin(false);
    setError('');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleNext = () => {
    if (!requirements.has4Digits) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    
    if (!requirements.isNumericOnly) {
      setError('PIN must contain numbers only');
      return;
    }
    
    if (!requirements.isNotSequential) {
      setError('PIN cannot be sequential');
      return;
    }
    
    if (!requirements.isNotRepeated) {
      setError('PIN cannot have repeated digits');
      return;
    }

    // Navigate to confirm PIN screen
    navigate('/app/services/cards/set-pin/confirm', {
      state: { 
        cardType: state?.cardType,
        pin: pinString,
        source: source || 'new-card-pin',
        cardId: state?.cardId,
        otpToken: state?.otpToken,
        currentPin: isChangePin ? currentPin.join('') : undefined
      }
    });
  };

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
                <h2 className="set-card-pin-title">
                  {isEnteringCurrentPin ? 'Enter Current PIN' : isChangePin ? 'Enter New PIN' : 'Set Your Card PIN'}
                </h2>
                <p className="set-card-pin-description">
                  {isEnteringCurrentPin 
                    ? 'Enter your current 4-digit PIN to continue.'
                    : isChangePin 
                    ? 'Enter a new 4-digit PIN for your card.'
                    : 'Enter a 4-digit PIN to secure your virtual card.'}
                </p>
              </div>

              {isEnteringCurrentPin ? (
                <div className="set-card-pin-inputs">
                  {currentPin.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (currentPinRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit ? '*' : ''}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        if (numericValue.length > 1) return;
                        const newCurrentPin = [...currentPin];
                        newCurrentPin[index] = numericValue;
                        setCurrentPin(newCurrentPin);
                        if (error) setError('');
                        if (numericValue && index < 3) {
                          setTimeout(() => {
                            currentPinRefs.current[index + 1]?.focus();
                          }, 10);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !currentPin[index] && index > 0) {
                          currentPinRefs.current[index - 1]?.focus();
                        }
                      }}
                      className="set-card-pin-input"
                    />
                  ))}
                </div>
              ) : (
                <div className="set-card-pin-inputs">
                  {pin.map((digit, index) => (
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
              )}

              {error && (
                <div className="set-card-pin-error">
                  {error}
                </div>
              )}

              {!isEnteringCurrentPin && (
                <div className="set-card-pin-requirements">
                  <h3 className="set-card-pin-requirements-title">Your PIN must:</h3>
                  <ul className="set-card-pin-requirements-list">
                    <li className={`set-card-pin-requirement ${requirements.has4Digits ? 'met' : ''}`}>
                      Contain 4 digits.
                    </li>
                    <li className={`set-card-pin-requirement ${requirements.isNumericOnly ? 'met' : ''}`}>
                      Use numbers only (0-9).
                    </li>
                    <li className={`set-card-pin-requirement ${requirements.isNotSequential || pinString.length < 4 ? 'met' : 'failed'}`}>
                      Not be sequential (e.g. 1234, 4321).
                    </li>
                    <li className={`set-card-pin-requirement ${requirements.isNotRepeated || pinString.length < 4 ? 'met' : 'failed'}`}>
                      Not have repeated digits (e.g. 1111).
                    </li>
                    <li className="set-card-pin-requirement">
                      Not include part of your phone number or ID.
                    </li>
                    <li className="set-card-pin-requirement">
                      Match the confirmation PIN.
                    </li>
                  </ul>
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
                  className="set-card-pin-next-button"
                  onClick={isEnteringCurrentPin ? handleCurrentPinNext : handleNext}
                  disabled={
                    isEnteringCurrentPin 
                      ? currentPin.join('').length !== 4
                      : !requirements.has4Digits || !requirements.isNumericOnly || !requirements.isNotSequential || !requirements.isNotRepeated
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetCardPIN;

