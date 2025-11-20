import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoDocumentTextOutline } from 'react-icons/io5';
import KYBIcon from '../../../assets/KYB.svg';
import { fetchAllKybOptions, type PublicKybOption } from '../../onboarding/api/kybPublicService';
import { UserManagementService } from '../../../services/userManagementService';

const UpdateKYB: React.FC = () => {
  const navigate = useNavigate();
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [sourceOfFundsOther, setSourceOfFundsOther] = useState('');
  const [expectedTransactionType, setExpectedTransactionType] = useState('');
  const [expectedMonthlyVolume, setExpectedMonthlyVolume] = useState('');
  const [purposeOfAccount, setPurposeOfAccount] = useState<string[]>([]);
  const [purposeOther, setPurposeOther] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usePasscode, setUsePasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  const [kybOptions, setKybOptions] = useState<{
    sourceOfFunds: PublicKybOption[];
    purposeOfAccount: PublicKybOption[];
    businessActivity: PublicKybOption[];
    annualRevenue: PublicKybOption[];
  }>({
    sourceOfFunds: [],
    purposeOfAccount: [],
    businessActivity: [],
    annualRevenue: []
  });
  
  const profileLoadedRef = useRef(false);

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

  // Fetch KYB options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const options = await fetchAllKybOptions();
        setKybOptions(options);
      } catch (error) {
        console.error('Failed to load KYB options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // Fetch user profile and pre-fill KYB data
  useEffect(() => {
    const loadUserProfile = async () => {
      // Wait for options to be loaded first, and only load profile once
      if (isLoadingOptions || profileLoadedRef.current) return;
      
      // Check if we have options loaded
      if (kybOptions.sourceOfFunds.length === 0) return;
      
      profileLoadedRef.current = true;
      
      try {
        setIsLoadingProfile(true);
        const profile = await UserManagementService.getProfile();
        
        // Pre-fill source of funds
        if (profile.sourceOfFunds) {
          // Check if the value matches any option code or label
          const matchingOption = kybOptions.sourceOfFunds.find(
            opt => opt.code === profile.sourceOfFunds || 
                   opt.label.toLowerCase() === profile.sourceOfFunds.toLowerCase() ||
                   (opt.code && profile.sourceOfFunds.toLowerCase().includes(opt.code.toLowerCase()))
          );
          
          if (matchingOption) {
            const optionValue = matchingOption.code || matchingOption.label.toLowerCase().replace(/\s+/g, '-');
            setSourceOfFunds(optionValue);
          } else {
            // If no match, treat as "other"
            setSourceOfFunds('other');
            setSourceOfFundsOther(profile.sourceOfFunds);
          }
        }
        
        // Pre-fill business activity (expected transaction type)
        if (profile.businessActivity) {
          const matchingOption = kybOptions.businessActivity.find(
            opt => opt.code === profile.businessActivity ||
                   opt.label.toLowerCase() === profile.businessActivity.toLowerCase() ||
                   (opt.code && profile.businessActivity.toLowerCase().includes(opt.code.toLowerCase()))
          );
          
          if (matchingOption) {
            const optionValue = matchingOption.code || matchingOption.label.toLowerCase().replace(/\s+/g, '-');
            setExpectedTransactionType(optionValue);
          } else {
            setExpectedTransactionType(profile.businessActivity);
          }
        }
        
        // Pre-fill annual revenue (expected monthly volume)
        if (profile.annualRevenue) {
          const matchingOption = kybOptions.annualRevenue.find(
            opt => opt.code === profile.annualRevenue ||
                   opt.label.toLowerCase() === profile.annualRevenue.toLowerCase() ||
                   (opt.code && profile.annualRevenue.toLowerCase().includes(opt.code.toLowerCase()))
          );
          
          if (matchingOption) {
            const optionValue = matchingOption.code || matchingOption.label.toLowerCase().replace(/\s+/g, '-');
            setExpectedMonthlyVolume(optionValue);
          } else {
            setExpectedMonthlyVolume(profile.annualRevenue);
          }
        }
        
        // Pre-fill purpose of account (comma-separated, can be multiple checkboxes)
        if (profile.accountPurpose) {
          const purposes = profile.accountPurpose.split(',').map(p => p.trim()).filter(p => p);
          const selectedPurposes: string[] = [];
          let otherPurpose = '';
          
          purposes.forEach(purpose => {
            // Check if this purpose matches any option
            const matchingOption = kybOptions.purposeOfAccount.find(
              opt => opt.code === purpose ||
                     opt.label.toLowerCase() === purpose.toLowerCase() ||
                     (opt.code && purpose.toLowerCase().includes(opt.code.toLowerCase())) ||
                     purpose.toLowerCase().includes(opt.label.toLowerCase())
            );
            
            if (matchingOption) {
              const optionValue = matchingOption.code || matchingOption.label.toLowerCase().replace(/\s+/g, '-');
              if (!selectedPurposes.includes(optionValue)) {
                selectedPurposes.push(optionValue);
              }
            } else if (purpose.toLowerCase().includes('other')) {
              // Extract the "other" text
              const otherMatch = purpose.match(/other[:\s]+(.+)/i);
              if (otherMatch) {
                otherPurpose = otherMatch[1].trim();
              }
              if (!selectedPurposes.includes('other')) {
                selectedPurposes.push('other');
              }
            } else {
              // If no match and not "other", treat as "other" text
              if (!selectedPurposes.includes('other')) {
                selectedPurposes.push('other');
              }
              if (!otherPurpose) {
                otherPurpose = purpose;
              } else {
                otherPurpose += ', ' + purpose;
              }
            }
          });
          
          setPurposeOfAccount(selectedPurposes);
          if (otherPurpose) {
            setPurposeOther(otherPurpose);
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Don't show error to user, just log it - form can still be filled manually
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [isLoadingOptions, kybOptions.sourceOfFunds.length]);

  const handleCheckboxChange = (value: string) => {
    setPurposeOfAccount(prev => {
      if (prev.includes(value)) {
        const newList = prev.filter(item => item !== value);
        // Clear "other" text if "other" is unchecked
        if (value === 'other') {
          setPurposeOther('');
        }
        return newList;
      } else {
        return [...prev, value];
      }
    });
    if (errors.purposeOfAccount || errors.purposeOther) {
      setErrors(prev => {
        const newErrors: { [key: string]: string } = { ...prev, purposeOfAccount: '' };
        if (value !== 'other' && 'purposeOther' in newErrors) {
          delete newErrors.purposeOther;
        }
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!sourceOfFunds) {
      newErrors.sourceOfFunds = 'Source of Funds is required';
    }
    if (sourceOfFunds === 'other' && !sourceOfFundsOther.trim()) {
      newErrors.sourceOfFundsOther = 'Please specify your source of funds';
    }
    if (!expectedTransactionType) {
      newErrors.expectedTransactionType = 'Expected Transaction Type is required';
    }
    if (!expectedMonthlyVolume) {
      newErrors.expectedMonthlyVolume = 'Expected monthly payroll volume and value is required';
    }
    if (purposeOfAccount.length === 0) {
      newErrors.purposeOfAccount = 'Please select at least one purpose';
    }
    if (purposeOfAccount.includes('other') && !purposeOther.trim()) {
      newErrors.purposeOther = 'Please specify the other purpose';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    navigate('/app/account-settings');
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Validate passcode if using passcode method
    if (usePasscode) {
      if (!passcode || passcode.length !== 6) {
        setErrors({ ...errors, passcode: 'Please enter a 6-digit passcode' });
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      setErrors({});
      
      // Map form fields to API request
      const kybRequest = {
        sourceOfFunds: sourceOfFunds === 'other' ? sourceOfFundsOther : sourceOfFunds,
        businessActivity: expectedTransactionType,
        annualRevenue: expectedMonthlyVolume,
        accountPurpose: purposeOfAccount.join(', ') + (purposeOfAccount.includes('other') && purposeOther ? `, ${purposeOther}` : '')
      };
      
      if (usePasscode) {
        // Use passcode-based update (no OTP)
        const response = await UserManagementService.updateKybWithPasscode({
          ...kybRequest,
          passcode
        });
        
        if (response.success) {
          navigate('/app/account-settings/kyb/success', { replace: true });
        } else {
          setErrors({ general: response.message || 'Failed to update KYB information' });
        }
      } else {
        // Use OTP-based update
        const response = await UserManagementService.initiateKybUpdate(kybRequest);
        
        // Navigate to OTP screen
        navigate('/app/account-settings/kyb/otp', {
          state: { 
            kybData: kybRequest,
            sessionId: response.sessionId,
            otpCode: response.otpCode
          }
        });
      }
    } catch (error: any) {
      console.error('Failed to initiate KYB update:', error);
      setErrors({ general: error.message || 'Failed to initiate KYB update. Please try again.' });
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
            <div className="update-mobile-modal kyb-modal" style={{ maxWidth: '800px' }}>
              {/* Header */}
              <div className="modal-header">
                <div className="modal-header-icon">
                  <IoDocumentTextOutline size={24} color="#022466" />
                </div>
                <h2 className="modal-title">KYB Management</h2>
              </div>

              {/* Content */}
              <div className="modal-content">
                {/* Icon and Title Section */}
                <div className="email-add-section">
                  <div className="email-add-icon">
                    <img src={KYBIcon} alt="KYB" style={{ width: '50px', height: '50px' }} />
                  </div>
                  
                  <h3 className="email-add-title">Business Verification <span style={{ color: '#00BDFF' }}>(KYB)</span></h3>
                  <p className="email-add-description">To meet regulations, please provide your business details for verification.</p>
                </div>

                {/* Form Fields */}
                <div className="kyb-form-grid" style={{ marginTop: '24px' }}>
                  {/* Left Column */}
                  <div className="kyb-form-column">
                    {/* Source of Funds */}
                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Source of Funds</label>
                      <div className="kyb-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={sourceOfFunds}
                          onChange={(e) => {
                            setSourceOfFunds(e.target.value);
                            if (e.target.value !== 'other') {
                              setSourceOfFundsOther('');
                            }
                            if (errors.sourceOfFunds || errors.sourceOfFundsOther) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.sourceOfFunds;
                                if (e.target.value !== 'other') {
                                  delete newErrors.sourceOfFundsOther;
                                }
                                return newErrors;
                              });
                            }
                          }}
                          className={`email-input ${errors.sourceOfFunds ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                          disabled={isLoadingOptions || isLoadingProfile}
                        >
                          <option value="">Select your Source of Funds</option>
                          {kybOptions.sourceOfFunds.map((option) => (
                            <option key={option.id} value={option.code || option.label.toLowerCase().replace(/\s+/g, '-')}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {errors.sourceOfFunds && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.sourceOfFunds}
                        </div>
                      )}
                      {/* Source of Funds Other Field */}
                      {sourceOfFunds === 'other' && (
                        <div className="kyb-other-field" style={{ marginTop: '12px', width: '100%' }}>
                          <label className="form-label" style={{ marginLeft: '8px', marginBottom: '8px' }}>Please specify</label>
                          <textarea
                            value={sourceOfFundsOther}
                            onChange={(e) => {
                              setSourceOfFundsOther(e.target.value);
                              if (errors.sourceOfFundsOther) {
                                setErrors(prev => ({ ...prev, sourceOfFundsOther: '' }));
                              }
                            }}
                            placeholder="Please describe your source of funds"
                            className={`email-input ${errors.sourceOfFundsOther ? 'email-input-error' : ''}`}
                            style={{ width: '100%', minHeight: '60px', resize: 'vertical', padding: '12px 16px' }}
                            disabled={isLoadingOptions || isLoadingProfile}
                            rows={3}
                            maxLength={200}
                          />
                          {errors.sourceOfFundsOther && (
                            <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                              {errors.sourceOfFundsOther}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Purpose of Account - Checkboxes */}
                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '0' }}>
                      <label className="form-label" style={{ marginLeft: '8px', marginBottom: '12px' }}>Purpose of the Digital Wallet Account</label>
                      <div className="kyb-checkbox-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        {kybOptions.purposeOfAccount.map((option) => {
                          const optionValue = option.code || option.label.toLowerCase().replace(/\s+/g, '-');
                          const isChecked = purposeOfAccount.includes(optionValue);
                          return (
                            <label key={option.id} className="kyb-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', whiteSpace: 'nowrap', width: '100%', overflow: 'visible' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(optionValue)}
                                className="kyb-checkbox"
                                disabled={isLoadingOptions || isLoadingProfile}
                                style={{
                                  accentColor: '#00BDFF',
                                  border: isChecked ? 'none' : '1px solid #E5E5E5',
                                  backgroundColor: isChecked ? '#00BDFF' : 'transparent',
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '4px',
                                  flexShrink: 0
                                }}
                              />
                              <span style={{ fontFamily: 'Hanken Grotesk', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap', overflow: 'visible' }}>
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.purposeOfAccount && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '8px' }}>
                          {errors.purposeOfAccount}
                        </div>
                      )}
                      {/* Purpose Other Field */}
                      {purposeOfAccount.includes('other') && (
                        <div className="kyb-other-field" style={{ marginTop: '12px', width: '100%' }}>
                          <label className="form-label" style={{ marginLeft: '8px', marginBottom: '8px' }}>Other Purpose</label>
                          <input
                            type="text"
                            value={purposeOther}
                            onChange={(e) => {
                              setPurposeOther(e.target.value);
                              if (errors.purposeOther) {
                                setErrors(prev => ({ ...prev, purposeOther: '' }));
                              }
                            }}
                            placeholder="Please Enter Other Purpose..."
                            className={`email-input ${errors.purposeOther ? 'email-input-error' : ''}`}
                            style={{ width: '100%' }}
                            disabled={isLoadingOptions || isLoadingProfile}
                            maxLength={100}
                          />
                          {errors.purposeOther && (
                            <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                              {errors.purposeOther}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="kyb-form-column">
                    {/* Expected Transaction Type */}
                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Expected Transaction Type</label>
                      <div className="kyb-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={expectedTransactionType}
                          onChange={(e) => {
                            setExpectedTransactionType(e.target.value);
                            if (errors.expectedTransactionType) {
                              setErrors(prev => ({ ...prev, expectedTransactionType: '' }));
                            }
                          }}
                          className={`email-input ${errors.expectedTransactionType ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                          disabled={isLoadingOptions || isLoadingProfile}
                        >
                          <option value="">Expected Transaction Type</option>
                          {kybOptions.businessActivity.map((option) => (
                            <option key={option.id} value={option.code || option.label.toLowerCase().replace(/\s+/g, '-')}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {errors.expectedTransactionType && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.expectedTransactionType}
                        </div>
                      )}
                    </div>

                    {/* Expected Monthly Volume */}
                    <div className="form-section" style={{ alignItems: 'flex-start', marginBottom: '0' }}>
                      <label className="form-label" style={{ marginLeft: '8px' }}>Expected monthly payroll volume and value</label>
                      <div className="kyb-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={expectedMonthlyVolume}
                          onChange={(e) => {
                            setExpectedMonthlyVolume(e.target.value);
                            if (errors.expectedMonthlyVolume) {
                              setErrors(prev => ({ ...prev, expectedMonthlyVolume: '' }));
                            }
                          }}
                          className={`email-input ${errors.expectedMonthlyVolume ? 'email-input-error' : ''}`}
                          style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                          disabled={isLoadingOptions || isLoadingProfile}
                        >
                          <option value="">Select volume range</option>
                          {kybOptions.annualRevenue.map((option) => (
                            <option key={option.id} value={option.code || option.label.toLowerCase().replace(/\s+/g, '-')}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {errors.expectedMonthlyVolume && (
                        <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                          {errors.expectedMonthlyVolume}
                        </div>
                      )}
                    </div>

                    {/* Passcode Option */}
                    <div className="form-section" style={{ alignItems: 'flex-start', marginTop: '24px', marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginLeft: '8px' }}>
                        <input
                          type="checkbox"
                          checked={usePasscode}
                          onChange={(e) => {
                            setUsePasscode(e.target.checked);
                            setPasscode('');
                            if (errors.passcode) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.passcode;
                                return newErrors;
                              });
                            }
                          }}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontFamily: 'Hanken Grotesk', fontSize: '14px', color: '#374151' }}>
                          Use passcode instead of OTP
                        </span>
                      </label>
                      
                      {usePasscode && (
                        <div style={{ width: '100%', marginTop: '12px' }}>
                          <label className="form-label" style={{ marginLeft: '8px', marginBottom: '8px' }}>Passcode</label>
                          <input
                            type="password"
                            value={passcode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setPasscode(value);
                              if (errors.passcode) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.passcode;
                                  return newErrors;
                                });
                              }
                            }}
                            placeholder="Enter 6-digit passcode"
                            className={`email-input ${errors.passcode ? 'email-input-error' : ''}`}
                            style={{ width: '100%' }}
                            maxLength={6}
                          />
                          {errors.passcode && (
                            <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                              {errors.passcode}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* General Error Message */}
                    {errors.general && (
                      <div className="error-message" style={{ marginLeft: '8px', marginTop: '8px', marginBottom: '16px' }}>
                        {errors.general}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="modal-footer" style={{ marginTop: '24px', width: '100%' }}>
                      <button 
                        className="btn-secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Close
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={handleNext}
                        disabled={isLoadingOptions || isLoadingProfile || isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Next'}
                      </button>
                    </div>
                  </div>
                </div>

                {(isLoadingOptions || isLoadingProfile) && (
                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ color: '#6B7280', fontFamily: 'Manrope', fontSize: '14px' }}>
                      {isLoadingOptions ? 'Loading options...' : 'Loading your KYB data...'}
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

export default UpdateKYB;

