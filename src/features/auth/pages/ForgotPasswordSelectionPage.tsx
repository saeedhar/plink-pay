import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';

export default function ForgotPasswordSelectionPage() {
  const navigate = useNavigate();

  const handleIDBODFlow = () => {
    navigate('/forgot-password/id-bod');
  };

  const handlePhoneFlow = () => {
    navigate('/forgot-password/phone');
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

          {/* Selection Card */}
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

            {/* Content */}
            <div className="pt-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">Forgot Password?</h2>
                <p className="text-gray-600">
                  Choose how you'd like to reset your password
                </p>
              </div>

              {/* Option 1: ID/BOD Flow */}
              <div className="mb-6">
                <button
                  onClick={handleIDBODFlow}
                  className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-[#022466] transition-all text-left group"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-[#022466] transition-colors">
                      <svg className="w-6 h-6 text-[#022466] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Using ID/UNN & Date of Birth</h3>
                      <p className="text-sm text-gray-600">Reset with your ID/UNN and date of birth</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Option 2: Phone Flow */}
              <div className="mb-6">
                <button
                  onClick={handlePhoneFlow}
                  className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-[#022466] transition-all text-left group"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-[#022466] transition-colors">
                      <svg className="w-6 h-6 text-[#022466] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Using ID/UNN & Phone Number</h3>
                      <p className="text-sm text-gray-600">Reset with your ID/UNN and phone number</p>
                    </div>
                  </div>
                </button>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
