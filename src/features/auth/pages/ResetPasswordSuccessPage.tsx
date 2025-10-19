import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';

export default function ResetPasswordSuccessPage() {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
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
              
              {/* Step 2 - OTP Verification (Completed) */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#022466] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-sm font-medium text-[#022466]">OTP Verification</span>
              </div>
              
              {/* Connector */}
              <div className="w-8 h-0.5 bg-[#022466]"></div>
              
              {/* Step 3 - New Password (Completed) */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#022466] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-sm font-medium text-[#022466]">New Password</span>
              </div>
              
              {/* Connector */}
              <div className="w-8 h-0.5 bg-[#022466]"></div>
              
              {/* Step 4 - Success (Active) */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#022466] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <span className="ml-2 text-sm font-medium text-[#022466]">Success</span>
              </div>
            </div>
          </div>

          {/* Success Card */}
          <div 
            className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative"
            style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
            }}
          >
            {/* Back Button */}
            <button
              onClick={handleGoToLogin}
              className="absolute top-6 left-6 text-[#022466] hover:text-[#0475CC] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Success Content */}
            <div className="pt-8 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#022466] flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-[#022466] mb-4">Password Changed Successfully</h2>
              
              {/* Description */}
              <p className="text-gray-600 mb-8">
                Your password has been updated. You can now log in with your new credentials.
              </p>

              {/* Go to Login Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={handleGoToLogin}
                  className="w-full max-w-xs"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
