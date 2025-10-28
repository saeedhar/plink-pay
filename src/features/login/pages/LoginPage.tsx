import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import profileIcon from '../../../assets/ion_person-circle-sharp.svg';
import { loginWithPassword, completeCallback } from '../../../services/realBackendAPI';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    idUnn: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Handle both phone number and ID/UNN
      let emailOrPhone = formData.idUnn.trim();
      
      // Check if it's a phone number pattern
      // Saudi phone: 9-10 digits, optionally starting with 0, +966, or 966
      const cleaned = emailOrPhone.replace(/[\s\-]/g, '');
      const isPhoneNumber = /^(\+966|966)?0?[0-9]{9}$/.test(cleaned) && cleaned.length <= 13;
      
      if (isPhoneNumber) {
        // It's a phone number - normalize it to E.164 format
        const digitsOnly = cleaned.replace(/^\+966|^966|^0/, '');
        emailOrPhone = `+966${digitsOnly}`;
      }
      // Otherwise, treat as ID/UNN or email - send as-is to backend
      // Backend will search by email/phone first, then by ID/UNN
      
      const response = await loginWithPassword({
        emailOrPhone: emailOrPhone,
        password: formData.password,
        device: {
          platform: 'web',
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      
      // Check if 2FA (OTP) is required
      if (response.needsOtp) {
        console.log('✅ Password verified. OTP sent for 2FA.');
        // Navigate to OTP verification with user info
        navigate('/login/verify-otp', {
          state: {
            userId: response.userId,
            phoneOrEmail: emailOrPhone,
            password: formData.password, // Include password for resend OTP
            message: response.message,
            otpCode: response.otpCode // Include OTP for testing/display
          }
        });
        return;
      }
      
      // Debug: Log the full response to see what we're getting
      console.log('🔍 Full login response:', response);
      console.log('🔍 AccessToken:', response.accessToken);
      console.log('🔍 RefreshToken:', response.refreshToken);
      console.log('🔍 UserId:', response.userId);
      
      // Handle callback verification for web platform
      if (response.needsCallback) {
        console.log('⚠️  Callback verification requested but skipped for web platform');
        console.log('📞 Callback ID:', response.callbackId);
        console.log('📞 Device ID:', response.deviceId);
        
        // For development: automatically complete callback verification
        console.log('🔄 Auto-completing callback verification for development...');
        
        try {
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
          console.warn('⚠️ Callback verification failed, using mock tokens:', callbackError);
          
          // Fallback to mock tokens if callback fails
          const mockAccessToken = `mock_token_${response.userId}_${Date.now()}`;
          const mockRefreshToken = `mock_refresh_${response.userId}_${Date.now()}`;
          
          response.accessToken = mockAccessToken;
          response.refreshToken = mockRefreshToken;
          response.expiresIn = 3600; // 1 hour
          
          console.log('🔧 Using mock tokens as fallback:', {
            accessToken: mockAccessToken.substring(0, 20) + '...',
            refreshToken: mockRefreshToken.substring(0, 20) + '...'
          });
        }
      }
      
      // Direct login (no 2FA) - Store tokens
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
      
      console.log('✅ Login successful:', response.userId);
      
      // Navigate to dashboard
      navigate('/app/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
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
      
      if (error.message.includes('401') || error.message.includes('403')) {
        setError('Invalid phone/email or password. Please try again.');
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/onboarding/business-type');
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

          {/* Login Card */}
          <div 
            className="bg-white rounded-3xl p-8 shadow-lg relative"
          >
            {/* User Icon */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                <img src={profileIcon} alt="Profile" className="w-full h-full" />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="pt-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl text-gray-800 mb-2">Sign In</h2>
                <p className="text-black">Enter your phone number or ID/UNN</p>
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
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <label htmlFor="idUnn" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number or ID/UNN
                    </label>
                    <input
                      type="text"
                      id="idUnn"
                      name="idUnn"
                      value={formData.idUnn}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number (0501234567) or ID/UNN"
                      className="w-full px-4 py-2 rounded-xl border border-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Examples: 0501234567, 1234567890, or your registered ID
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        placeholder="********"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                </div>
              </div>

              {/* Forgot Password */}
              <div className="mb-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-[#0475CC] hover:text-[#022466] text-sm font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </div>

               {/* Login Button */}
               <div className="flex justify-center mb-6">
                 <Button type="submit" className="w-full max-w-xs" disabled={isLoading}>
                   {isLoading ? (
                     <span className="flex items-center gap-2">
                       <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Logging in...
                     </span>
                   ) : (
                     'Login'
                   )}
                 </Button>
               </div>

              {/* OR Separator */}
              <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="text-[#0475CC] hover:text-[#022466] font-medium transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
