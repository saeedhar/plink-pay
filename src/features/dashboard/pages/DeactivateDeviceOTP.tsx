import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import { UserManagementService } from '../../../services/userManagementService';

const DeactivateDeviceOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>(''); // For testing/display
  const [deviceData, setDeviceData] = useState<{deviceId?: string; deviceName?: string} | null>(null);

  useEffect(() => {
    // Get sessionId, otpCode, and deviceData from navigation state
    const state = location.state as { 
      deviceId?: string; 
      deviceName?: string;
      sessionId?: string; 
      otpCode?: string;
    };
    
    if (state?.deviceId || state?.deviceName) {
      setDeviceData({
        deviceId: state.deviceId,
        deviceName: state.deviceName
      });
    }
    
    if (state?.sessionId) {
      setSessionId(state.sessionId);
    } else {
      // If no sessionId, redirect back to start
      setError('Session expired. Please start over.');
      setTimeout(() => {
        navigate('/app/account-settings/devices');
      }, 2000);
      return;
    }
    
    if (state?.otpCode) {
      setOtpCode(state.otpCode);
    }
    
    // Focus first input
    setTimeout(() => {
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    }, 100);
  }, [location, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [timeLeft]);

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

  const handleResend = async () => {
    if (!deviceData?.deviceId) {
      setError('Device ID is missing. Please start over.');
      return;
    }
    
    try {
      setIsResendDisabled(true);
      setError('');
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(30);
      
      // Re-initiate device deactivation to get new OTP
      const response = await UserManagementService.initiateDeviceDeactivation({
        deviceId: deviceData.deviceId
      });
      
      setSessionId(response.sessionId);
      if (response.otpCode) {
        setOtpCode(response.otpCode);
      }
      
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      setError(error.message || 'Failed to resend OTP. Please try again.');
      setIsResendDisabled(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (!sessionId) {
      setError('Session expired. Please start over.');
      setTimeout(() => {
        navigate('/app/account-settings/devices');
      }, 2000);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await UserManagementService.verifyDeviceDeactivation({
        sessionId,
        otp: otpValue
      });
      
      if (response.success) {
        // Navigate to success page using replace to prevent going back to OTP page
        navigate('/app/account-settings/devices/deactivate/success', {
          replace: true,
          state: deviceData
        });
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        // Focus first input
        setTimeout(() => {
          const firstInput = document.getElementById('otp-0');
          firstInput?.focus();
        }, 100);
      }
    } catch (error: any) {
      console.error('Failed to verify device deactivation:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/app/account-settings/devices');
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

          {/* OTP Card */}
          <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white">
            {/* Back Button */}
            <button
              onClick={handleClose}
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
                <h2 className="text-2xl font-bold text-[#022466] mb-2">Device</h2>
                <h3 className="text-xl font-bold text-[#022466] mb-2">OTP Verification</h3>
                <p className="text-gray-600">We've sent a 6-digit code for device deactivation verification</p>
                {otpCode && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">OTP Code for testing:</p>
                    <p className="text-lg font-bold text-blue-800">{otpCode}</p>
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
                    disabled={isLoading}
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
                    Resend in {timeLeft}s
                  </button>
                </p>
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateDeviceOTP;

