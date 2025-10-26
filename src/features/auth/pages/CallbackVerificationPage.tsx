import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import logo from '../../../assets/logo-mark.svg';
import { apiUrl } from '../../../lib/api';

interface CallbackStatus {
  callbackId: string;
  status: string;
  userResponse?: string;
  expiresAt: string;
  message: string;
}

export default function CallbackVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<string>('calling');
  const [message, setMessage] = useState('We are calling your registered phone number...');
  const [callbackId, setCallbackId] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const state = location.state as {
      callbackId?: string;
      deviceInfo?: any;
      userId?: string;
    };

    if (state?.callbackId) {
      setCallbackId(state.callbackId);
      setDeviceInfo(state.deviceInfo);
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!callbackId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(apiUrl(`/api/v1/auth/callback-status/${callbackId}`));
        const data: CallbackStatus = await response.json();

        setMessage(data.message);
        setStatus(data.status);

        if (data.status === 'confirmed') {
          // Callback confirmed - complete login
          await completeLogin();
        } else if (data.status === 'rejected') {
          // User rejected
          setMessage('Login cancelled. You pressed 2 to reject this login request.');
          setTimeout(() => navigate('/login'), 3000);
        } else if (data.status === 'expired') {
          // Expired
          setMessage('Verification expired. Please try logging in again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('Error checking callback status:', error);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(checkStatus, 2000);

    // Initial check
    checkStatus();

    return () => clearInterval(interval);
  }, [callbackId]);

  const completeLogin = async () => {
    try {
      const response = await fetch(apiUrl(`/api/v1/auth/callback-complete/${callbackId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceInfo || {})
      });

      const data = await response.json();

      if (data.accessToken) {
        // Store tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Navigate to dashboard
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 1500);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Error completing login:', error);
      setMessage('Error completing login. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

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
            className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50"
            style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
            }}
          >
            {/* Phone Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#022466] flex items-center justify-center">
                {status === 'calling' || status === 'pending' ? (
                  <svg className="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                ) : status === 'confirmed' ? (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#022466] mb-2">
                {status === 'calling' || status === 'pending' ? 'Phone Verification' :
                 status === 'confirmed' ? 'Verification Successful' :
                 'Verification Failed'}
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>

            {/* Instructions */}
            {(status === 'calling' || status === 'pending') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Please answer the phone call</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Press <strong>1</strong> to confirm this login</li>
                  <li>Press <strong>2</strong> to cancel</li>
                </ul>
              </div>
            )}

            {/* Loading Spinner */}
            {(status === 'calling' || status === 'pending') && (
              <div className="flex justify-center mb-6">
                <svg className="animate-spin h-10 w-10 text-[#022466]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}

            {/* Cancel Button */}
            {(status === 'calling' || status === 'pending') && (
              <div className="flex justify-center">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full max-w-xs bg-white border-2 border-[#022466] text-[#022466] hover:bg-gray-50"
                >
                  Cancel Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

