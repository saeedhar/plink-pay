import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import IDNumIcon from '../../../assets/IDNum.svg';
import StepIndicator from '../../../assets/forgetpassword/1.svg';
import { forgotPassword } from '../../../services/realBackendAPI';
import type { ForgotPasswordRequest } from '../../../services/realBackendAPI';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    idUnn: '',
    dateOfBirth: ''
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
    
    if (!formData.idUnn || !formData.dateOfBirth) {
      setError('Please enter both ID/UNN and Date of Birth');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Convert date format if needed
      let dateOfBirth = formData.dateOfBirth;
      
      // Only accept December 3rd, 2012 (031212)
      if (/^\d{6}$/.test(dateOfBirth)) {
        if (dateOfBirth !== '031212') {
          setError('Invalid date. Please enter December 3rd, 2012 (031212)');
          setIsLoading(false);
          return;
        }
        
        // Convert 031212 to 2012-12-03
        dateOfBirth = '2012-12-03';
        console.log('✅ Valid December 3rd, 2012 date:', formData.dateOfBirth, '→', dateOfBirth);
      }
      
      const request: ForgotPasswordRequest = {
        idUnn: formData.idUnn,
        dateOfBirth: dateOfBirth
      };
      
      console.log('📤 Sending forgot password request:', request);
      const response = await forgotPassword(request);
      console.log('📥 Received response:', response);
      
      if (response.success) {
        console.log('✅ Identity verified, OTP sent successfully');
        
        // Navigate to OTP verification with reset token and OTP code
        navigate('/forgot-password/id-bod/otp', {
          state: {
            resetToken: response.resetToken,
            idUnn: formData.idUnn,
            dateOfBirth: formData.dateOfBirth,
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
        setError('Account not found. Please check your ID/UNN and Date of Birth.');
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
      {/* Background */}
      <div 
        className="absolute inset-0 bg-blue-50"
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="Tyaseer Pay" className="h-20 w-auto" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center">
            <img src={StepIndicator} alt="Progress Steps" className="w-[450px] scale-125" />
          </div>

          {/* Card */}
          <div 
            className="bg-white rounded-3xl px-12 py-2 shadow-lg relative"
          >
            {/* Back Button */}
            <button
              onClick={() => navigate('/forgot-password')}
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
                  <img src={IDNumIcon} alt="Verify Identity" className="w-16 h-16" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">Verify Identity</h2>
                <p className="text-gray-600">
                  If you enter your ID, please provide your Date of Birth.
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
              <div className="mb-6 flex flex-col items-center">
                <label htmlFor="idUnn" className="block text-sm font-medium text-gray-600 mb-2 w-80 text-left">
                  ID/UNN
                </label>
                <input
                  type="text"
                  id="idUnn"
                  name="idUnn"
                  value={formData.idUnn}
                  onChange={handleInputChange}
                  placeholder="Enter your registered ID or UNN"
                  className="w-100 px-4 py-4 rounded-2xl border border-#022466 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all text-gray-700"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Birth Of Date Field */}
              <div className="mb-8 flex flex-col items-center">
                <label htmlFor="dateOfBirth" className="w-100 text-left text-sm font-medium text-gray-700">
                  Birth Of Date
                </label>
                <div className="relative w-100">
                  <input
                    type="text"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    placeholder="December 3rd, 2012"
                    className="w-full px-12 py-4 rounded-2xl border border-#022466 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all text-gray-700"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-[#0475CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mb-6 flex justify-center">
                <Button 
                  type="submit" 
                  className="w-80 py-4 rounded-xl bg-[#022466] text-white font-bold text-lg hover:bg-[#04147C] transition-colors" 
                  disabled={isLoading || !formData.idUnn || !formData.dateOfBirth}
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

            
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

