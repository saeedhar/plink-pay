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
  const [timeLeft, setTimeLeft] = useState<number>(OTP_CONFIG.RESEND_SECONDS);
  const [expiryTime, setExpiryTime] = useState<Date>(
    new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000)
  );
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [testOTP, setTestOTP] = useState<string>('');
  
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

  // Get test OTP on component mount
  useEffect(() => {
    const getTestOTP = async () => {
      if (state.data.phone) {
        try {
          const response = await sendOTP(state.data.phone.replace(/\s/g, ''), (state.data.businessType as 'freelancer' | 'b2b') || 'freelancer');
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

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
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
      const response = await sendOTP(state.data.phone.replace(/\s/g, ''), (state.data.businessType as 'freelancer' | 'b2b') || 'freelancer');
      
      // Update expiry time
      setExpiryTime(new Date(response.expiresAt));
      
      // Store test OTP for display
      if (response.testOTP) {
        setTestOTP(response.testOTP);
      }
      
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
            title={
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                  Mobile Number <br /> OTP Verification
                </h2>
                <p className="text-gray-600 text-lg">
                  Enter your OTP code
                </p>
              </div>
            }
            size="md"
          >
            <div className="text-center">

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
              />
            ))}
          </div>

          {/* Test OTP Display for Development */}
          {testOTP && (
            <div className="text-center mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium mb-2">
                🧪 Test Mode - OTP Code:
              </p>
              <p className="text-2xl font-bold text-yellow-900 tracking-widest">
                {testOTP}
              </p>
              <p className="text-yellow-700 text-xs mt-2">
                Use this code to verify your phone number
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
              disabled={otp.some(digit => !digit) || isVerifying}
              className={`
                w-60 py-3 px-6 rounded-2xl font-semibold transition-all text-lg
                ${otp.some(digit => !digit) || isVerifying
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#024273] text-white hover:bg-[#024273]/90'
                }
              `}
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
              className="w-50 py-3 px-6 rounded-2xl font-semibold transition-all text-lg bg-[#00BDFF] text-white hover:bg-[#00BDFF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          </div>
            </div>
          </Modal>
        </div>
      </div>
      
      {/* <DevScenarioBar
        title="OTP Scenarios"
        items={[
          { label: 'Accept code 1234', patch: { otpAcceptCode: '1234' } },
          { label: 'Always invalid',   patch: { otpAcceptCode: 'never' } },
        ]}
      /> */}
    </>
  );
}
