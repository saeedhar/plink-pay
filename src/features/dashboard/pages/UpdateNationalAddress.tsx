import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoHomeOutline } from 'react-icons/io5';
import { UserManagementService } from '../../../services/userManagementService';

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
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usePasscode, setUsePasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const addressLoadedRef = useRef(false);
  
  // Dynamic options for cities and districts from API
  const [cityOptions, setCityOptions] = useState<string[]>(['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina']);
  const [districtOptions, setDistrictOptions] = useState<string[]>(['Al Olaya', 'Al Malaz', 'Al Nakheel', 'King Fahd District']);
  const [regionOptions, setRegionOptions] = useState<string[]>(['Riyadh', 'Makkah', 'Eastern Province', 'Qassim', 'Medina']);

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

  // Fetch national address and pre-fill form fields
  useEffect(() => {
    const loadNationalAddress = async () => {
      // Only load once
      if (addressLoadedRef.current) return;
      
      addressLoadedRef.current = true;
      
      try {
        setIsLoadingAddress(true);
        console.log('🔍 Fetching national address...');
        const address = await UserManagementService.getNationalAddress();
        
        console.log('✅ Raw address response:', address);
        console.log('📋 Address fields:', {
          city: address?.city,
          district: address?.district,
          street: address?.street,
          buildingNumber: address?.buildingNumber,
          postalCode: address?.postalCode,
          additionalNumber: address?.additionalNumber
        });
        
        // Pre-fill form fields with address data
        if (address && (address.city || address.district || address.street || address.buildingNumber)) {
          // Helper function to capitalize first letter of each word
          const capitalizeWords = (str: string): string => {
            return str
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          };
          
          // Helper function to find matching option or prepare to add if not found
          const findOrPrepareOption = (
            value: string | undefined | null, 
            currentOptions: string[]
          ): { match: string; shouldAdd: boolean; newValue: string } => {
            if (!value || typeof value !== 'string') {
              return { match: '', shouldAdd: false, newValue: '' };
            }
            
            const normalizedValue = value.trim();
            if (!normalizedValue) return { match: '', shouldAdd: false, newValue: '' };
            
            // Capitalize the value for display
            const capitalizedValue = capitalizeWords(normalizedValue);
            
            // Try to find exact match (case-insensitive)
            const match = currentOptions.find(opt => 
              opt.toLowerCase() === normalizedValue.toLowerCase()
            );
            
            if (match) {
              return { match, shouldAdd: false, newValue: match };
            } else {
              console.log(`➕ Will add new option: "${capitalizedValue}" to dropdown`);
              return { match: '', shouldAdd: true, newValue: capitalizedValue };
            }
          };
          
          // Process city
          const cityResult = findOrPrepareOption(address.city, cityOptions);
          const processedCity = cityResult.match || cityResult.newValue;
          if (cityResult.shouldAdd && cityResult.newValue) {
            setCityOptions(prev => [...prev, cityResult.newValue]);
          }
          
          // Process district
          const districtResult = findOrPrepareOption(address.district, districtOptions);
          const processedDistrict = districtResult.match || districtResult.newValue;
          if (districtResult.shouldAdd && districtResult.newValue) {
            setDistrictOptions(prev => [...prev, districtResult.newValue]);
          }
          
          // Infer region from city (try to match or infer)
          let processedRegion = '';
          if (processedCity) {
            const cityToRegionMap: { [key: string]: string } = {
              'Riyadh': 'Riyadh',
              'Jeddah': 'Makkah',
              'Dammam': 'Eastern Province',
              'Mecca': 'Makkah',
              'Medina': 'Medina',
              'Jubail': 'Eastern Province' // Add mapping for Jubail
            };
            
            processedRegion = cityToRegionMap[processedCity] || '';
            
            // If no mapping found, try to add region to options if city suggests a region
            if (!processedRegion && processedCity) {
              // For now, leave region empty or add a default mapping
              // You can extend this logic based on your needs
            }
          }
          
          // Prepare the new form data
          const newFormData = {
            region: processedRegion,
            city: processedCity,
            district: processedDistrict,
            buildingNumber: address.buildingNumber || '',
            streetName: address.street || '',
            postalCode: address.postalCode || '',
            additionalNumber: address.additionalNumber || ''
          };
          
          console.log('📝 Setting form data:', newFormData);
          
          // Set all form data at once
          setFormData(prev => ({
            ...prev,
            ...newFormData
          }));
          
          // Debug logging
          console.log('✅ Address mapping complete:', {
            apiResponse: {
              city: address.city,
              district: address.district,
              street: address.street,
              buildingNumber: address.buildingNumber,
              postalCode: address.postalCode,
              additionalNumber: address.additionalNumber
            },
            processed: {
              city: processedCity,
              district: processedDistrict,
              region: processedRegion
            }
          });
        } else {
          console.log('⚠️ Address response is empty or null');
        }
      } catch (error) {
        console.error('❌ Failed to load national address:', error);
        // Don't show error to user, just log it - form can still be filled manually
      } finally {
        setIsLoadingAddress(false);
      }
    };

    loadNationalAddress();
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

  const handleNext = async () => {
    // Validate all required fields
    const newErrors: { [key: string]: string } = {};
    
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
    
    // Validate passcode if using passcode method
    if (usePasscode) {
      if (!passcode || passcode.length !== 6) {
        newErrors.passcode = 'Please enter a 6-digit passcode';
      }
    }
    
    // If there are errors, set them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrors({});
      
      // Map form fields to API request
      const addressRequest = {
        buildingNumber: formData.buildingNumber,
        street: formData.streetName,
        district: formData.district,
        city: formData.city,
        postalCode: formData.postalCode,
        additionalNumber: formData.additionalNumber || undefined
      };
      
      if (usePasscode) {
        // Use passcode-based update (no OTP)
        const response = await UserManagementService.updateAddressWithPasscode({
          ...addressRequest,
          passcode
        });
        
        if (response.success) {
          navigate('/app/account-settings/national-address/success', { replace: true });
        } else {
          setErrors({ general: response.message || 'Failed to update address' });
        }
      } else {
        // Use OTP-based update
        const response = await UserManagementService.initiateAddressUpdate(addressRequest);
        
        // Navigate to OTP screen
        navigate('/app/account-settings/national-address/otp', {
          state: { 
            formData: addressRequest,
            sessionId: response.sessionId,
            otpCode: response.otpCode
          }
        });
      }
    } catch (error: any) {
      console.error('Failed to initiate address update:', error);
      setErrors({ general: error.message || 'Failed to initiate address update. Please try again.' });
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
            <div className="update-mobile-modal" style={{ maxWidth: '800px' }}>
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
                <div className="address-form-grid" >
                  {/* Left Column */}
                  <div className="address-form-column">
                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Region</label>
                      <div className="address-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={formData.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          className={`email-input ${errors.region ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                          disabled={isLoadingAddress}
                        >
                          <option value="">Select Region</option>
                          {regionOptions.map((region) => (
                            <option key={region} value={region}>{region}</option>
                          ))}
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
                      <div className="address-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={`email-input ${errors.city ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                          disabled={isLoadingAddress}
                        >
                          <option value="">Select City</option>
                          {cityOptions.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
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
                      <div className="address-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={formData.district}
                          onChange={(e) => handleInputChange('district', e.target.value)}
                          className={`email-input ${errors.district ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                          disabled={isLoadingAddress}
                        >
                          <option value="">Select District</option>
                          {districtOptions.map((district) => (
                            <option key={district} value={district}>{district}</option>
                          ))}
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
                        disabled={isLoadingAddress}
                      />
                      {errors.streetName && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.streetName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="address-form-column">
                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Building Number</label>
                      <input
                        type="text"
                        value={formData.buildingNumber}
                        onChange={(e) => handleInputChange('buildingNumber', e.target.value)}
                        placeholder="Enter Building Number"
                        className={`email-input ${errors.buildingNumber ? 'email-input-error' : ''}`}
                        disabled={isLoadingAddress}
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
                        disabled={isLoadingAddress}
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
                        disabled={isLoadingAddress}
                      />
                      {errors.additionalNumber && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.additionalNumber}
                        </div>
                      )}
                    </div>

                    {/* General Error Message */}
                    {errors.general && (
                      <div className="error-message" style={{ marginLeft: '8px', marginTop: '8px', marginBottom: '16px' }}>
                        {errors.general}
                      </div>
                    )}

                    {/* Buttons - Under Additional Number */}
                    <div className="modal-footer" style={{ marginTop: '32px', width: '100%', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                      <button 
                        className="btn-secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        style={{ minWidth: '150px' }}
                      >
                        Back
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={handleNext}
                        disabled={isLoadingAddress || isSubmitting}
                        style={{ minWidth: '150px' }}
                      >
                        {isSubmitting ? 'Processing...' : 'Next'}
                      </button>
                    </div>
                  </div>
                </div>

                {isLoadingAddress && (
                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ color: '#6B7280', fontFamily: 'Manrope', fontSize: '14px' }}>
                      Loading your address data...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNationalAddress;

