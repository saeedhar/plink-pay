import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendCardOtp, verifyCardOtp, requestPhysicalCard, reportReplaceCard } from '../../../services/cardAPI';
import logo from '../../../assets/logo-mark.svg';
import checkCircle from '../../../assets/check_circle.svg';

const RequestPhysicalCardOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    cardType?: 'mada' | 'mastercard'; 
    fee?: number;
    address?: string;
    nationalAddress?: any;
    useExistingAddress?: boolean;
    source?: string;
    reason?: string;
    cardId?: string;
  } | null;
  const isReplacement = state?.source === 'card-replacement';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(true);
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const hasSentOtp = useRef(false);

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
    if (hasSentOtp.current) return;

    const sendOtp = async () => {
      try {
        setIsSendingOtp(true);
        setError('');
        hasSentOtp.current = true;
        const response = await sendCardOtp({ operation: 'REQUEST_CARD' });
        setOtpCode(response.otpCode || null);
        setTimeLeft(response.expiresIn || 30);
        setIsSendingOtp(false);
        
        setTimeout(() => {
          const firstInput = document.getElementById('otp-0');
          firstInput?.focus();
        }, 100);
      } catch (err: any) {
        console.error('Failed to send OTP:', err);
        setError(err.message || 'Failed to send OTP. Please try again.');
        setIsSendingOtp(false);
        hasSentOtp.current = false;
      }
    };

    sendOtp();
  }, []);

  // Focus first input after OTP is sent
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
    try {
      setIsResendDisabled(true);
      setError('');
      setOtp(['', '', '', '', '', '']);
      
      const response = await sendCardOtp({ operation: 'REQUEST_CARD' });
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
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (!state?.cardType) {
      setError('Card type is missing');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Verify OTP
      const verifyResponse = await verifyCardOtp({
        otp: otpValue,
        operation: 'REQUEST_CARD'
      });

      if (!verifyResponse.verified) {
        throw new Error('OTP verification failed');
      }

      // Request physical card
      const cardRequest: any = {
        cardType: state.cardType.toUpperCase() as 'MADA' | 'MASTERCARD'
      };

      if (state.useExistingAddress && state.nationalAddress) {
        cardRequest.useExistingAddress = true;
      } else if (state.nationalAddress) {
        cardRequest.nationalAddress = state.nationalAddress;
      } else {
        throw new Error('National address is required');
      }

      // For replacement, first report and replace the old card
      if (isReplacement && state?.cardId && state?.reason) {
        // Map frontend reason to backend enum
        let backendReason: 'LOST' | 'STOLEN' | 'DAMAGED';
        const reasonLower = state.reason.toLowerCase();
        
        if (reasonLower === 'lost') {
          backendReason = 'LOST';
        } else if (reasonLower === 'stolen') {
          backendReason = 'STOLEN';
        } else {
          backendReason = 'DAMAGED'; // Default for fraud, damaged, other
        }

        await reportReplaceCard(state.cardId, {
          reason: backendReason,
          description: state.reason === 'other' || state.reason === 'fraud' ? state.reason : undefined
        });
      }

      // Request the new physical card
      const cardResponse = await requestPhysicalCard(cardRequest);

      if (isReplacement) {
        // Navigate to replacement success screen
        navigate('/app/services/cards/report-replace/success', {
          state: {
            reason: state?.reason,
            cardType: 'physical'
          }
        });
      } else {
        // Show success screen for new card request
        setShowSuccessScreen(true);
      }
    } catch (error: any) {
      console.error('Request physical card failed:', error);
      setError(error.message || 'Failed to request card. Please try again.');
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    // Navigate to card management for new card request
    navigate('/app/services/cards', {
      state: { 
        cardRequested: true,
        cardType: state?.cardType,
        isPhysical: true
      }
    });
  };

  const handleChangeNumber = () => {
    navigate('/app/services/cards/request-physical/delivery', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee
      }
    });
  };

  const handleClose = () => {
    navigate('/app/services/cards');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Show success screen if verification is successful
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
                  Dear customer, your request to issue a physical card has been successfully received on ({getCurrentDate()}). Your request will now be reviewed. Thank you for choosing Tayseer Wallet Company.
                </p>
              </div>

              {/* Done Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSuccessContinue}
                  className="w-full max-w-xs py-3 px-6 rounded-full bg-white border-2 border-[#022466] text-[#022466] font-medium hover:bg-[#F9FAFB] transition-all"
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
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="Tyaseer Pay" className="h-16 w-auto" />
            </div>
          </div>

          {/* OTP Card */}
          <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-[#1F2937] hover:text-[#022466] transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Form */}
            <form onSubmit={handleVerify} className="pt-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">Mobile Number</h2>
                <h3 className="text-xl font-bold text-[#022466] mb-2">OTP Verification</h3>
                <p className="text-gray-600">
                  {isSendingOtp ? 'Sending OTP...' : 'Enter your OTP code to request your physical card'}
                </p>
                
                {/* Display OTP code if provided (for testing/development) */}
                {otpCode && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Your OTP code:
                    </p>
                    <p className="text-2xl font-bold text-blue-600 tracking-wider">
                      {otpCode}
                    </p>
                  </div>
                )}
              </div>

              {/* OTP Input Fields */}
              <div className="flex justify-center gap-2 mb-4">
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
                    className="w-14 h-14 text-4xl text-[#00BDFF] font-bold text-center rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      border: '1px solid #2C2C2CB2',
                    }}
                    required
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center mb-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Helpers */}
              <div className="mb-6 space-y-2">
                <div className="text-center text-sm text-gray-600">
                  <span>Didn't receive the code? </span>
                  {isResendDisabled ? (
                    <span className="text-[#022466] font-medium">Resend in {formatTime(timeLeft)}</span>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleResend}
                      className="text-[#022466] font-medium underline hover:opacity-80"
                    >
                      Resend
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={handleChangeNumber}
                    className="text-[#022466] text-sm font-medium underline hover:opacity-80"
                  >
                    Change Mobile Number?
                  </button>
                </div>
              </div>

              {/* Verify Button */}
              <button 
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full py-3 px-6 rounded-full bg-[#022466] text-white font-medium hover:bg-[#011a4d] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPhysicalCardOTP;

