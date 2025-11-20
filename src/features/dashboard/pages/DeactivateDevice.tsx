import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo-mark.svg';
import DeactivateIcon from '../../../assets/Profile/de-activate.svg';
import { UserManagementService } from '../../../services/userManagementService';

const DeactivateDevice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [deviceName, setDeviceName] = useState('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get device info from navigation state
    const state = location.state as { deviceId?: string; deviceName?: string };
    if (state?.deviceId) {
      setDeviceId(state.deviceId);
    }
    if (state?.deviceName) {
      setDeviceName(state.deviceName);
    }
    
    // If no deviceId, redirect back
    if (!state?.deviceId) {
      setError('Device ID is missing. Please start over.');
      setTimeout(() => {
        navigate('/app/account-settings/devices');
      }, 2000);
    }
  }, [location, navigate]);

  const handleClose = () => {
    navigate('/app/account-settings/devices');
  };

  const handleConfirm = async () => {
    if (!deviceId) {
      setError('Device ID is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Call API to initiate device deactivation
      const response = await UserManagementService.initiateDeviceDeactivation({
        deviceId
      });
      
      // Navigate to OTP verification screen
      navigate('/app/account-settings/devices/deactivate/otp', {
        state: { 
          deviceId,
          deviceName,
          sessionId: response.sessionId,
          otpCode: response.otpCode
        }
      });
    } catch (error: any) {
      console.error('Failed to initiate device deactivation:', error);
      setError(error.message || 'Failed to initiate device deactivation. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        

          {/* Deactivate Card */}
          <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white">
            {/* Content */}
            <div className="text-center">
              {/* Deactivate Icon */}
              <div className="flex justify-center mb-6">
                <img src={DeactivateIcon} alt="Deactivate" className="w-20 h-20" />
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">
                  Deactivate Device?
                </h2>
                <p className="text-gray-600">
                  Are you sure you want to deactivate{' '}
                  <span className="font-semibold text-[#022466]">{deviceName || 'this device'}</span>? 
                  This device will no longer have access to your account.
                </p>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleClose}
                  className="flex-1 max-w-xs py-3 px-6 rounded-full border-2 border-[#022466] text-[#022466] font-medium hover:bg-[#022466] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Close
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 max-w-xs py-3 px-6 rounded-full bg-[#022466] text-white font-medium hover:bg-[#011a4d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !deviceId}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateDevice;

