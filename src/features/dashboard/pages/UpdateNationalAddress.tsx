import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoHomeOutline } from 'react-icons/io5';

const UpdateNationalAddress: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    region: '',
    city: '',
    district: '',
    streetName: '',
    buildingNumber: '',
    postalCode: '',
    additionalNumber: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleClose = () => {
    navigate('/app/account-settings');
  };

  const handleNext = () => {
    // Validate all required fields
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }
    
    if (!formData.streetName.trim()) {
      newErrors.streetName = 'Street Name is required';
    }
    
    if (!formData.buildingNumber.trim()) {
      newErrors.buildingNumber = 'Building Number is required';
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal Code is required';
    }
    
    if (!formData.additionalNumber.trim()) {
      newErrors.additionalNumber = 'Additional Number is required';
    }
    
    // If there are errors, set them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // If validation passes, navigate to OTP screen
    console.log('National address data:', formData);
    
    // Navigate to OTP verification screen
    navigate('/app/account-settings/national-address/otp', {
      state: { formData }
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
            <div className="update-mobile-modal kyb-modal">
              {/* Header */}
              <div className="modal-header">
                <div className="modal-header-icon">
                  <IoHomeOutline size={24} color="#022466" />
                </div>
                <h2 className="modal-title">Update National Address</h2>
              </div>

              {/* Content */}
              <div className="modal-content">
                {/* Icon and Title Section */}
                <div className="email-add-section">
                  <div className="email-add-icon">
                    <IoHomeOutline size={50} color="#022466" />
                  </div>
                  
                  <h3 className="email-add-title">Update National Address</h3>
                  <p className="email-add-description">
                    Please enter your updated national address details to keep your account information accurate and up to date.
                  </p>
                </div>

                {/* Form Section */}
                <div className="kyb-form-grid" style={{ marginTop: '24px' }}>
                  {/* Left Column */}
                  <div className="kyb-form-column">
                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Region</label>
                      <div className="kyb-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={formData.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          className={`email-input ${errors.region ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                        >
                          <option value="">Select Region</option>
                          <option value="Riyadh">Riyadh</option>
                          <option value="Makkah">Makkah</option>
                          <option value="Eastern Province">Eastern Province</option>
                          <option value="Qassim">Qassim</option>
                          <option value="Medina">Medina</option>
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {errors.region && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.region}
                        </div>
                      )}
                    </div>

                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>City</label>
                      <div className="kyb-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={`email-input ${errors.city ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                        >
                          <option value="">Select City</option>
                          <option value="Riyadh">Riyadh</option>
                          <option value="Jeddah">Jeddah</option>
                          <option value="Dammam">Dammam</option>
                          <option value="Mecca">Mecca</option>
                          <option value="Medina">Medina</option>
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {errors.city && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.city}
                        </div>
                      )}
                    </div>

                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>District</label>
                      <div className="kyb-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={formData.district}
                          onChange={(e) => handleInputChange('district', e.target.value)}
                          className={`email-input ${errors.district ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                        >
                          <option value="">Select District</option>
                          <option value="Al Olaya">Al Olaya</option>
                          <option value="Al Malaz">Al Malaz</option>
                          <option value="Al Nakheel">Al Nakheel</option>
                          <option value="King Fahd District">King Fahd District</option>
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {errors.district && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.district}
                        </div>
                      )}
                    </div>

                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Street Name</label>
                      <input
                        type="text"
                        value={formData.streetName}
                        onChange={(e) => handleInputChange('streetName', e.target.value)}
                        placeholder="Enter Street Name"
                        className={`email-input ${errors.streetName ? 'email-input-error' : ''}`}
                      />
                      {errors.streetName && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.streetName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="kyb-form-column">
                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Building Number</label>
                      <input
                        type="text"
                        value={formData.buildingNumber}
                        onChange={(e) => handleInputChange('buildingNumber', e.target.value)}
                        placeholder="Enter Building Number"
                        className={`email-input ${errors.buildingNumber ? 'email-input-error' : ''}`}
                      />
                      {errors.buildingNumber && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.buildingNumber}
                        </div>
                      )}
                    </div>

                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Postal Code</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="Enter Postal Code"
                        className={`email-input ${errors.postalCode ? 'email-input-error' : ''}`}
                      />
                      {errors.postalCode && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.postalCode}
                        </div>
                      )}
                    </div>

                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Additional Number</label>
                      <input
                        type="text"
                        value={formData.additionalNumber}
                        onChange={(e) => handleInputChange('additionalNumber', e.target.value)}
                        placeholder="Enter Additional Number"
                        className={`email-input ${errors.additionalNumber ? 'email-input-error' : ''}`}
                      />
                      {errors.additionalNumber && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.additionalNumber}
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="modal-footer" style={{ marginTop: '100px' }}>
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
        </div>
      </div>
    </div>
  );
};

export default UpdateNationalAddress;

