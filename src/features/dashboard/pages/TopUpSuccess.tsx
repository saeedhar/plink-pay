import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import checkCircle from '../../../assets/check_circle.svg';

const TopUpSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get transaction details from navigation state
  const state = location.state as {
    cardType?: string;
    last4?: string;
    amount?: string;
    timestamp?: string;
  };

  const cardType = state?.cardType || 'Card';
  const last4 = state?.last4 || '2345';
  const amount = state?.amount || '500';
  const timestamp = state?.timestamp || new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const handleDone = () => {
    navigate('/services/topup');
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
          <div 
            className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white"
            style={{ maxWidth: 500 }}
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <img src={checkCircle} alt="Success" style={{ width: 84, height: 84 }} />
            </div>

            {/* Success Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">
                Wallet Top-up Successful
              </h2>
              <p className="text-[#9CA3AF] text-base leading-relaxed">
                Your wallet has been successfully topped up using your Card.<br />
                ({cardType} ending with {last4})<br />
                with an amount of {amount} SAR<br />
                on {timestamp}.
              </p>
            </div>

            {/* Done Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleDone}
                className="w-full max-w-xs py-3 px-6 rounded-full border-2 border-[#022466] text-[#022466] font-medium hover:bg-[#022466] hover:text-white transition-all"
                style={{
                  fontSize: 16,
                  fontWeight: 600
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpSuccess;

