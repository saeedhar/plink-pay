/**
 * OTP Verification page - centered modal with 4 cells
 * Includes 30s timer, auto-focus, paste support
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../store/OnboardingContext';
import { Stepper } from '../../../components/ui/Stepper';
import { Modal } from '../../../components/ui/Modal';
import { validateOTP, convertArabicToEnglish, OTP_CONFIG } from '../../../utils/validators';
import { verifyOTP, sendOTP } from '../../../services/onboardingAPI';
import { DevScenarioBar } from '../../../dev/DevScenarioBar';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(OTP_CONFIG.RESEND_SECONDS);
  const [expiryTime, setExpiryTime] = useState<Date>(
    new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000)
  );
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer effect  
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Expiry timer effect
  useEffect(() => {
    const checkExpiry = () => {
      if (new Date() > expiryTime) {
        setIsExpired(true);
        setError('Verification code has expired. Please request a new one.');
      }
    };

    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Convert Arabic numerals to English and only allow numeric input
    const converted = convertArabicToEnglish(value);
    if (!/^\d*$/.test(converted)) return;

    const newOtp = [...otp];
    newOtp[index] = converted.slice(-1); // Only take last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (converted && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled and not expired
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6 && !isExpired) {
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
    const pastedData = convertArabicToEnglish(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[5]?.focus();
      if (!isExpired) {
        handleVerify(pastedData);
      }
    }
  };

  const handleVerify = async (otpCode: string = otp.join('')) => {
    if (isExpired) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }

    const validationError = validateOTP(otpCode);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyOTP(state.data.phone || '', otpCode);
      
      console.log('🔍 OTP Verification Result:', result);
      console.log('🔍 User ID (token):', result.token);
      
      if (result.verified) {
        console.log('✅ Dispatching VERIFY_OTP_SUCCESS with userId:', result.token);
        dispatch({ type: 'VERIFY_OTP_SUCCESS', payload: result.token });
        
        console.log('🔍 State after dispatch should have userId:', result.token);
        
        navigate('/onboarding/cr-number');
      }
    } catch (err: any) {
      console.error('❌ OTP verification error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!state.data.phone) {
      setError('Phone number not found. Please restart the process.');
      return;
    }

    setIsResending(true);
    setCanResend(false);
    setTimeLeft(OTP_CONFIG.RESEND_SECONDS);
    setError('');
    setIsExpired(false);
    
    try {
      const response = await sendOTP(state.data.phone.replace(/\s/g, ''), state.businessType || 'freelancer');
      
      // Update expiry time
      setExpiryTime(new Date(response.expiresAt));
      
      // Success feedback could be added here
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    navigate('/onboarding/phone-number');
  };

  // Calculate remaining expiry time for display
  const expiryMinutes = Math.max(0, Math.floor((expiryTime.getTime() - Date.now()) / 60000));
  const expirySeconds = Math.max(0, Math.floor(((expiryTime.getTime() - Date.now()) % 60000) / 1000));

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Stepper */}
       
        
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
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
              {canResend && !isExpired ? (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-[#2E248F] hover:text-[#1a1a5a] font-medium transition-colors disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend verification code'}
                </button>
              ) : isExpired ? (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="bg-[#2E248F] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1a1a5a] transition-colors disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Send New Code'}
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  Resend code in {timeLeft}s
                </p>
              )}
            </div>

            {/* Expiry Timer */}
            {!isExpired && (
              <div className="text-center mt-4">
                <p className="text-xs text-gray-400">
                  Code expires in {expiryMinutes}:{expirySeconds.toString().padStart(2, '0')}
                </p>
              </div>
            )}
            </div>
            </div>
          </Modal>
        </div>
      </div>
      
      <DevScenarioBar
        title="OTP Scenarios"
        items={[
          { label: 'Accept code 1234', patch: { otpAcceptCode: '1234' } },
          { label: 'Always invalid',   patch: { otpAcceptCode: 'never' } },
        ]}
      />
    </>
  );
}
