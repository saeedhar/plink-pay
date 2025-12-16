import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendCardOtp, verifyCardOtp, getCardDetails, CardDetailsResponse } from '../../../services/cardAPI';
import '../../../styles/card-management.css';

const ShowCardDetailsOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { cardId?: string; last4Digits?: string } | null;
  const cardId = state?.cardId;
  const last4Digits = state?.last4Digits;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [timeLeft]);

  // Send OTP on mount
  useEffect(() => {
    if (!cardId) {
      setError('Card ID is missing');
      return;
    }
    
    const sendOtp = async () => {
      try {
        setIsSendingOtp(true);
        setError('');
        const response = await sendCardOtp({ operation: 'SHOW_DETAILS' });
        setOtpCode(response.otpCode || null); // Display OTP code if provided (for testing)
        setTimeLeft(response.expiresIn || 30);
        setIsSendingOtp(false);
      } catch (err: any) {
        console.error('Failed to send OTP:', err);
        setError(err.message || 'Failed to send OTP. Please try again.');
        setIsSendingOtp(false);
      }
    };
    
    sendOtp();
  }, [cardId]);

  // Focus first input on mount
  useEffect(() => {
    if (!isSendingOtp) {
    setTimeout(() => {
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    }, 100);
    }
  }, [isSendingOtp]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    if (error) setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    if (!cardId) return;
    
    try {
    setIsResendDisabled(true);
    setError('');
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(30);
      
      const response = await sendCardOtp({ operation: 'SHOW_DETAILS' });
      setOtpCode(response.otpCode || null);
      setTimeLeft(response.expiresIn || 30);
      
    setTimeout(() => {
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    }, 100);
    } catch (err: any) {
      console.error('Failed to resend OTP:', err);
      setError(err.message || 'Failed to resend OTP. Please try again.');
      setIsResendDisabled(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardId) {
      setError('Card ID is missing');
      return;
    }
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Verify OTP and get token
      const verifyResponse = await verifyCardOtp({
        otp: otpValue,
        operation: 'SHOW_DETAILS'
      });
      
      if (!verifyResponse.verified || !verifyResponse.token) {
        throw new Error('OTP verification failed');
      }
      
      // Get card details using the OTP token
      const cardDetails = await getCardDetails(cardId, verifyResponse.token);
      
      // Navigate to card details screen with card details
      navigate('/app/services/cards/show-details', {
        state: { 
          cardDetails, 
          cardId,
          last4Digits: last4Digits || cardDetails.pan?.replace(/\s/g, '').replace(/\*/g, '').slice(-4) || null
        }
      });
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
    }
  };

  const handleChangeNumber = () => {
    navigate('/app/services/cards');
  };

  const handleClose = () => {
    navigate('/app/services/cards');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        {/* OTP Card */}
        <div className="show-card-details-otp-card">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="show-card-details-otp-close"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Form */}
          <form onSubmit={handleVerify} className="show-card-details-otp-form">
            {/* Title */}
            <div className="show-card-details-otp-header">
              <h2 className="show-card-details-otp-title">Show Card Details</h2>
              <h3 className="show-card-details-otp-title">OTP Verification</h3>
              <p className="show-card-details-otp-description">
                {isSendingOtp ? 'Sending OTP...' : 'Enter your OTP code'}
              </p>
              {/* Display OTP code if provided (for testing/development) */}
              {otpCode && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#F3F4F6', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#6B7280',
                    marginBottom: '4px'
                  }}>
                    Your OTP code:
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '24px', 
                    fontWeight: '600',
                    color: '#022466',
                    letterSpacing: '4px'
                  }}>
                    {otpCode}
                  </p>
                </div>
              )}
            </div>

            {/* OTP Input Fields */}
            <div className="show-card-details-otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="show-card-details-otp-input"
                  required
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="show-card-details-otp-error">
                <p>{error}</p>
              </div>
            )}

            {/* Helpers */}
            <div className="show-card-details-otp-helpers">
              <div className="show-card-details-otp-resend">
                <span>Didn't receive the code? </span>
                {isResendDisabled ? (
                  <span className="show-card-details-otp-timer">Resend in {formatTime(timeLeft)}</span>
                ) : (
                  <button 
                    type="button"
                    onClick={handleResend}
                    className="show-card-details-otp-resend-link"
                  >
                    Resend
                  </button>
                )}
              </div>
             
            </div>

            {/* Verify Button */}
            <button 
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="show-card-details-otp-verify-button"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShowCardDetailsOTP;

