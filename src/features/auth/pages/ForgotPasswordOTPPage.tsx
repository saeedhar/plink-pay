import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import StepIndicator from '../../../assets/forgetpassword/2.svg';
import AccountBlockedModal from '../../../components/modals/AccountBlockedModal';
import { forgotPassword, verifyOtp } from '../../../services/realBackendAPI';
import type { ForgotPasswordRequest, VerifyOtpRequest } from '../../../services/realBackendAPI';

export default function ForgotPasswordOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showAccountBlockedModal, setShowAccountBlockedModal] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get data from navigation state
  useEffect(() => {
    const state = location.state as { 
      resetToken?: string; 
      idUnn?: string;
      dateOfBirth?: string;
      message?: string;
    };
    
    if (state?.resetToken && state?.idUnn) {
      setResetToken(state.resetToken);
      setPhoneOrEmail(state.idUnn); // Use ID/UNN as identifier
    } else {
      // If no data, redirect to forgot password
      console.warn('No reset token provided, redirecting to forgot password');
      navigate('/forgot-password/id-bod');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [timeLeft]);

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
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode: string = otp.join('')) => {
    if (!resetToken) {
      setError('Reset token not found. Please try again.');
      navigate('/forgot-password/id-bod');
      return;
    }
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Comment out API call for UI testing
      const request: VerifyOtpRequest = {
        resetToken: resetToken,
        otp: otpCode
      };
      
      const response = await verifyOtp(request);
      
      if (response.success) {
        // Navigate to reset password with token and OTP
        navigate('/reset-password', {
          state: {
            resetToken: resetToken,
            otp: otpCode
          }
        });
      } else {
        // Increment failed attempts
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        if (newFailedAttempts >= 5) {
          setShowAccountBlockedModal(true);
        } else {
          setError('Verification failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      
      // Increment failed attempts for any error
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= 5) {
        setShowAccountBlockedModal(true);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phoneOrEmail) {
      setError('ID/UNN not found. Please go back and try again.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const request: ForgotPasswordRequest = {
        idUnn: phoneOrEmail,
        dateOfBirth: '' // We'll need to get this from state
      };
      
      const response = await forgotPassword(request);
      
      if (response.success) {
        // Update reset token
        setResetToken(response.resetToken);
        
        // Reset timer and clear OTP fields
        setTimeLeft(30);
        setIsResendDisabled(true);
        setOtp(['', '', '', '', '', '']);
        
        // Focus first input
        inputRefs.current[0]?.focus();
        
        console.log('✅ OTP resent successfully');
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModalClose = () => {
    setShowAccountBlockedModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-blue-50" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logo} alt="Tyaseer Pay" className="h-20 w-auto mx-auto" />
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center">
            <img src={StepIndicator} alt="Progress Steps" className="w-[450px] scale-125" />
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl px-12 py-8 shadow-lg relative mt-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/forgot-password/id-bod')}
              className="absolute top-6 left-6 text-[#022466] hover:text-[#0475CC] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="pt-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                  Mobile Number <br /> OTP Verification
                </h2>
                <p className="text-gray-600 text-lg">
                  Enter your OTP code
                </p>
              </div>

              {/* OTP Input Fields */}
              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`
                      w-16 h-16 text-center border-2 rounded-lg
                      focus:outline-none focus:ring-2 transition-all text-[#023B67]
                      ${error 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-[#023B67] focus:ring-[#023B67]/20'
                      }
                    `}
                    style={{
                      fontFamily: 'Lato',
                      fontWeight: 900,
                      fontSize: '48px',
                      lineHeight: '130%',
                      letterSpacing: '0%',
                      color: '#00BDFF'
                    }}
                    maxLength={1}
                    autoComplete="one-time-code"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm mb-4 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Resend Section */}
              <div className="text-center mb-6">
                <p className="text-[#00BDFF] text-sm font-medium mt-2">
                  Change Mobile Number?
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 flex flex-col items-center">
                <button
                  onClick={() => handleVerify()}
                  disabled={otp.some(digit => !digit) || isLoading}
                  className={`
                    w-60 py-3 px-6 rounded-2xl font-semibold transition-all text-lg
                    ${otp.some(digit => !digit) || isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#024273] text-white hover:bg-[#024273]/90'
                    }
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify'
                  )}
                </button>

                <button
                  onClick={handleResend}
                  disabled={isResendDisabled || isLoading}
                  className="w-50 py-3 px-6 rounded-2xl font-semibold transition-all text-lg border-2 border-[#00BDFF] text-[#00BDFF] hover:bg-[#00BDFF] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : isResendDisabled ? `Resend in ${formatTime(timeLeft)}` : 'Resend'}
                </button>
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

