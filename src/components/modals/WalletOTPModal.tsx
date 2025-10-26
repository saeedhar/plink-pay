import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import logo from '../../assets/logo-mark.svg';
import AccountBlockedModal from './AccountBlockedModal';
import { verifyOtp, sendOtp } from '../../services/realBackendAPI';
import type { VerifyOtpRequest, SendOtpRequest } from '../../services/realBackendAPI';

interface WalletOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  action: 'activate' | 'deactivate';
}

export default function WalletOTPModal({ isOpen, onClose, onVerify, action }: WalletOTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessType, setBusinessType] = useState<'freelancer' | 'b2b'>('freelancer');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showAccountBlockedModal, setShowAccountBlockedModal] = useState(false);
  const [testOTP, setTestOTP] = useState<string>('');

  // Get phone number from localStorage or use a default
  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem('phoneNumber');
    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber);
    } else {
      // Use a default phone number for wallet operations
      setPhoneNumber('+966501234567');
    }
    
    const storedBusinessType = localStorage.getItem('businessType') as 'freelancer' | 'b2b';
    if (storedBusinessType) {
      setBusinessType(storedBusinessType);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(30);
      setIsResendDisabled(true);
      setFailedAttempts(0);
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    }
  }, [isOpen]);

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
    
    if (!phoneNumber) {
      setError('Phone number not found. Please try again.');
      return;
    }
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const request: VerifyOtpRequest = {
        phoneNumber: phoneNumber,
        otp: otpCode
      };
      
      const response = await verifyOtp(request);
      
      if (response.success) {
        console.log('✅ OTP verified successfully for wallet', action);
        
        // Call the onVerify callback with the OTP
        onVerify(otpCode);
        
        // Close the modal
        onClose();
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
        if (error.message.includes('400') || error.message.includes('Invalid')) {
          setError('Invalid verification code. Please try again.');
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          setError('Unable to connect to server. Please check your connection.');
        } else {
          setError(error.message || 'Verification failed. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber) {
      setError('Phone number not found. Please try again.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const request: SendOtpRequest = {
        phoneNumber: phoneNumber,
        businessType: businessType
      };
      
      const response = await sendOtp(request);
      
      // Store the OTP code for display
      if (response.otpCode) {
        setTestOTP(response.otpCode);
      }
      
      // Reset timer and clear OTP fields
      setTimeLeft(30);
      setIsResendDisabled(true);
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
      
      console.log('✅ OTP resent successfully for wallet', action);
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeNumber = () => {
    onClose();
  };

  const handleModalClose = () => {
    setShowAccountBlockedModal(false);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
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
            onClick={onClose}
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
                  className="w-14 h-14 text-3xl text-[#00BDFF] font-bold text-center rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid #2C2C2CB2',
                    WebkitTextStroke: '1px #2C2C2CB2',
                    textShadow: '1px 1px 0 #2C2C2CB2, -1px -1px 0 #2C2C2CB2, 1px -1px 0 #2C2C2CB2, -1px 1px 0 #2C2C2CB2'
                  }}
                  required
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
                  Use this code to verify your wallet {action}
                </p>
              </div>
            )}

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
              <button
                type="button"
                onClick={handleChangeNumber}
                className="text-[#0475CC] hover:text-[#022466] font-medium transition-colors"
              >
                Change Mobile Number?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  className="w-full max-w-xs" 
                  disabled={isLoading || otp.some(digit => !digit)}
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
              <button
                type="button"
                onClick={handleResend}
                disabled={isResendDisabled || isLoading}
                className={`w-full py-3 px-4 rounded-full border-2 border-[#022466] font-medium transition-all ${
                  isResendDisabled || isLoading
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                    : 'text-[#022466] hover:bg-[#022466] hover:text-white'
                }`}
              >
                {isLoading ? 'Sending...' : 'Resend'}
              </button>
            </div>
          </form>
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
