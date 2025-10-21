import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import PasswordIcon from '../../../assets/password.svg';
import StepIndicator from '../../../assets/forgetpassword/3.svg';
import { resetPassword } from '../../../services/realBackendAPI';
import type { ResetPasswordRequest } from '../../../services/realBackendAPI';

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState('');

  // Get data from navigation state
  useEffect(() => {
    const state = location.state as { 
      resetToken?: string; 
      otp?: string;
      idUnn?: string;
      phoneNumber?: string;
    };
    
    if (state?.resetToken && state?.otp) {
      setResetToken(state.resetToken);
      setOtp(state.otp);
    } else {
      // If no data, redirect to forgot password
      console.warn('No reset token or OTP provided, redirecting to forgot password');
      navigate('/forgot-password/phone');
    }
  }, [location, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (error) setError('');
  };

  const validatePassword = (): boolean => {
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }
    
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one number');
      return false;
    }
    
    if (!/[^a-zA-Z0-9]/.test(formData.password)) {
      setError('Password must contain at least one special character');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetToken || !otp) {
      setError('Reset token or OTP not found. Please try again.');
      navigate('/forgot-password/phone');
      return;
    }
    
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const request: ResetPasswordRequest = {
        resetToken: resetToken,
        otp: otp,
        newPassword: formData.password
      };
      
      const response = await resetPassword(request);
      
      if (response.success) {
        console.log('✅ Password reset successfully');
        
        // Navigate to success page
        navigate('/reset-password-success');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      if (error.message.includes('400')) {
        setError('Invalid or expired reset code. Please request a new one.');
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError(error.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-2">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-4">
            <img src={logo} alt="Tyaseer Pay" className="h-20 w-auto mx-auto" />
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-4">
            <img src={StepIndicator} alt="Progress Steps" className="w-[450px] scale-125" />
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl px-12 py-8 shadow-lg relative mt-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/forgot-password/phone/otp')}
              className="absolute top-6 left-6 text-[#022466] hover:text-[#0475CC] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit} className="pt-4">
              {/* Title with Icon */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img src={PasswordIcon} alt="Set Password" className="w-12 h-12" />
                  <h2 className="text-2xl font-semibold text-black">Set Your Password</h2>
                </div>
                <p className="text-black text-md">
                  Create a strong password to secure your account.
                </p>
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

              {/* Password Fields */}
              <div className="space-y-6 mb-8">
                {/* Create Password Field */}
                <div className="flex flex-col items-center">
                  <label htmlFor="password" className="w-100 text-left text-sm font-medium text-gray-700">
                    Create Your Password
                  </label>
                  <div className="relative w-100">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create Your Password"
                      className="w-full px-4 py-3 rounded-2xl border border-#022466 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all text-gray-700 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#0475CC] hover:text-[#022466]"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col items-center">
                  <label htmlFor="confirmPassword" className="w-100 text-left text-sm font-medium text-gray-700">
                    Confirm Your Password
                  </label>
                  <div className="relative w-100">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm Your Password"
                      className="w-full px-4 py-3 rounded-2xl border border-#022466 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all text-gray-700 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#0475CC] hover:text-[#022466]"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="mb-4 flex flex-col items-center">
                <div className="w-80">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 text-left">
                    Your password should contain at least:
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">•</span>
                      <span>8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">•</span>
                      <span>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">•</span>
                      <span>One lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">•</span>
                      <span>One number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">•</span>
                      <span>One special character (!@#$...)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-80 py-4 rounded-xl font-bold text-lg bg-[#022466] text-white hover:bg-[#04147C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting Password...
                    </span>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
