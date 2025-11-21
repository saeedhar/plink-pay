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

  // Mapping function for old purpose codes to new codes
  const mapOldPurposeCode = (oldCode: string, availableOptions: PublicKybOption[]): string | null => {
    const lowerOldCode = oldCode.toLowerCase().trim();
    
    // Direct code mappings - map old codes to possible new codes
    const codeMap: Record<string, string[]> = {
      'customer_payments': ['receiving_payments', 'receive_payments', 'receiving-payments', 'customer_payments'],
      'suppliers': ['paying_suppliers', 'pay_suppliers', 'paying-suppliers'],
      'petty_cash': ['managing_cash', 'managing_petty_cash', 'managing-cash', 'managing-petty-cash', 'petty_cash'],
      'payroll': ['distributing_funds', 'distributing-funds'],
      'disbursements': ['receiving_disbursements', 'receiving-disbursements'],
    };
    
    // Normalize function to handle underscore/hyphen variations
    const normalizeCode = (code: string) => code.toLowerCase().replace(/[_-]/g, '');
    
    // Try exact match first
    if (codeMap[lowerOldCode]) {
      // Check which mapped code exists in available options
      for (const mappedCode of codeMap[lowerOldCode]) {
        const found = availableOptions.find(opt => {
          if (!opt.code) return false;
          const optCodeNormalized = normalizeCode(opt.code);
          const mappedCodeNormalized = normalizeCode(mappedCode);
          return opt.code.toLowerCase() === mappedCode.toLowerCase() ||
                 optCodeNormalized === mappedCodeNormalized;
        });
        if (found && found.code) {
          console.log(`🔄 Mapped "${oldCode}" -> "${found.code}" (from mapping)`);
          return found.code;
        }
      }
    }
    
    // Try partial match in code map
    for (const [old, newCodes] of Object.entries(codeMap)) {
      if (lowerOldCode.includes(old) || old.includes(lowerOldCode)) {
        for (const mappedCode of newCodes) {
          const found = availableOptions.find(opt => {
            if (!opt.code) return false;
            const optCodeNormalized = normalizeCode(opt.code);
            const mappedCodeNormalized = normalizeCode(mappedCode);
            return opt.code.toLowerCase() === mappedCode.toLowerCase() ||
                   optCodeNormalized === mappedCodeNormalized;
          });
          if (found && found.code) {
            console.log(`🔄 Mapped "${oldCode}" -> "${found.code}" (from partial match)`);
            return found.code;
          }
        }
      }
    }
    
    return null;
  };

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
        
        console.log('📋 User profile loaded:', {
          sourceOfFunds: profile.sourceOfFunds,
          businessActivity: profile.businessActivity,
          annualRevenue: profile.annualRevenue,
          accountPurpose: profile.accountPurpose
        });
        
        // Pre-fill source of funds
        if (profile.sourceOfFunds && profile.sourceOfFunds.trim() !== '') {
          const sourceOfFundsValue = profile.sourceOfFunds.trim();
          console.log('🔍 Pre-filling source of funds:', sourceOfFundsValue);
          console.log('📋 Available options:', kybOptions.sourceOfFunds.map(opt => ({ code: opt.code, label: opt.label })));
          
          // Try multiple matching strategies
          let matchingOption = kybOptions.sourceOfFunds.find(
            opt => opt.code === sourceOfFundsValue || 
                   opt.code?.toLowerCase() === sourceOfFundsValue.toLowerCase()
          );
          
          // If no match by code, try matching by label
          if (!matchingOption) {
            matchingOption = kybOptions.sourceOfFunds.find(
              opt => opt.label.toLowerCase() === sourceOfFundsValue.toLowerCase() ||
                     opt.label.toLowerCase().includes(sourceOfFundsValue.toLowerCase()) ||
                     sourceOfFundsValue.toLowerCase().includes(opt.label.toLowerCase())
            );
          }
          
          if (matchingOption) {
            const optionValue = matchingOption.code || matchingOption.label.toLowerCase().replace(/\s+/g, '-');
            console.log('✅ Matched source of funds:', optionValue, 'from option:', matchingOption.label);
            setSourceOfFunds(optionValue);
          } else {
            // Check if it's already an "other" value by checking if it doesn't match any option
            const isOtherValue = !kybOptions.sourceOfFunds.some(opt => 
              opt.code === sourceOfFundsValue || 
              opt.label.toLowerCase() === sourceOfFundsValue.toLowerCase()
            );
            
            if (isOtherValue) {
              console.log('📝 Setting as "other" with value:', sourceOfFundsValue);
              setSourceOfFunds('other');
              setSourceOfFundsOther(sourceOfFundsValue);
            } else {
              // Try to find a close match or use the first option as fallback
              console.warn('⚠️ Could not match source of funds:', sourceOfFundsValue);
              // Don't set anything - let user select manually
            }
          }
        }
        
        // Pre-fill business activity (expected transaction type)
        if (profile.businessActivity) {
          const businessActivityValue = profile.businessActivity.trim();
          console.log('🔍 Pre-filling business activity:', businessActivityValue);
          
          let matchingOption = kybOptions.businessActivity.find(
            opt => opt.code === businessActivityValue ||
                   opt.code?.toLowerCase() === businessActivityValue.toLowerCase()
          );
          
          // If no match by code, try matching by label
          if (!matchingOption) {
            matchingOption = kybOptions.businessActivity.find(
              opt => opt.label.toLowerCase() === businessActivityValue.toLowerCase() ||
                     opt.label.toLowerCase().includes(businessActivityValue.toLowerCase()) ||
                     businessActivityValue.toLowerCase().includes(opt.label.toLowerCase())
            );
          }
          
          if (matchingOption) {
            const optionValue = matchingOption.code || matchingOption.label.toLowerCase().replace(/\s+/g, '-');
            console.log('✅ Matched business activity:', optionValue);
            setExpectedTransactionType(optionValue);
          } else {
            console.warn('⚠️ Could not match business activity:', businessActivityValue);
            // Try to set the value directly in case it's a valid code
            setExpectedTransactionType(businessActivityValue);
          }
        }
        
        // Pre-fill annual revenue (expected monthly volume)
        if (profile.annualRevenue) {
          const annualRevenueValue = profile.annualRevenue.trim();
          console.log('🔍 Pre-filling annual revenue:', annualRevenueValue);
          
          let matchingOption = kybOptions.annualRevenue.find(
            opt => opt.code === annualRevenueValue ||
                   opt.code?.toLowerCase() === annualRevenueValue.toLowerCase()
          );
          
          // If no match by code, try matching by label
          if (!matchingOption) {
            matchingOption = kybOptions.annualRevenue.find(
              opt => opt.label.toLowerCase() === annualRevenueValue.toLowerCase() ||
                     opt.label.toLowerCase().includes(annualRevenueValue.toLowerCase()) ||
                     annualRevenueValue.toLowerCase().includes(opt.label.toLowerCase())
            );
          }
          
          if (matchingOption) {
            const optionValue = matchingOption.code || matchingOption.label.toLowerCase().replace(/\s+/g, '-');
            console.log('✅ Matched annual revenue:', optionValue);
            setExpectedMonthlyVolume(optionValue);
          } else {
            console.warn('⚠️ Could not match annual revenue:', annualRevenueValue);
            // Try to set the value directly in case it's a valid code
            setExpectedMonthlyVolume(annualRevenueValue);
          }
        }
        
        // Pre-fill purpose of account (comma-separated, can be multiple checkboxes)
        if (profile.accountPurpose) {
          console.log('🔍 Pre-filling account purpose:', profile.accountPurpose);
          const purposes = profile.accountPurpose.split(',').map(p => p.trim()).filter(p => p);
          console.log('📋 Parsed purposes:', purposes);
          const selectedPurposes: string[] = [];
          let otherPurpose = '';
          
          purposes.forEach(purpose => {
            // First try to map old code to new code
            const mappedCode = mapOldPurposeCode(purpose, kybOptions.purposeOfAccount);
            const codeToMatch = mappedCode || purpose;
            
            // First try exact code match (handle both underscore and hyphen formats)
            let matchingOption = kybOptions.purposeOfAccount.find(
              opt => {
                const optCode = opt.code?.toLowerCase().replace(/_/g, '-') || '';
                const matchCode = codeToMatch.toLowerCase().replace(/_/g, '-');
                return opt.code?.toLowerCase() === codeToMatch.toLowerCase() || 
                       optCode === matchCode ||
                       opt.code?.toLowerCase() === matchCode ||
                       matchCode === optCode;
              }
            );
            
            // If no match by code, try matching by label
            if (!matchingOption) {
              matchingOption = kybOptions.purposeOfAccount.find(
                opt => {
                  const optLabel = opt.label.toLowerCase();
                  const matchLabel = codeToMatch.toLowerCase();
                  return optLabel === matchLabel ||
                         optLabel.includes(matchLabel) ||
                         matchLabel.includes(optLabel) ||
                         // Try matching words
                         optLabel.split(/\s+/).some(word => matchLabel.includes(word)) ||
                         matchLabel.split(/\s+/).some(word => optLabel.includes(word));
                }
              );
            }
            
            if (matchingOption) {
              const optionValue = matchingOption.code || matchingOption.label.toLowerCase().replace(/\s+/g, '-');
              console.log('✅ Matched purpose:', purpose, '->', optionValue, '(label:', matchingOption.label + ')');
              if (!selectedPurposes.includes(optionValue)) {
                selectedPurposes.push(optionValue);
              }
              // Don't add matched purposes to "other" - they're already handled above
            } else {
              console.warn('⚠️ Could not match purpose:', purpose, 'Available options:', kybOptions.purposeOfAccount.map(o => ({ code: o.code, label: o.label })));
              
              // Only treat unmatched purposes as "other" if they contain "other" or are clearly custom text
              if (purpose.toLowerCase().includes('other')) {
                // Extract the "other" text
                const otherMatch = purpose.match(/other[:\s,]+(.+)/i);
                if (otherMatch && otherMatch[1]) {
                  otherPurpose = otherMatch[1].trim();
                } else if (purpose.toLowerCase().trim() !== 'other') {
                  // If it's not just "other", treat the whole thing as other text
                  otherPurpose = purpose;
                }
                if (!selectedPurposes.includes('other')) {
                  selectedPurposes.push('other');
                }
                console.log('📝 Found "other" purpose:', otherPurpose);
              } else {
                // Only add unmatched purposes to "other" if they're clearly custom text (not standard codes)
                // Check if it looks like a code vs custom text
                const looksLikeCode = /^[a-z_]+$/i.test(purpose.trim());
                const isShortCode = purpose.trim().length <= 30;
                
                // If it looks like a code (underscores, short, alphanumeric) but didn't match, skip it
                // Only add to "other" if it's clearly custom text (longer text, spaces, etc.)
                if (looksLikeCode && isShortCode) {
                  // It looks like a code but didn't match - don't add to "other", just log a warning
                  console.warn('⚠️ Purpose code not found in options, skipping (not adding to "other"):', purpose);
                } else {
                  // It's custom text, add to "other"
                  console.log('⚠️ Purpose not matched and appears to be custom text, treating as "other":', purpose);
                  if (!selectedPurposes.includes('other')) {
                    selectedPurposes.push('other');
                  }
                  if (!otherPurpose) {
                    otherPurpose = purpose;
                  } else {
                    otherPurpose += ', ' + purpose;
                  }
                }
              }
            }
          });
          
          console.log('✅ Final selected purposes:', selectedPurposes);
          console.log('✅ Final other purpose text:', otherPurpose);
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
      
      // Initiate KYB update (this will send OTP and create pending update)
      console.log('🏢 Initiating KYB update...');
      const kybResponse = await UserManagementService.initiateKybUpdate(kybRequest);
      
      // Navigate to OTP screen with KYB data and session ID
      navigate('/app/account-settings/kyb/otp', {
        state: { 
          kybData: kybRequest,
          sessionId: kybResponse.sessionId,
          otpCode: kybResponse.otpCode
        }
      });
    } catch (error: any) {
      console.error('❌ Failed to request KYB OTP:', error);
      setErrors({ general: error.message || 'Failed to request OTP. Please try again.' });
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
            <div className="update-mobile-modal kyb-modal" style={{ maxWidth: '1000px' }}>
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
                    <img src={KYBIcon} alt="KYB" style={{ width: '52px', height: '58.75324630737305px' }} />
                  </div>
                  
                  <h3 className="email-add-title">Business Verification <span style={{ color: '#00BDFF' }}>(KYB)</span></h3>
                  <p className="email-add-description">To meet regulations, please provide your business details for verification.</p>
                </div>

                {/* Form Fields */}
                <div className="kyb-form-grid" style={{ marginTop: '10px' }}>
                  {/* Left Column - KYB Details */}
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
                            placeholder="Please describe your source of funds....."
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
                      <label className="form-label" style={{ marginLeft: '8px' }}>Expected monthly volume and value</label>
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
                  </div>

                  {/* Right Column - Purpose of Account */}
                  <div className="kyb-form-column">
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
                            placeholder="Please Enter Other Purpose....."
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
                </div>

                {/* General Error Message */}
                {errors.general && (
                  <div className="error-message" style={{ marginLeft: '8px', marginTop: '8px', marginBottom: '16px', textAlign: 'center' }}>
                    {errors.general}
                  </div>
                )}

                {/* Buttons - Centered under purpose container (right column) */}
                <div style={{ marginTop: '32px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div></div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <button 
                      className="btn-secondary"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      style={{ minWidth: '200px' }}
                    >
                      Back
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={handleNext}
                      disabled={isLoadingOptions || isLoadingProfile || isSubmitting}
                      style={{ minWidth: '200px' }}
                    >
                      {isSubmitting ? 'Processing...' : 'Next'}
                    </button>
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