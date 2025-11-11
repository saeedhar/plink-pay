/**
 * OTP Verification page - simple 6-digit input with smooth transitions
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../store/OnboardingContext';
import { Modal } from '../../../components/ui/Modal';
import { convertArabicToEnglish, OTP_CONFIG } from '../../../utils/validators';
import { verifyOTP, sendOTP } from '../../../services/onboardingAPI';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(OTP_CONFIG.RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [testOTP, setTestOTP] = useState<string>('');
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  // Get test OTP
  useEffect(() => {
    const getTestOTP = async () => {
      if (state.data.phone) {
        try {
          const response = await sendOTP(
            state.data.phone.replace(/\s/g, ''),
            (state.data.businessType as 'freelancer' | 'b2b') || 'freelancer'
          );
          if (response.testOTP) {
            setTestOTP(response.testOTP);
          }
        } catch (err) {
          console.log('Could not get test OTP:', err);
        }
      }
    };
    getTestOTP();
  }, [state.data.phone, state.data.businessType]);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = convertArabicToEnglish(value).replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    // Move to next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits filled
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current field
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous and clear
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = convertArabicToEnglish(e.clipboardData.getData('text'))
      .replace(/\D/g, '')
      .slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  // Verify OTP
  const handleVerify = async (otpCode: string = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyOTP(state.data.phone || '', otpCode);
      
      if (result.verified) {
        dispatch({ type: 'VERIFY_OTP_SUCCESS', payload: result.token });
        navigate('/onboarding/cr-number');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!state.data.phone) {
      setError('Phone number not found. Please restart the process.');
      return;
    }

    setIsResending(true);
    setCanResend(false);
    setTimeLeft(OTP_CONFIG.RESEND_SECONDS);
    setError('');
    setOtp(['', '', '', '', '', '']);
    
    try {
      const response = await sendOTP(
        state.data.phone.replace(/\s/g, ''),
        (state.data.businessType as 'freelancer' | 'b2b') || 'freelancer'
      );
      
      if (response.testOTP) {
        setTestOTP(response.testOTP);
      }
      
      inputRefs.current[0]?.focus();
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Mobile Number OTP Verification"
        size="md"
      >
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-6">
            Enter the 6-digit code we sent to your phone
          </p>

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`
                  w-14 h-14 text-center text-3xl font-bold
                  border-2 rounded-lg
                  focus:outline-none focus:ring-2 transition-all
                  ${error 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-[#00BDFF] focus:ring-[#00BDFF]/20'
                  }
                `}
                style={{ color: '#00BDFF' }}
                maxLength={1}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {/* Test OTP Display */}
          {testOTP && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium mb-2">
                🧪 Test Mode - OTP Code:
              </p>
              <p className="text-2xl font-bold text-yellow-900 tracking-widest">
                {testOTP}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm mb-4 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Resend Timer */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">
              {canResend ? (
                'Didn\'t receive the code?'
              ) : (
                `Resend code in ${timeLeft}s`
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 flex flex-col items-center">
            <button
              onClick={() => handleVerify()}
              disabled={otp.some(d => !d) || isVerifying}
              className={`
                w-60 py-3 px-6 rounded-2xl font-semibold transition-all text-lg
                ${otp.some(d => !d) || isVerifying
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  : 'gradient-button text-white shadow-sm hover:shadow-lg'
                }
              `}
              style={{
                border: otp.some(d => !d) || isVerifying ? undefined : 'none'
              }}
            >
              {isVerifying ? (
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
              disabled={!canResend || isResending}
              className={`
                w-60 py-3 px-6 rounded-2xl font-semibold transition-all text-lg
                ${!canResend || isResending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  : 'gradient-button text-white shadow-sm hover:shadow-lg'
                }
              `}
              style={{
                border: !canResend || isResending ? undefined : 'none'
              }}
            >
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
