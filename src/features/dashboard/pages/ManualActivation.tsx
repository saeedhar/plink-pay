import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import physicalCardIcon from '../../../assets/card-service/physical-card.svg';
import '../../../styles/dashboard.css';

const ManualActivation: React.FC = () => {
  const navigate = useNavigate();
  const [cardDigits, setCardDigits] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    // Remove asterisks and extract only digits
    const digitValue = value.replace(/\*/g, '').replace(/\D/g, '');
    
    // Only allow single digit
    if (digitValue.length > 1) {
      // If user pastes multiple digits, take only the first one
      const newDigits = [...cardDigits];
      newDigits[index] = digitValue.charAt(0);
      setCardDigits(newDigits);
      
      // Auto-focus next input
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }
    
    // If empty, clear the digit
    if (digitValue === '') {
      const newDigits = [...cardDigits];
      newDigits[index] = '';
      setCardDigits(newDigits);
      return;
    }
    
    // Store the digit
    const newDigits = [...cardDigits];
    newDigits[index] = digitValue;
    setCardDigits(newDigits);
    
    // Auto-focus next input
    if (digitValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !cardDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    navigate('/app/services/cards/activate-physical');
  };

  const handleContinue = () => {
    const cardDigitsString = cardDigits.join('');
    if (cardDigitsString.length !== 4) {
      // TODO: Show error message
      return;
    }
    
    // Navigate to OTP verification screen
    navigate('/app/services/cards/activate-physical/manual/otp', {
      state: { cardLastFour: cardDigitsString }
    });
  };

  const isContinueDisabled = cardDigits.join('').length !== 4;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="manual-activation-screen">
            <div className="manual-activation-container">
              {/* Card Icon */}
              <div className="manual-activation-icon">
                <img src={physicalCardIcon} alt="Card" />
              </div>

              {/* Heading */}
              <h2 className="manual-activation-heading">
                Manual Activation
              </h2>

              {/* Instruction Text */}
              <p className="manual-activation-instruction">
                Please enter the last 4 digits of your card.
              </p>

              {/* Input Fields */}
              <div className="manual-activation-inputs">
                {cardDigits.map((digit, index) => (
                  <div key={index} className="manual-activation-input-wrapper">
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit ? '*' : ''}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Extract only digits, take the last one if multiple
                        const digits = inputValue.replace(/\D/g, '');
                        const newValue = digits.slice(-1);
                        handleDigitChange(index, newValue);
                      }}
                      onKeyDown={(e) => {
                        // If input has asterisk and user types a digit, allow it
                        if (cardDigits[index] && /^\d$/.test(e.key)) {
                          e.preventDefault();
                          handleDigitChange(index, e.key);
                        } else {
                          handleKeyDown(index, e);
                        }
                      }}
                      className="manual-activation-input"
                      id={`card-digit-${index}`}
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="manual-activation-buttons">
                <button 
                  className="manual-activation-button manual-activation-button-back"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="manual-activation-button manual-activation-button-continue"
                  onClick={handleContinue}
                  disabled={isContinueDisabled}
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

export default ManualActivation;

