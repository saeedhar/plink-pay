import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import SuccessIcon from '../../../assets/success.svg';
import StepIndicator from '../../../assets/forgetpassword/4.svg';

export default function ResetPasswordSuccessPage() {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
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

          {/* Success Card */}
          <div className="bg-white rounded-3xl px-12 py-8 shadow-lg relative mt-4">
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
                <img src={SuccessIcon} alt="Success" className="w-20 h-20" />
              </div>

              {/* Title */}
              <h2 
                className="mb-4"
                style={{
                  fontFamily: 'Poppins, Lato, sans-serif',
                  fontWeight: 700,
                  fontSize: '32px',
                  lineHeight: '40px',
                  letterSpacing: '0%',
                  textAlign: 'center',
                  color: '#00BDFF'
                }}
              >
                Password Changed<br />Successfully
              </h2>
              
              {/* Description */}
              <div className="flex justify-center mb-8">
                <p 
                  className="max-w-md"
                  style={{
                    fontFamily: 'Poppins, Lato, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '26px',
                    letterSpacing: '0%',
                    textAlign: 'center',
                    color: '#494747'
                  }}
                >
                  Your password has been updated. You can now log in with your new credentials.
                </p>
              </div>

              {/* Go to Login Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGoToLogin}
                  className="w-80 py-4 rounded-xl font-bold text-lg bg-[#022466] text-white hover:bg-[#04147C] transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
