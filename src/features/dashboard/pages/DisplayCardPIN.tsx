import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import '../../../styles/card-management.css';

const DisplayCardPIN: React.FC = () => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(179); // 3 minutes in seconds
  const [isPinHidden, setIsPinHidden] = useState(false);
  const [cardPin] = useState('1570'); // This would come from API
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-hide PIN when timer expires
      setIsPinHidden(true);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardPin);
      setShowCopySuccess(true);
      // Hide the success message after 3 seconds
      setTimeout(() => {
        setShowCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy PIN:', err);
    }
  };

  const handleHidePin = () => {
    setIsPinHidden(!isPinHidden);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="display-card-pin-screen">
            <div className="display-card-pin-container">
              {/* Title */}
              <h2 className="display-card-pin-title">Your Card PIN</h2>
              <p className="display-card-pin-subtitle">Keep your PIN secure and confidential</p>

              {/* Timer Section */}
              <div className="display-card-pin-timer-box">
                <div className="display-card-pin-timer-top">
                  <svg className="display-card-pin-clock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="display-card-pin-timer-label">Time Remaining</span>
                </div>
                <span className="display-card-pin-timer-value">{formatTime(timeRemaining)}</span>
              </div>

              {/* PIN Display */}
              <div className="display-card-pin-inputs">
                {cardPin.split('').map((digit, index) => (
                  <div key={index} className="display-card-pin-input-wrapper">
                    <input
                      type="text"
                      value={isPinHidden ? '*' : digit}
                      readOnly
                      className="display-card-pin-input"
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="display-card-pin-buttons">
                <button 
                  onClick={handleHidePin}
                  className="display-card-pin-button display-card-pin-button-secondary"
                >
                  {isPinHidden ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Show PIN
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11.5-6.47-11.5-6.47a11.07 11.07 0 0 1 2.1-3.72m3.53-2.11A10.07 10.07 0 0 1 12 4c7 0 11.5 6.47 11.5 6.47a11.07 11.07 0 0 1-1.9 3.54M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM2 2l20 20"></path>
                      </svg>
                      Hide PIN
                    </>
                  )}
                </button>
                <button 
                  onClick={handleCopy}
                  className={`display-card-pin-button display-card-pin-button-primary ${showCopySuccess ? 'copy-success' : ''}`}
                >
                  {showCopySuccess ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy PIN
                    </>
                  )}
                </button>
              </div>

              {/* Copy Success Toast */}
              {showCopySuccess && (
                <div className="display-card-pin-copy-toast">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>PIN copied to clipboard</span>
                </div>
              )}

              {/* Security Message */}
              <div className="display-card-pin-security-message">
                Your PIN will be hidden soon for your security.
              </div>

              {/* Information Message */}
              <div className="display-card-pin-info-message">
                <svg className="display-card-pin-info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div className="display-card-pin-info-content">
                  <p className="display-card-pin-info-main">Your card PIN is now displayed for 3 minutes.</p>
                  <p className="display-card-pin-info-subtitle">Thank you for choosing Tayseer Wallet Company.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayCardPIN;

