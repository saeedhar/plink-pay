import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import { forgotPassword } from '../../../services/realBackendAPI';
import type { ForgotPasswordRequest } from '../../../services/realBackendAPI';

export default function ForgotPasswordPhoneOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [idUnn, setIdUnn] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Get data from navigation state
  useEffect(() => {
    const state = location.state as { 
      resetToken?: string; 
      idUnn?: string;
      phoneNumber?: string;
      message?: string;
    };
    
    if (state?.resetToken && state?.idUnn && state?.phoneNumber) {
      setResetToken(state.resetToken);
      setIdUnn(state.idUnn);
      setPhoneNumber(state.phoneNumber);
    } else {
      // If no data, redirect to forgot password
      console.warn('No reset token provided, redirecting to forgot password');
      navigate('/forgot-password/phone');
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
    
    if (!resetToken) {
      setError('Reset token not found. Please try again.');
      navigate('/forgot-password/phone');
      return;
    }
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Navigate to set password with token and OTP
      navigate('/forgot-password/phone/set-password', {
        state: {
          resetToken: resetToken,
          otp: otpCode,
          idUnn: idUnn,
          phoneNumber: phoneNumber
        }
      });
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!idUnn || !phoneNumber) {
      setError('ID/UNN or Phone not found. Please go back and try again.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const request: ForgotPasswordRequest = {
        idUnn: idUnn,
        phoneNumber: phoneNumber
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
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
        
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

          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Step 1 - Verify Identity (Completed) */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#022466] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-sm font-medium text-[#022466]">Verify Identity</span>
              </div>
              
              {/* Connector */}
              <div className="w-8 h-0.5 bg-[#022466]"></div>
              
              {/* Step 2 - OTP Verification (Active) */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#022466] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="ml-2 text-sm font-medium text-[#022466]">OTP Verification</span>
              </div>
              
              {/* Connector */}
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              {/* Step 3 - New Password */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-bold">3</span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">New Password</span>
              </div>
              
              {/* Connector */}
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              {/* Step 4 - Success */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-bold">4</span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Success</span>
              </div>
            </div>
          </div>

          {/* OTP Card */}
          <div 
            className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative"
            style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
            }}
          >
            {/* Back Button */}
            <button
              onClick={() => navigate('/forgot-password/phone')}
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
                <p className="text-gray-600">
                  Enter your OTP code
                </p>
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

              {/* Error Message */}
              {error && (
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">The code you entered is incorrect.</span>
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
                    disabled={isResendDisabled || isLoading}
                    className={`font-medium ${
                      isResendDisabled || isLoading
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-[#0475CC] hover:text-[#022466]'
                    }`}
                  >
                    Resend in {formatTime(timeLeft)}
                  </button>
                </p>
                <p className="text-gray-600">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password/phone')}
                    className="text-[#0475CC] hover:text-[#022466] font-medium"
                  >
                    Change Mobile Number?
                  </button>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Verify Button */}
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
                
                {/* Resend Button */}
                <div className="flex justify-center">
                  <Button 
                    type="button"
                    onClick={handleResend}
                    className="w-full max-w-xs bg-white border-2 border-[#022466] text-[#022466] hover:bg-gray-50"
                    disabled={isResendDisabled || isLoading}
                  >
                    Resend
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
