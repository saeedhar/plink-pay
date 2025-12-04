import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import '../../../styles/dashboard.css';

const UseBrowserLocation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    cardType?: 'mada' | 'mastercard'; 
    fee?: number;
    address?: string;
  } | null;

  const [isDetecting, setIsDetecting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleBack = () => {
    navigate('/app/services/cards/request-physical/delivery', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee
      }
    });
  };

  const handleTryAnotherMethod = () => {
    setShowErrorModal(false);
    navigate('/app/services/cards/request-physical/delivery', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee
      }
    });
  };

  const handleCloseError = () => {
    setShowErrorModal(false);
    navigate('/app/services/cards/request-physical/delivery', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee
      }
    });
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setShowErrorModal(true);
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get address (you'll need to implement this with an API)
          // For now, we'll use a placeholder address
          const address = `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          // Navigate back to delivery location screen with the detected address
          navigate('/app/services/cards/request-physical/delivery', {
            state: { 
              cardType: state?.cardType,
              fee: state?.fee,
              address: address,
              fromBrowserLocation: true,
              coordinates: { lat: latitude, lng: longitude }
            }
          });
        } catch (err) {
          console.error('Error getting address:', err);
          setIsDetecting(false);
          // Show error modal if address lookup fails
          setShowErrorModal(true);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsDetecting(false);
        // Show error modal for any error (permission denied, timeout, etc.)
        setShowErrorModal(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Show error modal if location detection failed
  if (showErrorModal) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gray-100">
        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Error Modal Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={handleCloseError}
                className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <svg width="64" height="64" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M29.9987 0L60 60H0L29.9987 0ZM8.69336 54.2029H51.3041L29.9987 11.5942L8.69336 54.2029ZM32.5091 24.6377V40.5797H27.4884V24.6377H32.5091ZM27.4884 44.9275H32.5191V50.7362H27.4884V44.9275Z" fill="#00BDFF"/>
                </svg>
              </div>

              {/* Error Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Unable to determine your location
                </h2>
                <p className="text-gray-500 text-base leading-relaxed">
                  We were unable to detect your address using GPS or the map. Please try another method to provide your address, or close this window and try again later.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleTryAnotherMethod}
                  className="w-full py-3 px-6 rounded-xl bg-[#022466] text-white font-medium hover:bg-[#011a4d] transition-all"
                >
                  Try Another Method
                </button>
                <button
                  onClick={handleCloseError}
                  className="w-full py-3 px-6 rounded-xl bg-white border-2 border-[#022466] text-[#022466] font-medium hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="use-browser-location-screen">
            <div className="use-browser-location-container">
              {/* Title */}
              <h2 className="use-browser-location-title">Use Browser Location</h2>
              
              {/* Description */}
              <p className="use-browser-location-description">
                Click the button below to allow the browser to detect your location. If your browser blocks the request, please enable location access from your browser settings.
              </p>

              {/* Detect Button */}
              <button 
                className="use-browser-location-button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
              >
                {isDetecting ? 'Detecting...' : 'Detect My Location'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseBrowserLocation;

