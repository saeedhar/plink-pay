import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import starIcon from '../../../assets/hero-logo-mini.svg';
import '../../../styles/card-management.css';

const ShowCardDetails: React.FC = () => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(119); // 2 minutes in seconds
  const [isHidden, setIsHidden] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [copyType, setCopyType] = useState<'card' | 'cvv' | null>(null);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = async (text: string, type: 'card' | 'cvv') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyType(type);
      setShowCopySuccess(true);
      // Hide the success message after 3 seconds
      setTimeout(() => {
        setShowCopySuccess(false);
        setCopyType(null);
      }, 3000);
    } catch (err) {
      console.error(`Failed to copy ${type}:`, err);
    }
  };

  const handleHideDetails = () => {
    setIsHidden(!isHidden);
  };

  const maskCardNumber = (cardNumber: string) => {
    if (isHidden) {
      // Remove spaces and show first 10 digits as asterisks, last 4 digits visible
      const digitsOnly = cardNumber.replace(/\s/g, '');
      const last4 = digitsOnly.slice(-4);
      return '**** **** ** ' + last4;
    }
    return cardNumber;
  };

  const maskCVV = (cvv: string) => {
    if (isHidden) {
      return '***';
    }
    return cvv;
  };

  const handleDone = () => {
    navigate('/app/services/cards');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="show-card-details-screen">
            {/* Header Section */}
            <div className="show-card-details-header">
              <div className="show-card-details-header-left">
                <img src={starIcon} alt="Star" className="show-card-details-star-icon" />
                <div>
                  <h2 className="show-card-details-header-title">Show Card Details</h2>
                  <p className="show-card-details-header-subtitle">View your card information securely</p>
                </div>
              </div>
              <div className="show-card-details-timer-box">
                <div className="show-card-details-timer-top">
                  <svg className="show-card-details-clock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="show-card-details-timer-label">Time Remaining</span>
                </div>
                <span className="show-card-details-timer-value">{formatTime(timeRemaining)}</span>
              </div>
            </div>

            {/* Card Information Section */}
            <div className="show-card-details-section">
              <h3 className="show-card-details-section-title">Card Information</h3>
              <div className="show-card-details-fields-container">
                <div className="show-card-details-field">
                  <span className="show-card-details-field-label">Cardholder Name</span>
                  <span className="show-card-details-field-value">Mohammad</span>
                </div>
                <div className="show-card-details-field">
                  <span className="show-card-details-field-label">Type</span>
                  <span className="show-card-details-field-value">Physical Card/Mada</span>
                </div>
              </div>
            </div>

            {/* Security Details Section */}
            <div className="show-card-details-section">
              <h3 className="show-card-details-section-title">Security Details</h3>
              <div className="show-card-details-fields-container">
                <div className="show-card-details-field">
                  <span className="show-card-details-field-label">Expiration Date</span>
                  <span className="show-card-details-field-value">02/30</span>
                </div>
                <div className="show-card-details-field">
                  <span className="show-card-details-field-label">CVV</span>
                    <div className="show-card-details-field-with-copy">
                      <span className="show-card-details-field-value">{maskCVV('125')}</span>
                      {!isHidden && (
                        <button 
                          onClick={() => handleCopy('125', 'cvv')}
                          className={`show-card-details-copy-button ${showCopySuccess && copyType === 'cvv' ? 'copy-success' : ''}`}
                          aria-label="Copy CVV"
                        >
                          {showCopySuccess && copyType === 'cvv' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                </div>
              </div>
            </div>

            {/* Full Card Number Section */}
            <div className="show-card-details-section show-card-details-section-dark">
                <div className="show-card-details-pan-header">
                  <span className="show-card-details-pan-label">Full Card Number (PAN)</span>
                  {!isHidden && (
                    <button 
                      onClick={() => handleCopy('1234 5678 9012 2345', 'card')}
                      className={`show-card-details-copy-button ${showCopySuccess && copyType === 'card' ? 'copy-success' : ''}`}
                      aria-label="Copy Card Number"
                    >
                      {showCopySuccess && copyType === 'card' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              <div className="show-card-details-pan-value">{maskCardNumber('1234 5678 9012 2345')}</div>
            </div>

            {/* Warning and Buttons Container */}
            <div className="show-card-details-warning-buttons-container">
              {/* Security Warning */}
              <div className="show-card-details-warning">
                <svg className="show-card-details-warning-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <p className="show-card-details-warning-text">
                  For your security, card details are visible for 2 minutes only. Please save the information you need before the timer expires.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="show-card-details-buttons">
              <button 
                onClick={handleHideDetails}
                className="show-card-details-button show-card-details-button-secondary"
              >
                {isHidden ? 'Show Details' : 'Hide Details'}
              </button>
                <button 
                  onClick={handleDone}
                  className="show-card-details-button show-card-details-button-primary"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Copy Success Toast */}
            {showCopySuccess && (
              <div className="show-card-details-copy-toast">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{copyType === 'card' ? 'Card number' : 'CVV'} copied to clipboard</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCardDetails;

