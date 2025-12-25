import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { Button } from '../../../components/ui/Button';
import { AlertModal } from '../../../components/ui/Modal';
import { LimitsService, CurrentLimits, OverallLimits, LimitsOTPRequest, LimitsResponse, LimitItem, UpdateOverallLimitsRequest, UpdateTransactionLimitsRequest } from '../../../services/limitsService';
import { API } from '../../../lib/api';
import { fetchTransactionFilters, type TransactionFilter } from '../../../services/transactionFiltersService';
import limitsIcon from '../../../assets/limits.svg';
import limitsIcon2 from '../../../assets/wallet-managment/limits.svg';
import currentIcon from '../../../assets/current.svg';
import checkCircle from '../../../assets/check_circle.svg';

const LimitsConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { subWalletName?: string; subWalletId?: string; isSubWallet?: boolean } | null;
  const subWalletId = state?.subWalletId;
  const isSubWallet = state?.isSubWallet;
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
  const [transactionSearchQuery, setTransactionSearchQuery] = useState(''); // Search query for transaction types

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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showMaxAttemptsModal, setShowMaxAttemptsModal] = useState(false);
  const hasRequestedOTP = useRef(false);
  const isRequestingRef = useRef(false); // Track request state with ref to prevent race conditions
  const emailUpdateSessionId = useRef<string | null>(null); // Track email update session for OTP verification

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

  const getCurrentTransactionLimit = (transactionLabel: string, limitType: 'DAILY' | 'MONTHLY' = 'DAILY'): number => {
    if (!limitsData || !transactionLabel || !transactionLabel.trim()) return 0;
    
    const transactionCode = getTransactionCode(transactionLabel);
    if (!transactionCode) {
      // If we couldn't find the transaction code, return 0
      return 0;
    }
    
    const backendTransactionType = getBackendTransactionType(transactionCode);
    if (!backendTransactionType) return 0;
    
    // Find the limit matching the limit type and transaction type
    const transactionLimit = limitsData.limits.find(limit => {
      const matchesLimitType = limit.limitType === limitType;
      const matchesTransactionSpecific = limit.transactionSpecificLimit === true;
      const matchesTransactionType = limit.transactionType === backendTransactionType;
      
      return matchesLimitType && matchesTransactionSpecific && matchesTransactionType;
    });
    
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
    // Prevent multiple simultaneous requests using ref (more reliable than state)
    if (isRequestingRef.current) {
      console.log('⏸️ OTP request already in progress, skipping...');
      return;
    }

    try {
      isRequestingRef.current = true;
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
      
      // Store session ID for OTP verification
      if (response.sessionId) {
        emailUpdateSessionId.current = response.sessionId;
        console.log('✅ Email update session ID stored:', response.sessionId);
      }
      
      // Reset timer
      setTimeLeft(30);
      setIsResendDisabled(true);
      setOtp(['', '', '', '', '', '']);
      hasRequestedOTP.current = true;
      
    } catch (error: any) {
      console.error('❌ Error requesting limits OTP:', error);
      setOtpError(error.message || 'Failed to request OTP. Please try again.');
    } finally {
      isRequestingRef.current = false;
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
        
        // Reset form fields when switching wallets to prevent showing stale data
        setDailyLimit('');
        setMonthlyLimit('');
        setTransactionLimit('');
        setDailyLimitError('');
        setMonthlyLimitError('');
        setTransactionLimitError('');
        setCurrentLimits(null);
        setOverallLimits(null);
        setLimitsData(null);
        
        console.log('🔄 Loading limits for wallet:', isSubWallet ? `sub-wallet ${subWalletId}` : 'main wallet');
        
        // Load limits data and transaction filters in parallel
        const walletContext = isSubWallet ? subWalletId : 'main';
        console.log('🔄 Loading limits for wallet context:', walletContext, { isSubWallet, subWalletId });
        
        const [limitsData, filters] = await Promise.allSettled([
          LimitsService.getLimitsData(isSubWallet ? subWalletId : undefined),
          fetchTransactionFilters()
        ]);
        
        console.log('🔍 API results for wallet context:', walletContext, { limitsData, filters });
        
        // Handle limits data
        if (limitsData.status === 'fulfilled') {
          const data = limitsData.value;
          console.log('📊 Raw limits data received:', {
            walletId: data.walletId,
            limitsCount: data.limits?.length || 0,
            limits: data.limits,
            expectedWalletContext: walletContext,
            isSubWallet,
            subWalletId
          });
          
          setLimitsData(data);
          
          // Extract overall limits from the data
          const dailyLimit = data.limits.find(limit => 
            limit.limitType === 'DAILY' && limit.overallLimit === true
          );
          const monthlyLimit = data.limits.find(limit => 
            limit.limitType === 'MONTHLY' && limit.overallLimit === true
          );
          
          console.log('📊 Extracted limits for wallet context:', walletContext, { 
            dailyLimit: dailyLimit?.limitAmount, 
            monthlyLimit: monthlyLimit?.limitAmount,
            walletId: data.walletId,
            isSubWallet,
            subWalletId,
            dailyLimitId: dailyLimit?.id,
            monthlyLimitId: monthlyLimit?.id
          });
          
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
          // Only initialize overall limits - specific transaction limits start empty
          setDailyLimit((dailyLimit?.limitAmount || 0).toString());
          // Only set monthlyLimit for overall mode - keep empty for specific transactions
          if (selectedLimitType === 'overall') {
            setMonthlyLimit((monthlyLimit?.limitAmount || 0).toString());
          } else {
            setMonthlyLimit(''); // Keep empty for specific transactions
          }
          
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
  }, [isSubWallet, subWalletId]);

  // Clear monthly limit when switching to specific transaction mode or when selecting a transaction
  useEffect(() => {
    if (selectedLimitType === 'specific') {
      setMonthlyLimit('');
      setMonthlyLimitError('');
    }
  }, [selectedLimitType, selectedTransaction]);

  // Load current transaction limit when transaction is selected
  useEffect(() => {
    if (selectedLimitType === 'specific' && selectedTransaction && limitsData) {
      const currentDailyLimit = getCurrentTransactionLimit(selectedTransaction, 'DAILY');
      const currentMonthlyLimit = getCurrentTransactionLimit(selectedTransaction, 'MONTHLY');
      
      // Set the current limit based on active tab
      if (activeTab === 'daily') {
        setTransactionLimit(currentDailyLimit > 0 ? currentDailyLimit.toString() : '');
      } else {
        setMonthlyLimit(currentMonthlyLimit > 0 ? currentMonthlyLimit.toString() : '');
      }
      
      console.log('🔍 Loaded current limits for transaction:', {
        transaction: selectedTransaction,
        daily: currentDailyLimit,
        monthly: currentMonthlyLimit,
        activeTab
      });
    } else if (selectedLimitType === 'specific' && !selectedTransaction) {
      // Clear limits when no transaction is selected
      setTransactionLimit('');
      setMonthlyLimit('');
    }
  }, [selectedTransaction, selectedLimitType, activeTab, limitsData]);

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
        setTransactionSearchQuery(''); // Clear search when closing dropdown
      }
    };

    if (showTransactionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTransactionDropdown]);

  // Close modals/forms when navigating back or away
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Close any open modals/forms when navigating back
      setShowLimitForm(false);
      setShowConfirmation(false);
      setShowOTP(false);
      setShowSuccess(false);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Also close modals when component unmounts (navigating away)
    return () => {
      window.removeEventListener('popstate', handlePopState);
      setShowLimitForm(false);
      setShowConfirmation(false);
      setShowOTP(false);
      setShowSuccess(false);
    };
  }, []);

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
    // Only allow numbers, decimal point, and comma (for formatting)
    const numericValue = value.replace(/[^0-9.,]/g, '');
    setDailyLimit(numericValue);
    // Clear error when user starts typing
    if (dailyLimitError) setDailyLimitError('');
  };

  const handleMonthlyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, decimal point, and comma (for formatting)
    const numericValue = value.replace(/[^0-9.,]/g, '');
    setMonthlyLimit(numericValue);
    // Clear error when user starts typing
    if (monthlyLimitError) setMonthlyLimitError('');
  };

  const handleTransactionLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, decimal point, and comma (for formatting)
    const numericValue = value.replace(/[^0-9.,]/g, '');
    setTransactionLimit(numericValue);
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
      // For specific transactions, validate based on active tab
      // First check if transaction is selected
      if (!selectedTransaction.trim()) {
        // Show error in the appropriate field based on active tab
        if (activeTab === 'monthly') {
          setMonthlyLimitError('Please select a transaction type first');
        } else {
          setTransactionLimitError('Please select a transaction type first');
        }
        isValid = false;
      } else if (activeTab === 'daily') {
        // Daily tab: validate transactionLimit
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
            setMonthlyLimitError(''); // Clear monthly error
          isValid = true;
          }
        }
      } else {
        // Monthly tab: validate monthlyLimit
        isValid = validateMonthlyLimit(monthlyLimit);
        // Clear transaction limit error if monthly validation passes
        if (isValid) {
          setTransactionLimitError('');
        }
      }
    }
    
    if (isValid) {
      console.log('Daily Limit:', dailyLimit);
      console.log('Monthly Limit:', monthlyLimit);
      console.log('Transaction Limit:', transactionLimit);
      console.log('Selected Transaction:', selectedTransaction);
      console.log('Active Tab:', activeTab);
      setShowConfirmation(true);
    }
  };

  const handleFinalConfirm = async () => {
    setShowConfirmation(false);
    setShowOTP(true);
    // Reset the flag to allow requesting OTP
    hasRequestedOTP.current = false;
    await requestOTP();
  };

  const handleOTPVerify = async (otpCode: string) => {
    try {
      setIsLoading(true);
      setOtpError('');
      
      // Update limits with OTP - backend will verify OTP internally
      if (selectedLimitType === 'overall') {
        // Update overall limits - only include non-empty values
        const updateRequest: UpdateOverallLimitsRequest = {
          dailyLimit: dailyLimit && dailyLimit.trim() ? parseFloat(dailyLimit) : undefined,
          monthlyLimit: monthlyLimit && monthlyLimit.trim() ? parseFloat(monthlyLimit) : undefined,
          otp: otpCode
        };
        
        // Validate that at least one limit is provided
        if (!updateRequest.dailyLimit && !updateRequest.monthlyLimit) {
          throw new Error('At least one of daily or monthly limit must be provided');
        }
        
        console.log('🔍 Updating overall limits:', updateRequest, isSubWallet ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
        const updateResult = await LimitsService.updateOverallLimits(updateRequest, isSubWallet ? subWalletId : undefined);
        console.log('✅ Overall limits updated:', updateResult);
      } else {
        // Update transaction-specific limits based on active tab
        const limitType = activeTab === 'daily' ? 'DAILY' : 'MONTHLY';
        const limitAmount = activeTab === 'daily' 
          ? parseFloat(transactionLimit) 
          : parseFloat(monthlyLimit);
        
        if (!selectedTransaction) {
          throw new Error('Transaction type not selected');
        }
        
        const updateRequest: UpdateTransactionLimitsRequest = {
          limitType: limitType,
          transactionType: getBackendTransactionType(getTransactionCode(selectedTransaction)),
          limitAmount: limitAmount,
          otp: otpCode
        };
        
        console.log('🔍 Updating transaction limits:', {
          limitType,
          transactionType: updateRequest.transactionType,
          limitAmount,
          activeTab
        });
          
        const updateResult = await LimitsService.updateTransactionLimits(updateRequest, isSubWallet ? subWalletId : undefined);
        console.log('✅ Transaction limits updated:', updateResult);
      }
      
      // Clear session ID (no longer needed)
      emailUpdateSessionId.current = null;
      
      // Reset failed attempts on successful verification
      setFailedAttempts(0);
      
      // Reload limits data to reflect the changes
      console.log('🔄 Reloading limits data after successful update...');
      try {
        const [limitsData] = await Promise.allSettled([
          LimitsService.getLimitsData(isSubWallet ? subWalletId : undefined)
        ]);
        
        if (limitsData.status === 'fulfilled') {
          const data = limitsData.value;
          setLimitsData(data); // Update limitsData state - this will trigger useEffect to update current limits
          
          // Extract overall limits
          const dailyLimitItem = data.limits.find(limit => 
            limit.limitType === 'DAILY' && limit.overallLimit === true
          );
          const monthlyLimitItem = data.limits.find(limit => 
            limit.limitType === 'MONTHLY' && limit.overallLimit === true
          );
          
          setCurrentLimits({
            dailyLimit: dailyLimitItem?.limitAmount || 0,
            monthlyLimit: monthlyLimitItem?.limitAmount || 0,
            transactionLimit: 0,
            currency: 'SAR',
            remainingDaily: dailyLimitItem?.remainingLimit || 0,
            remainingMonthly: monthlyLimitItem?.remainingLimit || 0
          });
          
          // Update form values with new limits
          setDailyLimit((dailyLimitItem?.limitAmount || 0).toString());
          if (selectedLimitType === 'overall') {
            setMonthlyLimit((monthlyLimitItem?.limitAmount || 0).toString());
          }
          
          // If transaction-specific limit was updated, reload the current transaction limit
          if (selectedLimitType === 'specific' && selectedTransaction) {
            const currentDailyLimit = getCurrentTransactionLimit(selectedTransaction, 'DAILY');
            const currentMonthlyLimit = getCurrentTransactionLimit(selectedTransaction, 'MONTHLY');
            
            // Update form values based on active tab
            if (activeTab === 'daily') {
              setTransactionLimit(currentDailyLimit > 0 ? currentDailyLimit.toString() : '');
            } else {
              setMonthlyLimit(currentMonthlyLimit > 0 ? currentMonthlyLimit.toString() : '');
            }
            
            console.log('✅ Transaction limits reloaded:', {
              transaction: selectedTransaction,
              daily: currentDailyLimit,
              monthly: currentMonthlyLimit
            });
          }
          
          console.log('✅ Limits data reloaded:', data);
        }
      } catch (reloadError) {
        console.error('⚠️ Failed to reload limits data:', reloadError);
        // Continue to show success even if reload fails
      }
        
        // Show success screen
        setShowOTP(false);
        setShowSuccess(true);
      
    } catch (error: any) {
      console.error('❌ Limits update failed:', error);
      
      // Increment failed attempts for OTP-related errors
      const isOTPError = error.message?.includes('Invalid') || 
                        error.message?.includes('incorrect') || 
                        error.message?.includes('expired') || 
                        error.message?.includes('Session') ||
                        error.message?.includes('OTP');
      
      if (isOTPError) {
        const newFailedAttempts = failedAttempts + 1;
        console.log(`⚠️ Failed attempt ${newFailedAttempts} of 3`);
        setFailedAttempts(newFailedAttempts);
        
        // Show "Try Again Later" modal after 3 failed attempts
        if (newFailedAttempts >= 3) {
          console.log('🚫 Maximum attempts reached, showing modal');
          setShowMaxAttemptsModal(true);
          return; // Exit early, don't show error message
        }
      }
      
      // Check for specific error messages
      if (error.message?.includes('phone number') || error.message?.includes('already exists')) {
        setOtpError('The code you entered is incorrect. Please try again.');
      } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        setOtpError('Unable to connect to server. Please check your connection.');
      } else if (isOTPError) {
        setOtpError('The code you entered is incorrect. Please try again.');
      } else {
        setOtpError(error.message || 'Failed to update limits. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
    
    // Reset the flag to allow resending
    hasRequestedOTP.current = false;
    // Reset failed attempts when resending OTP
    setFailedAttempts(0);
    await requestOTP();
  };

  const handleSuccessDone = async () => {
    // Reload limits data before navigating back to ensure changes are reflected
    try {
      console.log('🔄 Reloading limits data after success...');
      setIsLoadingLimits(true);
      const [limitsData, filters] = await Promise.allSettled([
        LimitsService.getLimitsData(isSubWallet ? subWalletId : undefined),
        fetchTransactionFilters()
      ]);
      
      if (limitsData.status === 'fulfilled') {
        const data = limitsData.value;
        setLimitsData(data);
        
        // Extract overall limits
          const dailyLimit = data.limits.find(limit => 
            limit.limitType === 'DAILY' && limit.overallLimit === true
          );
          const monthlyLimit = data.limits.find(limit => 
            limit.limitType === 'MONTHLY' && limit.overallLimit === true
          );
          
          setCurrentLimits({
            dailyLimit: dailyLimit?.limitAmount || 0,
            monthlyLimit: monthlyLimit?.limitAmount || 0,
            transactionLimit: 0,
            currency: 'SAR',
            remainingDaily: dailyLimit?.remainingLimit || 0,
            remainingMonthly: monthlyLimit?.remainingLimit || 0
          });
          
          // Update form values
          setDailyLimit((dailyLimit?.limitAmount || 0).toString());
          if (selectedLimitType === 'overall') {
            setMonthlyLimit((monthlyLimit?.limitAmount || 0).toString());
          }
          
          // If transaction-specific limit was updated, reload the current transaction limit
          if (selectedLimitType === 'specific' && selectedTransaction) {
            const currentDailyLimit = getCurrentTransactionLimit(selectedTransaction, 'DAILY');
            const currentMonthlyLimit = getCurrentTransactionLimit(selectedTransaction, 'MONTHLY');
            
            // Update form values based on active tab
            if (activeTab === 'daily') {
              setTransactionLimit(currentDailyLimit > 0 ? currentDailyLimit.toString() : '');
            } else {
              setMonthlyLimit(currentMonthlyLimit > 0 ? currentMonthlyLimit.toString() : '');
            }
            
            console.log('✅ Transaction limits reloaded:', {
              transaction: selectedTransaction,
              daily: currentDailyLimit,
              monthly: currentMonthlyLimit
            });
          }
          
          console.log('✅ Limits data reloaded after success');
        }
      } catch (error) {
        console.error('⚠️ Error reloading limits:', error);
      } finally {
        setIsLoadingLimits(false);
      }
    
    // Navigate back after data is reloaded
    navigate('/app/services/wallet', {
      state: {
        subWalletId: isSubWallet ? subWalletId : undefined,
        isSubWallet: isSubWallet,
        subWalletName: state?.subWalletName
      }
    });
  };

  // Filter transaction types based on search query
  const filteredTransactionTypes = transactionTypes.filter(filter => 
    filter.label.toLowerCase().includes(transactionSearchQuery.toLowerCase())
  );

  const handleTransactionSelect = (transaction: string) => {
    setTransactionSearchQuery(''); // Clear search when selecting
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
    navigate('/app/services/wallet', {
      state: {
        subWalletId: isSubWallet ? subWalletId : undefined,
        isSubWallet: isSubWallet,
        subWalletName: state?.subWalletName
      }
    });
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
                      disabled={isLoading || isRequestingOTP || showMaxAttemptsModal}
                      className="w-14 h-14 text-4xl text-[#00BDFF] font-bold text-center rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        border: '1px solid #2C2C2CB2',
                      }}
                      required
                    />
                  ))}
                </div>
                {otpError && !showMaxAttemptsModal && (
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
                      disabled={otp.some(digit => !digit) || isRequestingOTP || showMaxAttemptsModal}
                    >
                      {isRequestingOTP ? 'Requesting...' : 'Verify'}
                    </Button>
                  </div>
                  <div className="flex justify-center">
                   
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Max Attempts Error Modal */}
        <AlertModal
          isOpen={showMaxAttemptsModal}
          onClose={() => {
            setShowMaxAttemptsModal(false);
            setShowOTP(false);
            setFailedAttempts(0);
          }}
          onConfirm={() => {
            setShowMaxAttemptsModal(false);
            setShowOTP(false);
            setFailedAttempts(0);
          }}
          title="Maximum Attempts Exceeded"
          message="You have exceeded the maximum number of attempts. Please try again later."
          buttonLabel="Back to Limits Configuration"
          variant="danger"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header subWalletId={subWalletId} isSubWallet={isSubWallet} />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Wallet</h1>

          <div className="wallet-management-card">
            <div className="wallet-header">
              <div className="wallet-header-icon">
                <img src={limitsIcon2} alt="Limits Configuration" className="wallet-header-icon-img" />
              </div>
              <h2 className="limits-header-title">
                {isSubWallet && state?.subWalletName 
                  ? `${state.subWalletName} - Limits Configuration`
                  : 'Limits Configuration'}
              </h2>
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
                      {activeTab === 'daily' ? (
                        <>
                      <div className="confirmation-detail">
                        <span className="confirmation-label">Current Daily Limit:</span>
                            <span className="confirmation-value">{formatCurrency(getCurrentTransactionLimit(selectedTransaction, 'DAILY'))}</span>
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
                      ) : (
                        <>
                          <div className="confirmation-detail">
                            <span className="confirmation-label">Current Monthly Limit:</span>
                            <span className="confirmation-value">{formatCurrency(getCurrentTransactionLimit(selectedTransaction, 'MONTHLY'))}</span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="confirmation-label">New Monthly Limit:</span>
                            <span className="confirmation-value">{formatCurrency(parseFloat(monthlyLimit) || 0)}</span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="confirmation-label">Limit Type:</span>
                            <span className="confirmation-value">Monthly Transaction-Specific Limit</span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  <div className="confirmation-detail">
                    <span className="confirmation-label">Allowed Range:</span>
                    <span className="confirmation-value">
                      {selectedLimitType === 'overall' 
                        ? (activeTab === 'daily' ? '0 - 100,000 SAR' : '0 - 1,000,000 SAR')
                        : (activeTab === 'daily' ? '0 - 100,000 SAR' : '0 - 1,000,000 SAR')
                      }
                    </span>
                  </div>
                </div>

                <div className="confirmation-actions">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="confirmation-button confirmation-button-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinalConfirm}
                    className="confirmation-button confirmation-button-primary"
                  >
                    Confirm
                  </button>
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
                          <h3 className="limit-tab-title">Specific Transaction</h3>
                        </div>
                        <p className="limit-tab-description">
                          Specific Transaction Select the transaction to set a limit for.
                        </p>
                        
                        <div className="current-limit">
                          <div className="current-limit-label">
                            <img src={currentIcon} alt="Current Limit" className="current-limit-icon" />
                            <span>Current Limit</span>
                          </div>
                          <span className="current-limit-value">
                            {isLoadingLimits ? 'Loading...' : formatCurrency(getCurrentTransactionLimit(selectedTransaction || '', activeTab === 'daily' ? 'DAILY' : 'MONTHLY'))}
                          </span>
                        </div>

                        <div className="limit-inputs-row">
                          <div className="limit-input-group">
                            <label className="limit-input-label">Daily Limit</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="Enter daily limit.."
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

                          <div className="limit-input-group">
                            <label className="limit-input-label">Select the transaction</label>
                            <div className="transaction-dropdown-container">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowTransactionDropdown(!showTransactionDropdown);
                                  if (showTransactionDropdown) {
                                    setTransactionSearchQuery(''); // Clear search when closing dropdown
                                  }
                                }}
                                className="transaction-dropdown-button"
                                disabled={isLoadingFilters}
                              >
                                <span>{selectedTransaction || 'Loading...'}</span>
                                <svg className="transaction-dropdown-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                                      value={transactionSearchQuery}
                                      onChange={(e) => setTransactionSearchQuery(e.target.value)}
                                    />
                                    <svg className="transaction-search-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                  <div className="transaction-dropdown-list">
                                    {isLoadingFilters ? (
                                      <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                                    ) : filteredTransactionTypes.length === 0 ? (
                                      <div className="px-4 py-3 text-sm text-gray-500">
                                        {transactionSearchQuery ? 'No matching transaction types found' : 'No transaction types available'}
                                      </div>
                                    ) : (
                                      filteredTransactionTypes.map((filter) => (
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
                            inputMode="numeric"
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
                          <h3 className="limit-tab-title">Specific Transaction</h3>
                        </div>
                        <p className="limit-tab-description">
                          Specific Transaction Select the transaction to set a limit for.
                        </p>
                        
                        <div className="current-limit">
                          <div className="current-limit-label">
                            <img src={currentIcon} alt="Current Limit" className="current-limit-icon" />
                            <span>Current Limit</span>
                          </div>
                          <span className="current-limit-value">
                            {isLoadingLimits ? 'Loading...' : formatCurrency(getCurrentTransactionLimit(selectedTransaction || '', 'MONTHLY'))}
                          </span>
                        </div>

                        <div className="limit-inputs-row">
                          <div className="limit-input-group">
                            <label className="limit-input-label">Monthly Limit</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="Enter monthly limit.."
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

                          <div className="limit-input-group">
                            <label className="limit-input-label">Select the transaction</label>
                            <div className="transaction-dropdown-container">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowTransactionDropdown(!showTransactionDropdown);
                                  if (showTransactionDropdown) {
                                    setTransactionSearchQuery(''); // Clear search when closing dropdown
                                  }
                                }}
                                className="transaction-dropdown-button"
                                disabled={isLoadingFilters}
                              >
                                <span>{selectedTransaction || 'Loading...'}</span>
                                <svg className="transaction-dropdown-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                                      value={transactionSearchQuery}
                                      onChange={(e) => setTransactionSearchQuery(e.target.value)}
                                    />
                                    <svg className="transaction-search-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                  <div className="transaction-dropdown-list">
                                    {isLoadingFilters ? (
                                      <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                                    ) : filteredTransactionTypes.length === 0 ? (
                                      <div className="px-4 py-3 text-sm text-gray-500">
                                        {transactionSearchQuery ? 'No matching transaction types found' : 'No transaction types available'}
                                      </div>
                                    ) : (
                                      filteredTransactionTypes.map((filter) => (
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
                            inputMode="numeric"
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
                  <button
                    onClick={handleBack}
                    className="limits-button limits-button-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="limits-button limits-button-primary"
                  >
                    Next
                  </button>
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
