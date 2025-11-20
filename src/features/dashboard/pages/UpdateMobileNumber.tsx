import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import { UserManagementService } from '../../../services/userManagementService';
import { validateSaudiPhone, formatPhoneNumber } from '../../../utils/validators';

const UpdateMobileNumber: React.FC = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const validationError = validateSaudiPhone(number);
    return validationError || '';
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Format the phone number using the validator's formatter
    const formatted = formatPhoneNumber(value);
    // Store formatted value (with spaces for display)
    setMobileNumber(formatted);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleClose = () => {
    navigate('/app/account-settings');
  };

  const handleNext = async () => {
    const validationError = validateMobileNumber(mobileNumber);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Remove spaces from mobile number before constructing E.164 format
      const cleanMobileNumber = mobileNumber.replace(/\s/g, '');
      // Construct full phone number in E.164 format
      const fullPhoneNumber = `${countryCode}${cleanMobileNumber}`;
      
      // Call API to initiate mobile update
      const response = await UserManagementService.initiateMobileUpdate({
        newPhoneNumber: fullPhoneNumber
      });
      
      // Navigate to OTP verification page with sessionId
      navigate('/app/account-settings/mobile/otp', {
        state: { 
          mobileNumber: fullPhoneNumber,
          sessionId: response.sessionId,
          otpCode: response.otpCode // For testing/display
        }
      });
    } catch (error: any) {
      console.error('Failed to initiate mobile update:', error);
      setError(error.message || 'Failed to initiate mobile update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                      placeholder="05X XXX XXXX or 5XX XXX XXX"
                      className={`phone-input ${error ? 'phone-input-error' : ''}`}
                      maxLength={12}
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
                  disabled={isSubmitting || !mobileNumber.trim()}
                >
                  {isSubmitting ? 'Processing...' : 'Next'}
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
