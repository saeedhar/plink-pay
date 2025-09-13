/**
 * OTP Verification page - centered modal with 4 cells
 * Includes 30s timer, auto-focus, paste support
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../store/OnboardingContext';
import { Modal } from '../../../components/ui/Modal';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData.length === 4) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[3]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode: string = otp.join('')) => {
    if (otpCode.length !== 4) {
      setError('Please enter the complete verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, accept any 4-digit code
      dispatch({ type: 'VERIFY_OTP_SUCCESS' });
      navigate('/onboarding/cr-number');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimeLeft(30);
    setError('');
    
    try {
      // Simulate API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Reset timer would happen here
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setCanResend(true);
    }
  };

  const handleClose = () => {
    navigate('/onboarding/phone-number');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Enter Verification Code"
        icon={
          <svg className="w-6 h-6 text-[#2E248F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            We've sent a verification code to<br />
            <span className="font-medium text-gray-900">{state.data.phone}</span>
          </p>

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`
                  w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg
                  focus:outline-none focus:ring-2 transition-all
                  ${error 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-[#2E248F] focus:ring-[#2E248F]/20'
                  }
                `}
                maxLength={1}
                autoComplete="one-time-code"
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

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleVerify()}
              disabled={otp.some(digit => !digit) || isVerifying}
              className={`
                w-full py-3 px-6 rounded-lg font-medium transition-all
                ${otp.some(digit => !digit) || isVerifying
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2E248F] text-white hover:bg-[#1a1a5a]'
                }
              `}
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Resend Button */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-[#2E248F] hover:text-[#1a1a5a] font-medium transition-colors"
                >
                  Resend verification code
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  Resend code in {timeLeft}s
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
