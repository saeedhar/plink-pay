import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { WalletService, WalletOTPRequest } from '../../../services/walletService';
import { API } from '../../../lib/api';
import logo from '../../../assets/logo-mark.svg';
import checkCircle from '../../../assets/check_circle.svg';
import AccountBlockedModal from '../../../components/modals/AccountBlockedModal';

export default function WalletOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showAccountBlockedModal, setShowAccountBlockedModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [action, setAction] = useState<'activate' | 'deactivate'>('activate');
  const [realOTP, setRealOTP] = useState('');
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const hasRequestedOTP = useRef(false);
  const isRequestingRef = useRef(false); // Track request state with ref to prevent race conditions
  const previousAction = useRef<'activate' | 'deactivate'>('activate');

  // Request OTP from backend
  const requestOTP = async () => {
    // Prevent multiple simultaneous requests using ref (more reliable than state)
    if (isRequestingRef.current) {
      console.log('⏸️ OTP request already in progress, skipping...');
      return;
    }

    try {
      isRequestingRef.current = true;
      setIsRequestingOTP(true);
      setError('');
      
      const request: WalletOTPRequest = { action };
      const response = await WalletService.requestOTP(request);
      
      if (response.otpCode) {
        setRealOTP(response.otpCode);
        console.log('✅ Real OTP received from backend:', response.otpCode);
      }
      
      // Reset timer
      setTimeLeft(30);
      setIsResendDisabled(true);
      setOtp(['', '', '', '', '', '']);
      hasRequestedOTP.current = true;
      
    } catch (error: any) {
      console.error('❌ Error requesting OTP:', error);
      setError(error.message || 'Failed to request OTP. Please try again.');
    } finally {
      isRequestingRef.current = false;
      setIsRequestingOTP(false);
    }
  };

  // Initialize action from navigation state on mount only
  useEffect(() => {
    const state = location.state as { action?: 'activate' | 'deactivate' };
    if (state?.action && state.action !== action) {
      setAction(state.action);
      previousAction.current = state.action;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Request OTP only once on mount or when action actually changes
  useEffect(() => {
    // Skip if already requesting to prevent duplicate calls (use ref for immediate check)
    if (isRequestingRef.current) {
      console.log('⏸️ Skipping OTP request - already in progress');
      return;
    }

    // Only request OTP if action has changed from previous
    const actionChanged = previousAction.current !== action;
    
    if (actionChanged || !hasRequestedOTP.current) {
      console.log('📞 Requesting OTP for action:', action, 'actionChanged:', actionChanged, 'hasRequested:', hasRequestedOTP.current);
      
      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(30);
      setIsResendDisabled(true);
      setFailedAttempts(0);
      
      // Mark as requested before calling to prevent duplicate calls
      hasRequestedOTP.current = true;
      previousAction.current = action;
      
      requestOTP();
      
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]); // Only depend on action

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [timeLeft]);

  // Close modals when navigating back or away
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Close any open modals when navigating back
      setShowAccountBlockedModal(false);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Also close modals when component unmounts (navigating away)
    return () => {
      window.removeEventListener('popstate', handlePopState);
      setShowAccountBlockedModal(false);
    };
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return; // Only allow single digit
    
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Pass OTP directly to wallet activate/deactivate endpoints
      // The backend will verify the OTP internally
      if (action === 'activate') {
        await WalletService.activateWallet({ otp: otpCode });
        console.log('✅ Wallet activated successfully');
      } else {
        await WalletService.deactivateWallet({ otp: otpCode });
        console.log('✅ Wallet deactivated successfully');
      }
      
      // Store the action result in localStorage for the wallet page to read
      localStorage.setItem('walletAction', action);
      localStorage.setItem('walletActionCompleted', 'true');
      
      // Show success screen
      setShowSuccessScreen(true);
      
    } catch (error: any) {
      console.error('❌ Wallet operation failed:', error);
      
      // Increment failed attempts
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= 5) {
        setShowAccountBlockedModal(true);
      } else {
        // Check for specific error messages
        if (error.message?.includes('phone number') || error.message?.includes('already exists')) {
          setError('The code you entered is incorrect. Please try again.');
        } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
          setError('Unable to connect to server. Please check your connection.');
        } else {
          setError(error.message || 'The code you entered is incorrect. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isRequestingOTP) return; // Prevent multiple requests
    
    // Reset the flag to allow resending
    hasRequestedOTP.current = false;
    await requestOTP();
  };

  const handleChangeNumber = () => {
    navigate('/app/services/wallet');
  };

  const handleModalClose = () => {
    setShowAccountBlockedModal(false);
    navigate('/app/services/wallet');
  };

  const handleSuccessDone = () => {
    navigate('/app/services/wallet');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show success screen if OTP is verified
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
            <div 
              className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <img src={checkCircle} alt="Success" className="w-20 h-20" />
              </div>

              {/* Success Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">
                  Wallet {action === 'activate' ? 'Activated' : 'Deactivated'}
                </h2>
                <p className="text-gray-600">
                  Your wallet has been {action === 'activate' ? 'activated' : 'deactivated'} successfully.
                </p>
              </div>

              {/* Done Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSuccessDone}
                  className="w-full max-w-xs py-3 px-6 rounded-full border-2 border-[#022466] text-[#022466] font-medium hover:bg-[#022466] hover:text-white transition-all"
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
          <div 
            className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white"
          >
            {/* Back Button */}
            <button
              onClick={() => navigate('/app/services/wallet')}
              className="absolute top-6 left-6 text-[#022466] hover:text-[#0475CC] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Form */}
            <form onSubmit={handleVerify} className="pt-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">Mobile Number</h2>
                <h3 className="text-xl font-bold text-[#022466] mb-2">OTP Verification</h3>
                <p className="text-gray-600">Enter your OTP code</p>
                {isRequestingOTP && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-2"></div>
                      <p className="text-sm text-yellow-800">Requesting OTP...</p>
                    </div>
                  </div>
                )}
                {realOTP && !isRequestingOTP && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">OTP from backend:</p>
                    <p className="text-lg font-bold text-blue-800">{realOTP}</p>
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
                    disabled={isLoading || isRequestingOTP}
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
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Helper Text */}
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-2">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResendDisabled}
                    className={`font-medium ${
                      isResendDisabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-[#0475CC] hover:text-[#022466]'
                    }`}
                  >
                    Resend in {formatTime(timeLeft)}
                  </button>
                </p>
                {/* <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="text-[#0475CC] hover:text-[#022466] font-medium transition-colors"
                >
                  Change Mobile Number?
                </button> */}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    className="w-full max-w-xs" 
                    disabled={isLoading || isRequestingOTP || otp.some(digit => !digit)}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
                {/* <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResendDisabled || isLoading || isRequestingOTP}
                    className={`w-3/4 max-w-xs py-3 px-4 rounded-full border-2 border-[#022466] font-medium transition-all ${
                      isResendDisabled || isLoading
                        ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                        : 'text-[#022466] hover:bg-[#022466] hover:text-white'
                    }`}
                  >
                    {isLoading ? 'Sending...' : isRequestingOTP ? 'Requesting...' : 'Resend'}
                  </button>
                </div> */}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Account Blocked Modal */}
      <AccountBlockedModal 
        isOpen={showAccountBlockedModal}
        onClose={handleModalClose}
      />
    </div>
  );
}
