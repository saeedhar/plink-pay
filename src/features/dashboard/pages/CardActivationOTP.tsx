import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CardActivationOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cardLastFour, setCardLastFour] = useState('');

  // Get card digits from navigation state
  useEffect(() => {
    const state = location.state as { cardLastFour?: string };
    if (state?.cardLastFour) {
      setCardLastFour(state.cardLastFour);
    }
  }, [location]);

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
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    }, 100);
  }, []);

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

  const handleResend = () => {
    setIsResendDisabled(true);
    setError('');
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(30);
    // TODO: Implement resend OTP API call
    setTimeout(() => {
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
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
      
      // Navigate to success screen (same success screen for both NFC and manual)
      navigate('/app/services/cards/activate-physical/success');
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
    }
  };

  const handleChangeNumber = () => {
    navigate('/app/services/cards/activate-physical/manual');
  };

  const handleClose = () => {
    navigate('/app/services/cards/activate-physical/manual');
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
              <p className="text-gray-600">Enter your OTP code</p>
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
                    border: '1px solid #2C2C2C',
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
  );
};

export default CardActivationOTP;

