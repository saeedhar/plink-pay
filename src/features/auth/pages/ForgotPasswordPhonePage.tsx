import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import IDNumIcon from '../../../assets/IDNum.svg';
import StepIndicator from '../../../assets/forgetpassword/1.svg';
import { forgotPassword } from '../../../services/realBackendAPI';
import type { ForgotPasswordRequest } from '../../../services/realBackendAPI';

export default function ForgotPasswordPhonePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    idUnn: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idUnn || !formData.phoneNumber) {
      setError('Please enter both ID/UNN and Phone Number');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // // Normalize phone to E164 format
      let phoneNumber = formData.phoneNumber.trim().replace(/[\s\-]/g, '');
      
      // Add +966 if not present
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = phoneNumber.startsWith('966') 
          ? `+${phoneNumber}` 
          : `+966${phoneNumber.replace(/^0/, '')}`;
      }
      
      const request: ForgotPasswordRequest = {
        idUnn: formData.idUnn,
        phoneNumber: phoneNumber
      };
      
      const response = await forgotPassword(request);
      
      if (response.success) {
        console.log('✅ Identity verified, OTP sent successfully');
        
        // Navigate to OTP verification with reset token
        navigate('/forgot-password/phone/otp', {
          state: {
            resetToken: response.resetToken,
            idUnn: formData.idUnn,
            phoneNumber: formData.phoneNumber,
            message: response.message,
            otpCode: response.otpCode // Include OTP for testing/display
          }
        });
      } else {
        setError('Failed to verify identity. Please check your details.');
      }
    } catch (error: any) {
      console.error('❌ Identity verification error:', error);
      if (error.message.includes('404')) {
        setError('Account not found. Please check your ID/UNN and Phone Number.');
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError(error.message || 'Failed to verify identity. Please try again.');
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
          <div className="bg-white rounded-3xl px-12 py-8 shadow-lg relative mt-4">
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
            <form onSubmit={handleSubmit} className="pt-4">
              {/* Verify Identity Icon */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <img src={IDNumIcon} alt="Verify Identity" className="w-16 h-16" />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900">Verify Identity</h2>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* ID/UNN Field */}
              <div className="mb-6 flex flex-col items-center">
                <label htmlFor="idUnn" className="w-100 text-left text-sm font-medium text-gray-700">
                  ID/UNN
                </label>
                <input
                  type="text"
                  id="idUnn"
                  name="idUnn"
                  value={formData.idUnn}
                  onChange={handleInputChange}
                  placeholder="Enter your registered ID or UNN"
                  className="w-100 px-4 py-3 rounded-2xl border border-#022466 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all text-gray-700"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Phone Number Field */}
              <div className="mb-8 flex flex-col items-center">
                <label htmlFor="phoneNumber" className="w-100 text-left text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+966 05555555555555555"
                  className="w-100 px-4 py-3 rounded-2xl border border-#022466 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all text-gray-700"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-80 py-4 rounded-xl font-bold text-lg bg-[#022466] text-white hover:bg-[#04147C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !formData.idUnn || !formData.phoneNumber}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
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
