import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { Button } from '../../../components/ui/Button';
import { LimitsService, CurrentLimits, OverallLimits, LimitsOTPRequest, LimitsResponse, LimitItem, UpdateOverallLimitsRequest, UpdateTransactionLimitsRequest } from '../../../services/limitsService';
import { API } from '../../../lib/api';
import { fetchTransactionFilters, type TransactionFilter } from '../../../services/transactionFiltersService';
import limitsIcon from '../../../assets/limits.svg';
import limitsIcon2 from '../../../assets/wallet-managment/limits.svg';
import currentIcon from '../../../assets/current.svg';
import checkCircle from '../../../assets/check_circle.svg';

const LimitsConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLimitType, setSelectedLimitType] = useState<'overall' | 'specific'>('overall');
  const [showLimitForm, setShowLimitForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [dailyLimit, setDailyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [transactionLimit, setTransactionLimit] = useState(''); // New state for transaction-specific limit
  const [dailyLimitError, setDailyLimitError] = useState('');
  const [monthlyLimitError, setMonthlyLimitError] = useState('');
  const [transactionLimitError, setTransactionLimitError] = useState(''); // New state for transaction limit error
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false);

  // Transaction types data from backend
  const [transactionTypes, setTransactionTypes] = useState<TransactionFilter[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  
  // Limits data from backend
  const [currentLimits, setCurrentLimits] = useState<CurrentLimits | null>(null);
  const [overallLimits, setOverallLimits] = useState<OverallLimits | null>(null);
  const [limitsData, setLimitsData] = useState<LimitsResponse | null>(null);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const [limitsError, setLimitsError] = useState<string | null>(null);
  const [realOTP, setRealOTP] = useState('');
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);

  // Helper functions to get current limits from backend data
  const getCurrentDailyLimit = (): number => {
    if (!limitsData) return 0;
    const dailyLimit = limitsData.limits.find(limit => 
      limit.limitType === 'DAILY' && limit.overallLimit === true
    );
    return dailyLimit?.limitAmount || 0;
  };

  const getCurrentMonthlyLimit = (): number => {
    if (!limitsData) return 0;
    const monthlyLimit = limitsData.limits.find(limit => 
      limit.limitType === 'MONTHLY' && limit.overallLimit === true
    );
    return monthlyLimit?.limitAmount || 0;
  };

  const getCurrentTransactionLimit = (transactionLabel: string): number => {
    if (!limitsData) return 0;
    const transactionCode = getTransactionCode(transactionLabel);
    const backendTransactionType = getBackendTransactionType(transactionCode);
    const transactionLimit = limitsData.limits.find(limit => 
      limit.limitType === 'DAILY' && 
      limit.transactionSpecificLimit === true && 
      limit.transactionType === backendTransactionType
    );
    return transactionLimit?.limitAmount || 0;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Request OTP from backend
  const requestOTP = async () => {
    try {
      setIsRequestingOTP(true);
      setOtpError('');
      
      const request: LimitsOTPRequest = { 
        action: 'update_limits',
        dailyLimit: selectedLimitType === 'overall' ? parseFloat(dailyLimit) : undefined,
        monthlyLimit: selectedLimitType === 'overall' ? parseFloat(monthlyLimit) : undefined,
        transactionType: selectedLimitType === 'specific' ? getBackendTransactionType(getTransactionCode(selectedTransaction)) : undefined,
        transactionLimit: selectedLimitType === 'specific' ? parseFloat(transactionLimit) : undefined
      };
      const response = await LimitsService.requestOTP(request);
      
      if (response.otpCode) {
        setRealOTP(response.otpCode);
        console.log('✅ Real OTP received from backend for limits update:', response.otpCode);
      }
      
      // Reset timer
      setTimeLeft(30);
      setIsResendDisabled(true);
      setOtp(['', '', '', '', '', '']);
      
    } catch (error: any) {
      console.error('❌ Error requesting limits OTP:', error);
      setOtpError(error.message || 'Failed to request OTP. Please try again.');
    } finally {
      setIsRequestingOTP(false);
    }
  };

  // Debug transaction types state changes
  useEffect(() => {
    console.log('🔍 Transaction types state changed:', transactionTypes);
    console.log('🔍 Is loading filters:', isLoadingFilters);
  }, [transactionTypes, isLoadingFilters]);

  // Load limits and transaction filters on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingLimits(true);
        setIsLoadingFilters(true);
        setLimitsError(null);
        
        // Load limits data and transaction filters in parallel
        const [limitsData, filters] = await Promise.allSettled([
          LimitsService.getLimitsData(),
          fetchTransactionFilters()
        ]);
        
        console.log('🔍 API results:', { limitsData, filters });
        
        // Handle limits data
        if (limitsData.status === 'fulfilled') {
          const data = limitsData.value;
          setLimitsData(data);
          
          // Extract overall limits from the data
          const dailyLimit = data.limits.find(limit => 
            limit.limitType === 'DAILY' && limit.overallLimit === true
          );
          const monthlyLimit = data.limits.find(limit => 
            limit.limitType === 'MONTHLY' && limit.overallLimit === true
          );
          
          // Set current limits
          setCurrentLimits({
            dailyLimit: dailyLimit?.limitAmount || 0,
            monthlyLimit: monthlyLimit?.limitAmount || 0,
            transactionLimit: 0, // Not used in this context
            currency: 'SAR',
            remainingDaily: dailyLimit?.remainingLimit || 0,
            remainingMonthly: monthlyLimit?.remainingLimit || 0
          });
          
          // Set overall limits (same as current for now)
          setOverallLimits({
            maxDailyLimit: dailyLimit?.limitAmount || 0,
            maxMonthlyLimit: monthlyLimit?.limitAmount || 0,
            maxTransactionLimit: 0, // Not used in this context
            currency: 'SAR'
          });
          
          // Initialize form with current limits
          setDailyLimit((dailyLimit?.limitAmount || 0).toString());
          setMonthlyLimit((monthlyLimit?.limitAmount || 0).toString());
          
          console.log('🔍 Limits data processed:', {
            dailyLimit: dailyLimit?.limitAmount,
            monthlyLimit: monthlyLimit?.limitAmount,
            transactionSpecificLimits: data.limits.filter(l => l.transactionSpecificLimit)
          });
        } else {
          console.error('❌ Failed to load limits data:', limitsData.reason);
        }
        
        // Handle transaction filters
        if (filters.status === 'fulfilled') {
          setTransactionTypes(filters.value);
          console.log('🔍 Transaction types loaded:', filters.value);
          console.log('🔍 Transaction types count:', filters.value.length);
          
          // Set first filter as default if available
          if (filters.value.length > 0 && !selectedTransaction) {
            setSelectedTransaction(filters.value[0].label);
            console.log('🔍 Default transaction selected:', filters.value[0].label);
          }
        } else {
          console.error('❌ Failed to load transaction filters:', filters.reason);
        }
        
      } catch (error) {
        console.error('Error loading limits data:', error);
        setLimitsError(error instanceof Error ? error.message : 'Failed to load limits data');
      } finally {
        setIsLoadingLimits(false);
        setIsLoadingFilters(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('dashboard-root');
    }
    return () => {
      if (root) {
        root.classList.remove('dashboard-root');
      }
    };
  }, []);

  // Timer effect for OTP
  useEffect(() => {
    if (timeLeft > 0 && showOTP) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showOTP) {
      setIsResendDisabled(false);
    }
  }, [timeLeft, showOTP]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTransactionDropdown && !target.closest('.transaction-dropdown-container')) {
        setShowTransactionDropdown(false);
      }
    };

    if (showTransactionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTransactionDropdown]);

  const validateDailyLimit = (value: string) => {
    if (!value.trim()) {
      setDailyLimitError('Daily limit is required');
      return false;
    }
    
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue) || numValue < 0 || numValue > 100000) {
      setDailyLimitError('Daily limit must be between 0 and 100,000 SAR');
      return false;
    }
    
    setDailyLimitError('');
    return true;
  };

  const validateMonthlyLimit = (value: string) => {
    if (!value.trim()) {
      setMonthlyLimitError('Monthly limit is required');
      return false;
    }
    
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue) || numValue < 0 || numValue > 1000000) {
      setMonthlyLimitError('Monthly limit must be between 0 and 1,000,000 SAR');
      return false;
    }
    
    setMonthlyLimitError('');
    return true;
  };

  const handleDailyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDailyLimit(value);
    validateDailyLimit(value);
  };

  const handleMonthlyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMonthlyLimit(value);
    validateMonthlyLimit(value);
  };

  const handleTransactionLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransactionLimit(value);
    // Clear error when user starts typing
    if (transactionLimitError) setTransactionLimitError('');
  };

  const handleNext = () => {
    setShowLimitForm(true);
  };

  const handleConfirm = () => {
    // Validate based on active tab and limit type
    let isValid = false;
    
    if (selectedLimitType === 'overall') {
    if (activeTab === 'daily') {
      isValid = validateDailyLimit(dailyLimit);
    } else {
      isValid = validateMonthlyLimit(monthlyLimit);
      }
    } else {
      // For specific transactions, validate the transaction limit
      if (!transactionLimit.trim()) {
        setTransactionLimitError('Transaction limit is required');
        isValid = false;
      } else {
        const numValue = parseFloat(transactionLimit.replace(/,/g, ''));
        if (isNaN(numValue) || numValue < 0 || numValue > 100000) {
          setTransactionLimitError('Transaction limit must be between 0 and 100,000 SAR');
          isValid = false;
        } else {
          setTransactionLimitError('');
          isValid = true;
        }
      }
    }
    
    if (isValid) {
      console.log('Daily Limit:', dailyLimit);
      console.log('Monthly Limit:', monthlyLimit);
      console.log('Transaction Limit:', transactionLimit);
      setShowConfirmation(true);
    }
  };

  const handleFinalConfirm = async () => {
    setShowConfirmation(false);
    setShowOTP(true);
    await requestOTP();
  };

  const handleOTPVerify = async (otpCode: string) => {
    try {
      // First verify the OTP using the auth API
      const phoneNumber = localStorage.getItem('phoneNumber') || '+966501234567';
      const verifyResponse = await API.post('/api/v1/auth/verify-otp', {
        phoneNumber: phoneNumber,
        otp: otpCode
      });
      
      if (verifyResponse.success) {
        console.log('✅ OTP verified successfully for limits update');
        
        // Call the appropriate limits update API based on limit type
        if (selectedLimitType === 'overall') {
          // Update overall limits
          const updateRequest: UpdateOverallLimitsRequest = {
            dailyLimit: parseFloat(dailyLimit),
            monthlyLimit: parseFloat(monthlyLimit)
          };
          
          const updateResult = await LimitsService.updateOverallLimits(updateRequest);
          console.log('✅ Overall limits updated:', updateResult);
        } else {
          // Update transaction-specific limits
          const updateRequest: UpdateTransactionLimitsRequest = {
            limitType: 'DAILY', // For now, only daily limits for specific transactions
            transactionType: getBackendTransactionType(getTransactionCode(selectedTransaction)),
            limitAmount: parseFloat(transactionLimit)
          };
          
          const updateResult = await LimitsService.updateTransactionLimits(updateRequest);
          console.log('✅ Transaction limits updated:', updateResult);
        }
        
        // Show success screen
        setShowOTP(false);
        setShowSuccess(true);
      } else {
        setOtpError('The code you entered is incorrect.');
      }
    } catch (error: any) {
      console.error('❌ OTP verification or limits update failed:', error);
      setOtpError(error.message || 'Failed to verify OTP or update limits');
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (otpError) setOtpError('');
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      await handleOTPVerify(otpCode);
    } else {
      setOtpError('Please enter all 6 digits.');
    }
  };

  const handleResendOTP = async () => {
    if (isRequestingOTP) return; // Prevent multiple requests
    
    await requestOTP();
  };

  const handleSuccessDone = () => {
    navigate('/app/services/wallet');
  };

  const handleTransactionSelect = (transaction: string) => {
    setSelectedTransaction(transaction);
    setShowTransactionDropdown(false);
  };

  // Helper function to get transaction code from label
  const getTransactionCode = (label: string): string => {
    const transaction = transactionTypes.find(t => t.label === label);
    return transaction?.code || label;
  };

  // Helper function to convert frontend code to backend enum value
  const getBackendTransactionType = (code: string): string => {
    // Convert snake_case to UPPER_CASE for backend enum
    return code.toUpperCase();
  };

  const handleBack = () => {
    navigate('/app/services/wallet');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
          }}
        />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white">
              <div className="flex justify-center mb-6">
                <img src={checkCircle} alt="Success" className="w-20 h-20" />
              </div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">
                  Wallet Limit Updated
                </h2>
                <p className="text-gray-600">
                  Your wallet limit has been updated successfully.
                </p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleSuccessDone}
                  className="w-full max-w-xs py-3 px-6 rounded-full border-2 border-[#022466] text-[#022466] font-medium hover:bg-[#022466] hover:text-white transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show OTP screen
  if (showOTP) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
          }}
        />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white">
              <button
                onClick={() => setShowOTP(false)}
                className="absolute top-6 left-6 text-[#022466] hover:text-[#0475CC] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <form onSubmit={handleOTPSubmit} className="pt-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#022466] mb-2">Mobile Number</h2>
                  <h3 className="text-xl font-bold text-[#022466] mb-2">OTP Verification</h3>
                  <p className="text-gray-600">Enter your OTP code</p>
                  {isRequestingOTP && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-2"></div>
                        <p className="text-sm text-yellow-800">Requesting OTP...</p>
                      </div>
                    </div>
                  )}
                  {realOTP && !isRequestingOTP && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">OTP from backend:</p>
                      <p className="text-lg font-bold text-blue-800">{realOTP}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      disabled={isLoading || isRequestingOTP}
                      className="w-14 h-14 text-3xl text-[#00BDFF] font-bold text-center rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        border: '1px solid #2C2C2CB2',
                        WebkitTextStroke: '1px #2C2C2CB2',
                        textShadow: '1px 1px 0 #2C2C2CB2, -1px -1px 0 #2C2C2CB2, 1px -1px 0 #2C2C2CB2, -1px 1px 0 #2C2C2CB2'
                      }}
                      required
                    />
                  ))}
                </div>
                {otpError && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">{otpError}</span>
                    </div>
                  </div>
                )}
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-2">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResendDisabled || isRequestingOTP}
                      className={`font-medium ${
                        isResendDisabled || isRequestingOTP
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-[#0475CC] hover:text-[#022466]'
                      }`}
                    >
                      Resend in {formatTime(timeLeft)}
                    </button>
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      className="w-full max-w-xs"
                      disabled={otp.some(digit => !digit) || isRequestingOTP}
                    >
                      {isRequestingOTP ? 'Requesting...' : 'Verify'}
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResendDisabled || isRequestingOTP}
                      className={`w-3/4 max-w-xs py-3 px-4 rounded-full border-2 border-[#022466] font-medium transition-all ${
                        isResendDisabled || isRequestingOTP
                          ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                          : 'text-[#022466] hover:bg-[#022466] hover:text-white'
                      }`}
                    >
                      {isRequestingOTP ? 'Requesting...' : 'Resend'}
                    </button>
                  </div>
                </div>
              </form>
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
          <h1 className="dashboard-title">Wallet</h1>

          <div className="wallet-management-card">
            <div className="wallet-header">
              <div className="wallet-header-icon">
                <img src={limitsIcon2} alt="Limits Configuration" className="wallet-header-icon-img" />
              </div>
              <h2 className="limits-header-title">Limits Configuration</h2>
            </div>

            {showConfirmation ? (
              <div className="confirmation-content">
                <div className="confirmation-header">
                  <img src={limitsIcon} alt="Confirm Limit Change" className="confirmation-icon" />
                  <h3 className="confirmation-title">
                    {selectedLimitType === 'overall' 
                      ? `Confirm ${activeTab === 'daily' ? 'Daily' : 'Monthly'} Limit Change`
                      : `Confirm Transaction Limit Change`
                    }
                  </h3>
                </div>
                
                <p className="confirmation-message">
                  {selectedLimitType === 'overall' 
                    ? `Please review your ${activeTab === 'daily' ? 'daily' : 'monthly'} limit changes below before confirming with your OTP.`
                    : `Please review your transaction-specific limit changes for "${selectedTransaction}" below before confirming with your OTP.`
                  }
                </p>

                <div className="confirmation-details">
                  {selectedLimitType === 'overall' ? (
                    <>
                      {/* Overall Limits Confirmation */}
                      {activeTab === 'daily' ? (
                        <>
                          <div className="confirmation-detail">
                            <span className="confirmation-label">Current Daily Limit:</span>
                            <span className="confirmation-value">{formatCurrency(getCurrentDailyLimit())}</span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="confirmation-label">New Daily Limit:</span>
                            <span className="confirmation-value">{formatCurrency(parseFloat(dailyLimit) || 0)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="confirmation-detail">
                            <span className="confirmation-label">Current Monthly Limit:</span>
                            <span className="confirmation-value">{formatCurrency(getCurrentMonthlyLimit())}</span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="confirmation-label">New Monthly Limit:</span>
                            <span className="confirmation-value">{formatCurrency(parseFloat(monthlyLimit) || 0)}</span>
                          </div>
                        </>
                      )}
                      <div className="confirmation-detail">
                        <span className="confirmation-label">Limit Type:</span>
                        <span className="confirmation-value">{activeTab === 'daily' ? 'Daily' : 'Monthly'} Overall Limit</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Specific Transaction Limits Confirmation */}
                      <div className="confirmation-detail">
                        <span className="confirmation-label">Transaction Type:</span>
                        <span className="confirmation-value">{selectedTransaction}</span>
                      </div>
                      <div className="confirmation-detail">
                        <span className="confirmation-label">Current Daily Limit:</span>
                        <span className="confirmation-value">{formatCurrency(getCurrentTransactionLimit(selectedTransaction))}</span>
                      </div>
                      <div className="confirmation-detail">
                        <span className="confirmation-label">New Daily Limit:</span>
                        <span className="confirmation-value">{formatCurrency(parseFloat(transactionLimit) || 0)}</span>
                      </div>
                      <div className="confirmation-detail">
                        <span className="confirmation-label">Limit Type:</span>
                        <span className="confirmation-value">Daily Transaction-Specific Limit</span>
                      </div>
                    </>
                  )}
                  <div className="confirmation-detail">
                    <span className="confirmation-label">Allowed Range:</span>
                    <span className="confirmation-value">0 - 100,000 SAR</span>
                  </div>
                </div>

                <div className="confirmation-actions">
                  <Button
                    onClick={() => setShowConfirmation(false)}
                    className="confirmation-button confirmation-button-secondary"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleFinalConfirm}
                    className="confirmation-button confirmation-button-primary"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            ) : !showLimitForm ? (
              <div className="limits-content">
                <p className="limits-instruction">
                  Choose the type of limit you want to set:
                </p>

                <div className="limits-options">
                  {/* Overall Wallet Option */}
                  <label className="limit-option">
                    <div className="limit-option-input">
                      <input
                        type="radio"
                        name="limitType"
                        value="overall"
                        checked={selectedLimitType === 'overall'}
                        onChange={(e) => setSelectedLimitType(e.target.value as 'overall')}
                        className="limit-radio"
                      />
                    </div>
                    <div className="limit-option-content">
                      <div className="limit-option-title">Overall Wallet</div>
                      <div className="limit-option-description">Set a limit for your entire wallet</div>
                    </div>
                  </label>

                  {/* Specific Transaction Option */}
                  <label className="limit-option">
                    <div className="limit-option-input">
                      <input
                        type="radio"
                        name="limitType"
                        value="specific"
                        checked={selectedLimitType === 'specific'}
                        onChange={(e) => setSelectedLimitType(e.target.value as 'specific')}
                        className="limit-radio"
                      />
                    </div>
                    <div className="limit-option-content">
                      <div className="limit-option-title">Specific Transaction</div>
                      <div className="limit-option-description">Set a limit for a specific transaction</div>
                    </div>
                  </label>
                </div>

                <div className="limits-actions">
                  <Button
                    onClick={handleBack}
                    className="limits-button limits-button-secondary"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="limits-button limits-button-primary"
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : (
              <div className="limits-form-content">
                {/* Tabs */}
                <div className="limits-tabs">
                  <button
                    className={`limits-tab ${activeTab === 'daily' ? 'active' : ''}`}
                    onClick={() => setActiveTab('daily')}
                  >
                    Daily Limit
                  </button>
                  <button
                    className={`limits-tab ${activeTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => setActiveTab('monthly')}
                  >
                    Monthly Limit
                  </button>
                </div>

                {/* Daily Limit Tab */}
                {activeTab === 'daily' && (
                  <div className="limit-tab-content">
                    {selectedLimitType === 'specific' ? (
                      <>
                        <div className="limit-tab-header">
                          <img src={limitsIcon} alt="Specific Transaction" className="limit-tab-icon" />
                          <h3 className="limit-tab-title">Daily Limit</h3>
                        </div>
                        <p className="limit-tab-description">
                          Select the transaction to set a limit for.
                        </p>
                        
                        <div className="current-limit">
                          <div className="current-limit-label">
                            <img src={currentIcon} alt="Current Limit" className="current-limit-icon" />
                            <span>Current Limit</span>
                          </div>
                          <span className="current-limit-value">
                            {isLoadingLimits ? 'Loading...' : formatCurrency(getCurrentTransactionLimit(selectedTransaction))}
                          </span>
                        </div>

                        <div className="limit-input-group">
                          <label className="limit-input-label">Select the transaction</label>
                          <div className="transaction-dropdown-container">
                            <button
                              type="button"
                              onClick={() => setShowTransactionDropdown(!showTransactionDropdown)}
                              className="transaction-dropdown-button"
                              disabled={isLoadingFilters}
                            >
                              <span>{selectedTransaction || 'Loading...'}</span>
                              <svg className="transaction-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {showTransactionDropdown && (
                              <div className="transaction-dropdown-menu">
                                <div className="transaction-dropdown-search">
                                  <input
                                    type="text"
                                    placeholder="Search transaction type"
                                    className="transaction-search-input"
                                  />
                                  <svg className="transaction-search-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <div className="transaction-dropdown-list">
                                  {isLoadingFilters ? (
                                    <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                                  ) : transactionTypes.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500">No transaction types available</div>
                                  ) : (
                                    transactionTypes.map((filter) => (
                                    <button
                                        key={filter.id}
                                      type="button"
                                        onClick={() => handleTransactionSelect(filter.label)}
                                        className={`transaction-dropdown-item ${selectedTransaction === filter.label ? 'selected' : ''}`}
                                    >
                                        {filter.label}
                                    </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="limit-input-group">
                          <label className="limit-input-label">Daily Limit</label>
                          <input
                            type="text"
                            placeholder="Enter Daily Limit"
                            value={transactionLimit}
                            onChange={handleTransactionLimitChange}
                            className={`limit-input ${transactionLimitError ? 'error' : ''}`}
                          />
                          {transactionLimitError ? (
                            <span className="limit-error">{transactionLimitError}</span>
                          ) : (
                            <span className="limit-range">Allowed range: 0 - 100,000 SAR</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="limit-tab-header">
                          <img src={limitsIcon} alt="Daily Limit" className="limit-tab-icon" />
                          <h3 className="limit-tab-title">Daily Limit</h3>
                        </div>
                        <p className="limit-tab-description">
                          Set a maximum amount you can spend in your wallet per day.
                        </p>
                        
                        <div className="current-limit">
                          <div className="current-limit-label">
                            <img src={currentIcon} alt="Current Limit" className="current-limit-icon" />
                            <span>Current Limit</span>
                          </div>
                          <span className="current-limit-value">
                            {isLoadingLimits ? 'Loading...' : formatCurrency(getCurrentDailyLimit())}
                          </span>
                        </div>

                        <div className="limit-input-group">
                          <label className="limit-input-label">Daily Limit</label>
                          <input
                            type="text"
                            placeholder="Enter daily limit..."
                            value={dailyLimit}
                            onChange={handleDailyLimitChange}
                            className={`limit-input ${dailyLimitError ? 'error' : ''}`}
                          />
                          {dailyLimitError ? (
                            <span className="limit-error">{dailyLimitError}</span>
                          ) : (
                            <span className="limit-range">Allowed range: 0 - 100,000 SAR</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Monthly Limit Tab */}
                {activeTab === 'monthly' && (
                  <div className="limit-tab-content">
                    {selectedLimitType === 'specific' ? (
                      <>
                        <div className="limit-tab-header">
                          <img src={limitsIcon} alt="Specific Transaction" className="limit-tab-icon" />
                          <h3 className="limit-tab-title">Monthly Limit</h3>
                        </div>
                        <p className="limit-tab-description">
                          Select the transaction to set a limit for.
                        </p>
                        
                        <div className="current-limit">
                          <div className="current-limit-label">
                            <img src={currentIcon} alt="Current Limit" className="current-limit-icon" />
                            <span>Current Limit</span>
                          </div>
                          <span className="current-limit-value">
                            {isLoadingLimits ? 'Loading...' : formatCurrency(getCurrentTransactionLimit(selectedTransaction))}
                          </span>
                        </div>

                        <div className="limit-input-group">
                          <label className="limit-input-label">Select the transaction</label>
                          <div className="transaction-dropdown-container">
                            <button
                              type="button"
                              onClick={() => setShowTransactionDropdown(!showTransactionDropdown)}
                              className="transaction-dropdown-button"
                              disabled={isLoadingFilters}
                            >
                              <span>{selectedTransaction || 'Loading...'}</span>
                              <svg className="transaction-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {showTransactionDropdown && (
                              <div className="transaction-dropdown-menu">
                                <div className="transaction-dropdown-search">
                                  <input
                                    type="text"
                                    placeholder="Search transaction type"
                                    className="transaction-search-input"
                                  />
                                  <svg className="transaction-search-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <div className="transaction-dropdown-list">
                                  {isLoadingFilters ? (
                                    <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                                  ) : transactionTypes.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500">No transaction types available</div>
                                  ) : (
                                    transactionTypes.map((filter) => (
                                    <button
                                        key={filter.id}
                                      type="button"
                                        onClick={() => handleTransactionSelect(filter.label)}
                                        className={`transaction-dropdown-item ${selectedTransaction === filter.label ? 'selected' : ''}`}
                                    >
                                        {filter.label}
                                    </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="limit-input-group">
                          <label className="limit-input-label">Monthly Limit</label>
                          <input
                            type="text"
                            placeholder="Enter Monthly Limit"
                            value={monthlyLimit}
                            onChange={handleMonthlyLimitChange}
                            className={`limit-input ${monthlyLimitError ? 'error' : ''}`}
                          />
                          {monthlyLimitError ? (
                            <span className="limit-error">{monthlyLimitError}</span>
                          ) : (
                            <span className="limit-range">Allowed range: 0 - 1,000,000 SAR</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="limit-tab-header">
                          <img src={limitsIcon} alt="Monthly Limit" className="limit-tab-icon" />
                          <h3 className="limit-tab-title">Monthly Limit</h3>
                        </div>
                        <p className="limit-tab-description">
                          Set a maximum amount you can spend in your wallet per month.
                        </p>
                        
                        <div className="current-limit">
                          <div className="current-limit-label">
                            <img src={currentIcon} alt="Current Limit" className="current-limit-icon" />
                            <span>Current Limit</span>
                          </div>
                          <span className="current-limit-value">
                            {isLoadingLimits ? 'Loading...' : formatCurrency(getCurrentMonthlyLimit())}
                          </span>
                        </div>

                        <div className="limit-input-group">
                          <label className="limit-input-label">Monthly Limit</label>
                          <input
                            type="text"
                            placeholder="Enter monthly limit..."
                            value={monthlyLimit}
                            onChange={handleMonthlyLimitChange}
                            className={`limit-input ${monthlyLimitError ? 'error' : ''}`}
                          />
                          {monthlyLimitError ? (
                            <span className="limit-error">{monthlyLimitError}</span>
                          ) : (
                            <span className="limit-range">Allowed range: 0 - 1,000,000 SAR</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="limits-actions">
                  <Button
                    onClick={handleBack}
                    className="limits-button limits-button-secondary"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="limits-button limits-button-primary"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitsConfiguration;
