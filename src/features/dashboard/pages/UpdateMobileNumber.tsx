import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoPhonePortraitOutline } from 'react-icons/io5';

const UpdateMobileNumber: React.FC = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [error, setError] = useState('');

  useEffect(() => {
    // Add dashboard-root class to root element
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('dashboard-root');
    }
    
    // Cleanup function to remove class when component unmounts
    return () => {
      if (root) {
        root.classList.remove('dashboard-root');
      }
    };
  }, []);

  const validateMobileNumber = (number: string): string => {
    if (!number.trim()) {
      return 'Mobile number is required';
    }
    
    if (number.length !== 10) {
      return 'Mobile number must be exactly 10 digits';
    }
    
    if (!number.startsWith('05')) {
      return 'Mobile number must start with 05';
    }
    
    if (!/^\d+$/.test(number)) {
      return 'Mobile number must contain only digits';
    }
    
    return '';
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleClose = () => {
    navigate('/app/account-settings');
  };

  const handleNext = () => {
    const validationError = validateMobileNumber(mobileNumber);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Navigate to OTP verification page
    navigate('/app/account-settings/mobile/otp', {
      state: { mobileNumber }
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Account & Settings</h1>
          
          <div className="update-mobile-container">
            <div className="update-mobile-modal">
              {/* Header */}
              <div className="modal-header">
                <div className="modal-header-icon">
                  <IoPhonePortraitOutline size={24} color="#022466" />
                </div>
                <h2 className="modal-title">Update Mobile Number</h2>
              </div>

              {/* Content */}
              <div className="modal-content">
                <div className="modal-subtitle-section">
                  <h3 className="modal-subtitle">Change Mobile Number</h3>
                  <p className="modal-description">Enter New Phone</p>
                </div>

                <div className="form-section">
                  <label className="form-label">Mobile Number</label>
                  <div className="phone-input-container">
                    <div className="country-selector">
                     
                      <span className="country-code">{countryCode}</span>
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={handleMobileNumberChange}
                      placeholder="0512345678"
                      className={`phone-input ${error ? 'phone-input-error' : ''}`}
                      maxLength={10}
                    />
                  </div>
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={handleClose}
                >
                  Close
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateMobileNumber;
