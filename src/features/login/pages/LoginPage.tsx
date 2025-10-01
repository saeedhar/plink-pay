import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import profileIcon from '../../../assets/ion_person-circle-sharp.svg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    idUnn: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
    // Navigate to OTP verification
    navigate('/otp-verification');
  };

  const handleSignUp = () => {
    navigate('/onboarding/business-type');
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
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="Tyaseer Pay" className="h-18 w-auto" />
            </div>
          </div>

          {/* Login Card */}
          <div 
            className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative"
            style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
            }}
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
                <p className="text-black">Enter your Information Number</p>
              </div>

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
                  className="w-full px-4 py-2 rounded-xl border border-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="mb-4">
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

              {/* Forgot Password */}
              <div className="text-left mb-6">
                <button
                  type="button"
                  className="text-[#0475CC] hover:text-[#022466] text-sm font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

               {/* Login Button */}
               <div className="flex justify-center mb-6">
                 <Button type="submit" className="w-full max-w-xs">
                   Login
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
