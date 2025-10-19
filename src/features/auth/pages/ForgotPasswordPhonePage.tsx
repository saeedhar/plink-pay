import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
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
      // Normalize phone to E164 format
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
            phoneNumber: phoneNumber,
            message: response.message
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
              {/* Step 1 - Verify Identity (Active) */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#022466] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="ml-2 text-sm font-medium text-[#022466]">Verify Identity</span>
              </div>
              
              {/* Connector */}
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              {/* Step 2 - OTP Verification */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-bold">2</span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">OTP Verification</span>
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

          {/* Card */}
          <div 
            className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative"
            style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
            }}
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
            <form onSubmit={handleSubmit} className="pt-8">
              {/* Verify Identity Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-[#022466]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">Verify Identity</h2>
                <p className="text-gray-600">
                  If you enter your ID, please provide your Phone Number.
                </p>
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
              <div className="mb-6">
                <label htmlFor="idUnn" className="block text-sm font-medium text-gray-700 mb-2">
                  ID/UNN
                </label>
                <input
                  type="text"
                  id="idUnn"
                  name="idUnn"
                  value={formData.idUnn}
                  onChange={handleInputChange}
                  placeholder="Enter your registered ID or UNN"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Phone Number Field */}
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+966 05555555555555555"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mb-6">
                <Button 
                  type="submit" 
                  className="w-full max-w-xs" 
                  disabled={isLoading || !formData.idUnn || !formData.phoneNumber}
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
                    'Next'
                  )}
                </Button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#0475CC] hover:text-[#022466] font-medium transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
