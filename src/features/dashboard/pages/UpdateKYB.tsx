import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoDocumentTextOutline } from 'react-icons/io5';
import KYBIcon from '../../../assets/KYB.svg';
import { fetchAllKybOptions, type PublicKybOption } from '../../onboarding/api/kybPublicService';

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

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    
    // Prepare KYB data to pass to OTP screen
    const kybData = {
      sourceOfFunds: sourceOfFunds === 'other' ? { value: 'other', other: sourceOfFundsOther } : sourceOfFunds,
      expectedTransactionType,
      expectedMonthlyVolume,
      purposeOfAccount: purposeOfAccount.includes('other') 
        ? { values: purposeOfAccount, other: purposeOther } 
        : purposeOfAccount
    };
    
    // Navigate to OTP screen
    navigate('/app/account-settings/kyb/otp', {
      state: { kybData }
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
                          disabled={isLoadingOptions}
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
                            disabled={isLoadingOptions}
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
                                disabled={isLoadingOptions}
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
                            disabled={isLoadingOptions}
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
                          disabled={isLoadingOptions}
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
                          disabled={isLoadingOptions}
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

                    {/* Buttons */}
                    <div className="modal-footer" style={{ marginTop: '100px', width: '100%' }}>
                      <button 
                        className="btn-secondary"
                        onClick={handleClose}
                      >
                        Close
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={handleNext}
                        disabled={isLoadingOptions}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {isLoadingOptions && (
                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ color: '#6B7280', fontFamily: 'Manrope', fontSize: '14px' }}>Loading options...</p>
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

