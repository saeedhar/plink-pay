import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardIcon from '../../../assets/card-service/physical-card.svg';
import '../../../styles/dashboard.css';

const SetCardPIN: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { cardType?: 'mada' | 'mastercard'; source?: string } | null;
  const source = state?.source;
  const isChangePin = source === 'change-card-pin';
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

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
    if (isChangePin) {
      navigate('/app/services/cards/change-pin/success');
    } else {
      navigate('/app/services/cards/request-virtual/otp', {
        state: { cardType: state?.cardType }
      });
    }
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
        source: source || 'new-card-pin'
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
                <h2 className="set-card-pin-title">Set Your Card PIN</h2>
                <p className="set-card-pin-description">
                  Enter a 4-digit PIN to secure your virtual card.
                </p>
              </div>

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

              {error && (
                <div className="set-card-pin-error">
                  {error}
                </div>
              )}

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

              <div className="set-card-pin-actions">
                <button 
                  className="set-card-pin-back-button"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="set-card-pin-next-button"
                  onClick={handleNext}
                  disabled={!requirements.has4Digits || !requirements.isNumericOnly || !requirements.isNotSequential || !requirements.isNotRepeated}
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

