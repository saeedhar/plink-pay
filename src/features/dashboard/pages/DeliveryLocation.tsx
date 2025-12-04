import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import deliveryLocationIcon from '../../../assets/card-service/deleviry-location.svg';
import yourLocationIcon from '../../../assets/card-service/your-location.svg';
import selectMapIcon from '../../../assets/card-service/select-map.svg';
import currentLocationIcon from '../../../assets/card-service/current-location.svg';
import addIcon from '../../../assets/card-service/add-icon.svg';
import logo from '../../../assets/hero-logo-mini.svg';
import chevronRight from '../../../assets/chevrom-right.svg';
import '../../../styles/dashboard.css';

const DeliveryLocation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    cardType?: 'mada' | 'mastercard'; 
    fee?: number;
    address?: string;
    fromMap?: boolean;
    fromBrowserLocation?: boolean;
    source?: string;
    reason?: string;
  } | null;
  const isReplacement = state?.source === 'card-replacement';

  // Get address from state or use default
  const [registeredAddress, setRegisteredAddress] = useState(
    state?.address || "1234 Elm Street, Riyadh, Al Riyadh"
  );

  // Update address if it comes from map selection or browser location
  useEffect(() => {
    if (state?.address && (state?.fromMap || state?.fromBrowserLocation)) {
      setRegisteredAddress(state.address);
    }
  }, [state]);

  const handleBack = () => {
    navigate('/app/services/cards/request-physical/fee', {
      state: { 
        cardType: state?.cardType,
        source: state?.source,
        reason: state?.reason
      }
    });
  };

  const handleConfirmAddress = () => {
    // Navigate to OTP screen with address confirmation
    navigate('/app/services/cards/request-physical/otp', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee,
        address: registeredAddress,
        source: state?.source,
        reason: state?.reason
      }
    });
  };

  const handleAddNewAddress = () => {
    navigate('/app/account-settings/national-address', {
      state: { 
        fromDeliveryLocation: true,
        cardType: state?.cardType,
        fee: state?.fee,
        source: state?.source,
        reason: state?.reason
      }
    });
  };

  const handleSelectOnMap = () => {
    navigate('/app/services/cards/request-physical/delivery/map', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee,
        source: state?.source,
        reason: state?.reason
      }
    });
  };

  const handleUseBrowserLocation = () => {
    navigate('/app/services/cards/request-physical/delivery/map/browser-location', {
      state: { 
        cardType: state?.cardType,
        fee: state?.fee,
        source: state?.source,
        reason: state?.reason
      }
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="delivery-location-screen">
            {/* Header */}
            <div className="delivery-location-header">
              <button 
                className="delivery-location-back-button"
                onClick={handleBack}
                aria-label="Back"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="delivery-location-header-icon">
                <img src={logo} alt="Delivery Location" />
              </div>
              <h2 className="delivery-location-header-title">Delivery Location</h2>
            </div>

            {/* Top Card - Registered Address */}
            <div className="delivery-location-card">
              <div className="delivery-location-card-content">
                <div className="delivery-location-pin-icon">
                  <img src={deliveryLocationIcon} alt="Location" />
                </div>
                <p className="delivery-location-prompt">
                  Your registered national address is:
                </p>
                <div className="delivery-location-address-field">
                  <div className="delivery-location-address-icon">
                    <img src={yourLocationIcon} alt="Location" />
                  </div>
                  <span className="delivery-location-address-text">{registeredAddress}</span>
                </div>
                <button 
                  className="delivery-location-confirm-button"
                  onClick={handleConfirmAddress}
                >
                  Confirm Address
                </button>
              </div>
            </div>

            {/* Bottom Card - Alternative Options */}
            <div className="delivery-location-card">
              <div className="delivery-location-card-content">
                <p className="delivery-location-description">
                  You can confirm your existing address or choose another method to provide your delivery location.
                </p>
                <div className="delivery-location-options">
                  <div 
                    className="delivery-location-option"
                    onClick={handleAddNewAddress}
                  >
                    <div className="delivery-location-option-icon">
                      <img src={addIcon} alt="Add" />
                    </div>
                    <span className="delivery-location-option-text">Add New Address</span>
                    <div className="delivery-location-option-chevron">
                      <img src={chevronRight} alt="Chevron" />
                    </div>
                  </div>
                  
                  <div 
                    className="delivery-location-option"
                    onClick={handleSelectOnMap}
                  >
                    <div className="delivery-location-option-icon">
                      <img src={selectMapIcon} alt="Select on Map" />
                    </div>
                    <span className="delivery-location-option-text">Select on Map</span>
                    <div className="delivery-location-option-chevron">
                      <img src={chevronRight} alt="Chevron" />
                    </div>
                  </div>
                  
                  <div 
                    className="delivery-location-option"
                    onClick={handleUseBrowserLocation}
                  >
                    <div className="delivery-location-option-icon">
                      <img src={currentLocationIcon} alt="Use Browser Location" />
                    </div>
                    <span className="delivery-location-option-text">Use Browser Location</span>
                    <div className="delivery-location-option-chevron">
                      <img src={chevronRight} alt="Chevron" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLocation;

