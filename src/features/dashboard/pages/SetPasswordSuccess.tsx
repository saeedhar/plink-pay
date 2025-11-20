import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo-mark.svg';
import checkCircle from '../../../assets/check_circle.svg';

const SetPasswordSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get password data from navigation state if needed
    const state = location.state as { passwordData?: any };
    if (state?.passwordData) {
      // Could log or use the data if needed
      console.log('Password Data:', state.passwordData);
    }
  }, [location]);

  // Prevent browser back button from going back to success screen
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Prevent going back to success screen
      navigate('/app/account-settings', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const handleDone = () => {
    navigate('/app/account-settings', { replace: true });
  };

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
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
          {/* Success Card */}
          <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white">
            {/* Success Content */}
            <div className="text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <img src={checkCircle} alt="Success" className="w-20 h-20" />
              </div>

              {/* Success Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">
                  Password Changed Successfully
                </h2>
                <p className="text-gray-600">
                  Your password has been successfully changed on{' '}
                  <span className="font-medium text-gray-700">({getCurrentDate()})</span>
                </p>
              </div>

              {/* Done Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleDone}
                  className="w-full max-w-xs py-3 px-6 rounded-full border-2 border-[#022466] text-[#022466] font-medium hover:bg-[#022466] hover:text-white transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordSuccess;

