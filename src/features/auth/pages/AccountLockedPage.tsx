import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';

export default function AccountLockedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    lockType?: string;
    lockReason?: string;
    unlockMethod?: string;
  };

  const lockType = state?.lockType || 'soft';
  const lockReason = state?.lockReason || 'Your account has been locked for security reasons.';
  const unlockMethod = state?.unlockMethod || 'forgot_password';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
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

          {/* Card */}
          <div
            className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-red-200/50"
            style={{
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 25%, #FECACA40 50%, #F8FAFC 100%)'
            }}
          >
            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C9.243 2 7 4.243 7 7v2H6c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v2H9V7zm9.002 13H13v-2.278c.595-.347 1-.985 1-1.722 0-1.103-.897-2-2-2s-2 .897-2 2c0 .737.405 1.375 1 1.722V20H5.998v-9H18l.002 9z"/>
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Account Locked</h2>
              <p className="text-gray-700 mb-4">{lockReason}</p>
            </div>

            {/* Lock Type Specific Content */}
            {lockType === 'hard' || unlockMethod === 'call_center' ? (
              <>
                {/* Hard Lock - Call Center */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Your account has been permanently locked.</strong>
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    This type of lock can only be removed by our support team for security reasons.
                  </p>
                  <div className="bg-white rounded p-3 mt-3">
                    <p className="text-sm text-gray-700 font-semibold mb-2">Contact Support:</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📞 Phone: <a href="tel:920012345" className="text-[#0475CC] hover:underline">920-012-345</a></p>
                      <p>📧 Email: <a href="mailto:support@tyaseerpay.com" className="text-[#0475CC] hover:underline">support@tyaseerpay.com</a></p>
                      <p>🕐 Hours: Sunday - Thursday, 9 AM - 5 PM</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full max-w-xs bg-gray-500 hover:bg-gray-600"
                  >
                    Back to Login
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Soft Lock - Forgot Password */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Too many failed login attempts.</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    To unlock your account and regain access, please reset your password using the "Forgot Password" option below.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button
                      onClick={() => navigate('/forgot-password')}
                      className="w-full max-w-xs"
                    >
                      Reset Password
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full max-w-xs bg-white border-2 border-[#022466] text-[#022466] hover:bg-gray-50"
                    >
                      Back to Login
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


