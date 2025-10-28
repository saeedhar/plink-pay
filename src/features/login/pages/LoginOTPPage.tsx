import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import { verifyLoginOtp, loginWithPassword, completeCallback } from '../../../services/realBackendAPI';
import type { VerifyLoginOtpRequest, LoginPasswordRequest } from '../../../services/realBackendAPI';

export default function LoginOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCallbackWaiting, setIsCallbackWaiting] = useState(false);
  const [userId, setUserId] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testOTP, setTestOTP] = useState<string>('');

  // Get data from navigation state
  useEffect(() => {
    const state = location.state as { 
      userId?: string; 
      phoneOrEmail?: string;
      password?: string;
      message?: string;
      otpCode?: string;
    };
    
    if (state?.userId && state?.phoneOrEmail) {
      setUserId(state.userId);
      setPhoneOrEmail(state.phoneOrEmail);
      setPassword(state.password || '');
      if (state.otpCode) {
        setTestOTP(state.otpCode);
      }
    } else {
      // If no data, redirect to login
      console.warn('No login data provided, redirecting to login');
      navigate('/login');
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
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (error) setError('');

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
    
    if (!userId) {
      setError('Session expired. Please login again.');
      navigate('/login');
      return;
    }
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const request: VerifyLoginOtpRequest = {
        userId: userId,
        otp: otpCode,
        device: {
          platform: 'web',
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      const response = await verifyLoginOtp(request);
      
      // Handle callback verification for web platform (matching mobile app approach)
      if (response.needsCallback) {
        console.log('⚠️  Callback verification requested for web platform');
        console.log('📞 Callback ID:', response.callbackId);
        console.log('📞 Device ID:', response.deviceId);
        
        // Store callback info for later use
        localStorage.setItem('callbackId', response.callbackId);
        localStorage.setItem('deviceId', response.deviceId);
        
        // Mobile app approach: Wait 7 seconds for MOCK callback to auto-confirm
        console.log('🔄 Waiting 7 seconds for callback auto-confirmation (mobile app approach)...');
        setIsCallbackWaiting(true);
        
        // Wait 7 seconds like mobile app does
        await new Promise(resolve => setTimeout(resolve, 7000));
        setIsCallbackWaiting(false);
        
        try {
          console.log('📞 Attempting to complete callback verification after delay...');
          const callbackResponse = await completeCallback(response.callbackId);
          console.log('✅ Callback verification completed:', callbackResponse);
          
          // Update response with real tokens
          response.accessToken = callbackResponse.accessToken;
          response.refreshToken = callbackResponse.refreshToken;
          response.expiresIn = callbackResponse.expiresIn;
          
          console.log('🔧 Using real tokens from callback:', {
            accessToken: callbackResponse.accessToken.substring(0, 20) + '...',
            refreshToken: callbackResponse.refreshToken.substring(0, 20) + '...'
          });
        } catch (callbackError) {
          console.warn('⚠️ Callback verification failed after delay, using fallback:', callbackError);
          
          // Fallback: Generate tokens based on userId (for development)
          const fallbackAccessToken = `web_token_${response.userId}_${Date.now()}`;
          const fallbackRefreshToken = `web_refresh_${response.userId}_${Date.now()}`;
          
          response.accessToken = fallbackAccessToken;
          response.refreshToken = fallbackRefreshToken;
          response.expiresIn = 3600; // 1 hour
          
          console.log('🔧 Using fallback tokens:', {
            accessToken: fallbackAccessToken.substring(0, 20) + '...',
            refreshToken: fallbackRefreshToken.substring(0, 20) + '...'
          });
        }
      }
      
      // Debug: Log the full response to see what we're getting
      console.log('🔍 Full login response:', response);
      console.log('🔍 AccessToken:', response.accessToken);
      console.log('🔍 RefreshToken:', response.refreshToken);
      console.log('🔍 UserId:', response.userId);
      
      // Store tokens
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        console.log('✅ AccessToken stored');
      } else {
        console.warn('⚠️ No accessToken in response');
      }
      
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
        console.log('✅ RefreshToken stored');
      } else {
        console.warn('⚠️ No refreshToken in response');
      }
      
      localStorage.setItem('userId', response.userId);
      
      console.log('✅ Login successful with 2FA:', response.userId);
      
      // Navigate to dashboard
      navigate('/app/dashboard');
      
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      
      // Check if account is locked
      if (error.message.includes('locked') || error.message.includes('call center')) {
        navigate('/account-locked', {
          state: {
            lockType: error.message.includes('call center') ? 'hard' : 'soft',
            lockReason: error.message,
            unlockMethod: error.message.includes('call center') ? 'call_center' : 'forgot_password'
          }
        });
        return;
      }
      
      if (error.message.includes('400') || error.message.includes('Invalid')) {
        setError(error.message || 'Invalid verification code. Please try again.');
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError(error.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phoneOrEmail || !password) {
      setError('Session expired. Please login again.');
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const request: LoginPasswordRequest = {
        emailOrPhone: phoneOrEmail,
        password: password,
        device: {
          platform: 'web',
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      const response = await loginWithPassword(request);
      
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
      
      console.log('✅ OTP resent successfully');
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
      {/* Background */}
      <div 
        className="absolute inset-0 bg-blue-50"
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="Tyaseer Pay" className="h-18 w-auto" />
            </div>
          </div>

          {/* OTP Card */}
          <div 
            className="bg-white rounded-3xl p-8 shadow-lg relative"
          >
            {/* Back Button */}
            <button
              onClick={() => navigate('/login')}
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
                <h2 className="text-2xl text-gray-800 mb-2">OTP Verification</h2>
                <p className="text-black">Enter the 6-digit code sent to your phone</p>
                {isCallbackWaiting && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mr-2"></div>
                      <p className="text-sm text-yellow-800 font-medium">Processing callback verification...</p>
                    </div>
                    <p className="text-xs text-yellow-600">Please wait while we complete the verification process</p>
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
                    disabled={isLoading || isCallbackWaiting}
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
                    Use this code to verify your login
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
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
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
              <Button 
                type="submit" 
                className="w-full max-w-xs" 
                disabled={isLoading || isCallbackWaiting || otp.some(digit => !digit)}
              >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : isCallbackWaiting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

