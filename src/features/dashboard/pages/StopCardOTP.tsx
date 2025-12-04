import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountBlockedModal from '../../../components/modals/AccountBlockedModal';
import '../../../styles/card-management.css';

const StopCardOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { reason?: string; cardType?: 'virtual' | 'physical'; originalCardType?: 'mada' | 'mastercard' } | null;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountBlockedModal, setShowAccountBlockedModal] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [timeLeft]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setIsResendDisabled(true);
    setError('');
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(30);
    // TODO: Implement resend OTP API call
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Implement OTP verification API call
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to success screen
      navigate('/app/services/cards/stop-card/success', {
        state: { 
          reason: state?.reason,
          cardType: state?.cardType
        }
      });
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/app/services/cards/stop-card', {
      state: { 
        originalCardType: state?.originalCardType,
        action: 'stop'
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
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
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Mobile Number</h2>
              <h3 className="text-2xl font-bold text-[#1F2937] mb-2">OTP Verification</h3>
              <p className="text-gray-600">Enter your OTP code to stop your card</p>
            </div>

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
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
                    border: '1px solid #2C2C2C',
                  }}
                  required
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2 text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
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
      <AccountBlockedModal 
        isOpen={showAccountBlockedModal} 
        onClose={() => setShowAccountBlockedModal(false)} 
      />
    </div>
  );
};

export default StopCardOTP;

