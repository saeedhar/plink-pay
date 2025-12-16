import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { CardDetailsResponse } from '../../../services/cardAPI';
import starIcon from '../../../assets/hero-logo-mini.svg';
import '../../../styles/card-management.css';

const ShowCardDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { cardDetails?: CardDetailsResponse; last4Digits?: string } | null;
  const cardDetails = state?.cardDetails;
  const last4Digits = state?.last4Digits;
  
  // Calculate initial time remaining from cvvExpiresAt if available
  const calculateInitialTime = () => {
    if (cardDetails?.cvvExpiresAt) {
      const expiresAt = new Date(cardDetails.cvvExpiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      return remaining;
    }
    return 119; // Default 2 minutes
  };
  
  const [timeRemaining, setTimeRemaining] = useState(calculateInitialTime());
  const [isHidden, setIsHidden] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [copyType, setCopyType] = useState<'card' | 'cvv' | null>(null);
  
  // Redirect if no card details
  useEffect(() => {
    if (!cardDetails) {
      navigate('/app/services/cards');
    }
  }, [cardDetails, navigate]);

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

  const formatCardType = (cardType: string, cardForm: string): string => {
    const form = cardForm === 'PHYSICAL' ? 'Physical Card' : 'Virtual Card';
    const type = cardType === 'MADA' ? 'Mada' : cardType === 'MASTERCARD' ? 'Mastercard' : 'Visa';
    return `${form}/${type}`;
  };

  const formatExpiryDate = (month: string, year: string): string => {
    const formattedMonth = month.padStart(2, '0');
    const formattedYear = year.length === 4 ? year.slice(-2) : year;
    return `${formattedMonth}/${formattedYear}`;
  };

  const formatPAN = (pan: string | null | undefined): string => {
    if (!pan) {
      return 'N/A';
    }
    
    // Remove any existing spaces
    const cleaned = pan.replace(/\s/g, '');
    
    // If PAN contains asterisks (masked), format with spaces every 4 characters
    if (cleaned.includes('*')) {
      return cleaned.replace(/(.{4})/g, '$1 ').trim();
    }
    
    // If it's a full 16-digit number, format as XXXX XXXX XXXX XXXX
    if (cleaned.length === 16) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)} ${cleaned.slice(12, 16)}`;
    }
    
    // Default: add spaces every 4 characters
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatPANWithLast4 = (pan: string | null | undefined, last4Digits?: string): string => {
    console.log('formatPANWithLast4 called with:', { pan, last4Digits });
    
    // Priority: use last4Digits if provided
    if (last4Digits && last4Digits.length === 4) {
      console.log('Using last4Digits:', last4Digits);
      return `**** **** **** ${last4Digits}`;
    }
    
    if (!pan) {
      console.log('No PAN provided');
      return 'N/A';
    }
    
    // Remove any existing spaces
    const cleaned = pan.replace(/\s/g, '');
    console.log('Cleaned PAN:', cleaned);
    
    // Extract last 4 characters (could be digits or asterisks)
    const last4 = cleaned.slice(-4);
    console.log('Last 4 from cleaned:', last4);
    
    // If last 4 are actual digits, use them
    if (/^\d{4}$/.test(last4)) {
      console.log('Last 4 are digits, using:', last4);
      return `**** **** **** ${last4}`;
    }
    
    // If PAN contains asterisks but last 4 might be digits, try to extract
    if (cleaned.includes('*')) {
      // Try to find the last 4 digits in the string
      const digitsOnly = cleaned.replace(/\*/g, '');
      console.log('Digits only from masked PAN:', digitsOnly);
      if (digitsOnly.length >= 4) {
        const last4FromDigits = digitsOnly.slice(-4);
        console.log('Extracted last 4 digits:', last4FromDigits);
        return `**** **** **** ${last4FromDigits}`;
      }
    }
    
    // If it's a full 16-digit number, show as **** **** **** XXXX
    if (cleaned.length === 16 && /^\d{16}$/.test(cleaned)) {
      console.log('Full 16-digit PAN, using last 4:', last4);
      return `**** **** **** ${last4}`;
    }
    
    // Default: show masked with last 4 from cleaned string
    console.log('Default case, using last 4:', last4);
    return `**** **** **** ${last4}`;
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
    if (!cvv) return 'N/A';
    if (isHidden) {
      return '***';
    }
    return cvv;
  };
  
  // Debug logging
  useEffect(() => {
    console.log('ShowCardDetails - cardDetails:', cardDetails);
    console.log('ShowCardDetails - last4Digits:', last4Digits);
    console.log('ShowCardDetails - PAN:', cardDetails?.pan);
  }, [cardDetails, last4Digits]);

  // If no card details, don't render
  if (!cardDetails) {
    return null;
  }

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
                  <span className="show-card-details-field-value">{cardDetails.cardholderName}</span>
                </div>
                <div className="show-card-details-field">
                  <span className="show-card-details-field-label">Type</span>
                  <span className="show-card-details-field-value">{formatCardType(cardDetails.cardType, cardDetails.cardForm)}</span>
                </div>
              </div>
            </div>

            {/* Security Details Section */}
            <div className="show-card-details-section">
              <h3 className="show-card-details-section-title">Security Details</h3>
              <div className="show-card-details-fields-container">
                <div className="show-card-details-field">
                  <span className="show-card-details-field-label">Expiration Date</span>
                  <span className="show-card-details-field-value">{formatExpiryDate(cardDetails.expiryMonth, cardDetails.expiryYear)}</span>
                </div>
                <div className="show-card-details-field">
                  <span className="show-card-details-field-label">CVV</span>
                    <div className="show-card-details-field-with-copy">
                      <span className="show-card-details-field-value">{maskCVV(cardDetails.cvv || '')}</span>
                      {!isHidden && cardDetails.cvv && (
                        <button 
                          onClick={() => handleCopy(cardDetails.cvv!, 'cvv')}
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
                  {!isHidden && cardDetails.pan && (
                    <button 
                      onClick={() => {
                        // Extract actual card number from PAN (remove asterisks if any)
                        const panToCopy = cardDetails.pan.replace(/\s/g, '').replace(/\*/g, '');
                        handleCopy(panToCopy, 'card');
                      }}
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
              <div className="show-card-details-pan-value">
                {(() => {
                  // Always try to show something - prioritize last4Digits
                  const panValue = formatPANWithLast4(cardDetails?.pan, last4Digits);
                  console.log('PAN value to display:', panValue);
                  
                  if (panValue === 'N/A') {
                    // Fallback: if we have last4Digits, use it
                    if (last4Digits && last4Digits.length === 4) {
                      return maskCardNumber(`**** **** **** ${last4Digits}`);
                    }
                    return 'N/A';
                  }
                  
                  return maskCardNumber(panValue);
                })()}
              </div>
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

