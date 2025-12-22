import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { Button } from '../../../components/ui/Button';
import { WalletService, SubWalletData, SubWalletOTPRequest } from '../../../services/walletService';
import { API } from '../../../lib/api';
import subWalletIcon from '../../../assets/wallet-managment/sub-wallet.svg';
import subWalletListIcon from '../../../assets/wallet-managment/subwalletlist.svg';
import checkCircle from '../../../assets/check_circle.svg';
import rejectIcon from '../../../assets/reject.svg';

interface MainWalletData {
  subWalletId?: string; // undefined for main wallet
  subWalletName: string;
  balance: number;
  onHoldBalance: number;
  availableBalance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
  isMainWallet: boolean;
}

const SubWallet: React.FC = () => {
  const navigate = useNavigate();
  const [subWallets, setSubWallets] = useState<SubWalletData[]>([]);
  const [mainWallet, setMainWallet] = useState<MainWalletData | null>(null);
  const [isLoadingMainWallet, setIsLoadingMainWallet] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [walletsError, setWalletsError] = useState<string | null>(null);
  const [realOTP, setRealOTP] = useState('');
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const hasRequestedOTP = useRef(false);
  const isRequestingRef = useRef(false); // Track request state with ref to prevent race conditions

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
      
      const request: SubWalletOTPRequest = { 
        action: 'create',
        walletName: walletName.trim()
      };
      const response = await WalletService.requestSubWalletOTP(request);
      
      if (response.otpCode) {
        setRealOTP(response.otpCode);
        console.log('✅ Real OTP received from backend for sub-wallet creation:', response.otpCode);
      }
      
      // Reset timer
      setTimeLeft(30);
      setIsResendDisabled(true);
      setOtp(['', '', '', '', '', '']);
      hasRequestedOTP.current = true;
      
    } catch (error: any) {
      console.error('❌ Error requesting sub-wallet OTP:', error);
      setOtpError(error.message || 'Failed to request OTP. Please try again.');
    } finally {
      isRequestingRef.current = false;
      setIsRequestingOTP(false);
    }
  };

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

  // Load sub-wallets and main wallet on component mount
  useEffect(() => {
    loadSubWallets();
    loadMainWallet();
  }, []);

  // Reload when component becomes visible (handles back navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 SubWallet: Page visible again, reloading wallets...');
        loadSubWallets();
        loadMainWallet();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Close modals when navigating back or away
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Close any open modals/forms when navigating back
      setShowLimitReachedModal(false);
      setShowCreateForm(false);
      setShowOTP(false);
      setShowSuccess(false);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Also close modals when component unmounts (navigating away)
    return () => {
      window.removeEventListener('popstate', handlePopState);
      setShowLimitReachedModal(false);
      setShowCreateForm(false);
      setShowOTP(false);
      setShowSuccess(false);
    };
  }, []);

  // Load main wallet from API
  const loadMainWallet = async () => {
    try {
      setIsLoadingMainWallet(true);
      const [status, balanceData] = await Promise.all([
        WalletService.getStatus(),
        WalletService.getBalance()
      ]);
      
      // Get full balance info from TransactionService which has more details
      const { TransactionService } = await import('../../../services/transactionService');
      const fullBalance = await TransactionService.getWalletBalance();
      
      setMainWallet({
        subWalletId: undefined, // Main wallet has no sub-wallet ID
        subWalletName: 'Main Wallet',
        balance: fullBalance.totalBalance || 0,
        onHoldBalance: fullBalance.onHoldBalance || 0,
        availableBalance: fullBalance.availableBalance || 0,
        status: status.isActive ? 'ACTIVE' : 'INACTIVE',
        isMainWallet: true
      });
    } catch (err) {
      console.error('Error loading main wallet:', err);
    } finally {
      setIsLoadingMainWallet(false);
    }
  };

  // Load sub-wallets from API
  const loadSubWallets = async () => {
    try {
      setIsLoadingWallets(true);
      setWalletsError(null);
      const wallets = await WalletService.getSubWallets();
      setSubWallets(wallets);
    } catch (err) {
      console.error('Error loading sub-wallets:', err);
      setWalletsError(err instanceof Error ? err.message : 'Failed to load sub-wallets');
    } finally {
      setIsLoadingWallets(false);
    }
  };

  // Request OTP when OTP screen is shown (only once)
  useEffect(() => {
    if (showOTP && !hasRequestedOTP.current && !isRequestingRef.current) {
      console.log('📞 Requesting OTP for sub-wallet creation');
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setTimeLeft(30);
      setIsResendDisabled(true);
      hasRequestedOTP.current = true;
      requestOTP();
      
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOTP]);

  // OTP timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [timeLeft]);

  const handleCreateSubWallet = () => {
    // Check if user has reached the maximum number of sub-wallets (5)
    if (subWallets.length >= 5) {
      setShowLimitReachedModal(true);
      return;
    }
    
    setShowCreateForm(true);
  };

  const handleBack = () => {
    setShowCreateForm(false);
    setWalletName('');
    setError('');
  };

  const handleConfirmCreate = async () => {
    if (!walletName.trim()) {
      setError('Sub-wallet name is required');
      return;
    }

    if (walletName.trim().length < 3) {
      setError('Sub-wallet name must be at least 3 characters');
      return;
    }

    // Show OTP screen - OTP will be requested automatically via useEffect
    setShowOTP(true);
  };

  const handleWalletNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletName(e.target.value);
    if (error) setError('');
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error when user starts typing
    if (otpError) setOtpError('');

    // Auto-focus next input
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

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    
    setIsLoading(true);
    setOtpError('');
    
    try {
      console.log('🔍 Verifying OTP and creating sub-wallet...', {
        subWalletName: walletName.trim(),
        otpLength: otpCode.length
      });
      
      // Create sub-wallet with OTP - backend will verify OTP internally
      // This will call POST /api/v1/sub-wallets with { subWalletName, otp }
      const newWallet = await WalletService.createSubWallet({
        subWalletName: walletName.trim(),
        otp: otpCode
      });
      
      console.log('✅ Sub-wallet created successfully:', newWallet);
      
      // Add the new wallet to the list
      setSubWallets(prev => [...prev, newWallet]);
        
      // Show success screen
      setShowSuccess(true);
    } catch (err: any) {
      console.error('❌ Error creating sub-wallet:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status
      });
      
      // Check if it's an OTP validation error
      if (err.message?.includes('Invalid') || err.message?.includes('incorrect') || err.message?.includes('expired') || err.message?.includes('OTP')) {
        setOtpError('The code you entered is incorrect. Please try again.');
      } else {
        setOtpError(err instanceof Error ? err.message : 'Failed to create sub-wallet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (isRequestingOTP) return; // Prevent multiple requests
    
    // Reset the flag to allow resending
    hasRequestedOTP.current = false;
    await requestOTP();
  };

  const handleSuccessDone = () => {
    // Reset all states
    setShowSuccess(false);
    setShowOTP(false);
    setShowCreateForm(false);
    setWalletName('');
    setError('');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNavigateBack = () => {
    navigate('/app/services/wallet');
  };

  const handleCloseLimitModal = () => {
    setShowLimitReachedModal(false);
  };

  const handleWalletClick = (wallet: SubWalletData | MainWalletData) => {
    if ('isMainWallet' in wallet && wallet.isMainWallet) {
      // Navigate to dashboard with main wallet (no sub-wallet context)
      navigate('/app/dashboard', { 
        state: { 
          subWalletName: undefined,
          subWalletId: undefined,
          isSubWallet: false 
        } 
      });
    } else {
      // Navigate to dashboard with sub-wallet data
      navigate('/app/dashboard', { 
        state: { 
          subWalletName: wallet.subWalletName,
          subWalletId: wallet.subWalletId,
          isSubWallet: true 
        } 
      });
    }
  };

  // Show success screen if OTP is verified
  if (showSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
          }}
        />

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Success Card */}
            <div 
              className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <img src={checkCircle} alt="Success" className="w-20 h-20" />
              </div>

              {/* Success Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#022466] mb-2">
                  Sub-Wallet Created
                </h2>
                <p className="text-gray-600">
                  Your new sub-wallet {walletName} has been successfully created.
                </p>
              </div>

              {/* Done Button */}
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
        {/* Background with gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
          }}
        />

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* OTP Card */}
            <div 
              className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-200/50 relative bg-white"
            >
              {/* Back Button */}
              <button
                onClick={() => setShowOTP(false)}
                className="absolute top-6 left-6 text-[#022466] hover:text-[#0475CC] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Form */}
              <form onSubmit={handleOTPVerify} className="pt-8">
                {/* Title */}
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

                {/* OTP Input Fields */}
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
                      className="w-14 h-14 text-4xl text-[#00BDFF] font-bold text-center rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#022466] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        border: '1px solid #2C2C2CB2',
                      }}
                      required
                    />
                  ))}
                </div>

                {/* Error Message */}
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

                {/* Helper Text */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-2">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResendDisabled}
                      className={`font-medium ${
                        isResendDisabled 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-[#0475CC] hover:text-[#022466]'
                      }`}
                    >
                      Resend in {formatTime(timeLeft)}
                    </button>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      className="w-full max-w-xs" 
                      disabled={isLoading || isRequestingOTP || otp.some(digit => !digit)}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-center">
                   
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
            <div className="subwallet-header">
              <div className="subwallet-header-icon">
                <img src={subWalletIcon} alt="Create Sub-Wallet" className="subwallet-header-icon-img" />
              </div>
              <h2 className="subwallet-header-title">Create Sub-Wallet</h2>
            </div>

            <div className="subwallet-content">
              {showCreateForm ? (
                <div className="create-subwallet-content">
                  <h3 className="create-subwallet-title">Create Sub-Wallet</h3>
                  <p className="create-subwallet-description">
                    Create a new sub-wallet to organize your money and manage your expenses more effectively.
                  </p>

                  <div className="create-subwallet-form">
                    <label className="create-subwallet-label">Sub-Wallet Name</label>
                    <input
                      type="text"
                      placeholder="Enter Sub-Wallet Name"
                      value={walletName}
                      onChange={handleWalletNameChange}
                      className={`create-subwallet-input ${error ? 'error' : ''}`}
                      autoFocus
                    />
                    {error && (
                      <span className="create-subwallet-error">{error}</span>
                    )}
                  </div>

                  <div className="create-subwallet-actions">
                    <Button
                      onClick={handleBack}
                      className="create-subwallet-button create-subwallet-button-secondary"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleConfirmCreate}
                      className="create-subwallet-button create-subwallet-button-primary"
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="subwallet-section-title">My Sub-Wallets</h3>
                  <div className="subwallet-description-wrapper">
                    <p className="subwallet-description">
                      Create new sub-wallets to organize your funds and control spending.
                    </p>
                    <p className="subwallet-description-link">
                      View and manage your sub-wallets
                    </p>
                  </div>

                  {isLoadingWallets || isLoadingMainWallet ? (
                    <div className="subwallet-loading">
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022466]"></div>
                        <span className="ml-2 text-gray-600">Loading wallets...</span>
                      </div>
                    </div>
                  ) : walletsError ? (
                    <div className="subwallet-error">
                      <div className="flex items-center justify-center py-8 text-red-600">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Error: {walletsError}</span>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => { loadSubWallets(); loadMainWallet(); }}
                          className="px-4 py-2 bg-[#022466] text-white rounded-lg hover:bg-[#0475CC] transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="subwallet-list">
                      {/* Main Wallet - Always first */}
                      {mainWallet && (
                        <div 
                          key="main-wallet"
                          className={`subwallet-item ${mainWallet.status === 'INACTIVE' ? 'deactivated' : ''}`}
                          onClick={() => handleWalletClick(mainWallet)}
                          style={{ cursor: 'pointer', opacity: mainWallet.status === 'INACTIVE' ? 0.7 : 1 }}
                        >
                          <div className="subwallet-item-icon light-blue">
                            <img src={subWalletListIcon} alt="Wallet" className="subwallet-item-icon-img" />
                          </div>
                          <div className="subwallet-item-info">
                            <h4 className="subwallet-item-name">{mainWallet.subWalletName || 'Name Wallet'}</h4>
                            <p className="subwallet-item-id">Main Account</p>
                          </div>
                          <div className="subwallet-item-chevron">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 18L15 12L9 6" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Sub-Wallets - Show all, including deactivated */}
                      {subWallets.length === 0 ? (
                        <div className="subwallet-empty" style={{ marginTop: '16px' }}>
                          <div className="text-center py-8 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11H17" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15H13" />
                            </svg>
                            <p className="text-lg font-medium mb-2">No sub-wallets yet</p>
                            <p className="text-sm">Create your first sub-wallet to get started</p>
                          </div>
                        </div>
                      ) : (
                        subWallets.map((wallet, index) => (
                          <div 
                            key={wallet.subWalletId} 
                            className={`subwallet-item ${wallet.status === 'INACTIVE' ? 'deactivated' : ''}`}
                            onClick={() => handleWalletClick(wallet)}
                            style={{ cursor: 'pointer', opacity: wallet.status === 'INACTIVE' ? 0.7 : 1 }}
                          >
                            <div className="subwallet-item-icon light-blue">
                              <img src={subWalletListIcon} alt="Wallet" className="subwallet-item-icon-img" />
                            </div>
                            <div className="subwallet-item-info">
                              <h4 className="subwallet-item-name">{wallet.subWalletName || 'Name Wallet'}</h4>
                              <p className="subwallet-item-id">ID : {wallet.subWalletId}</p>
                            </div>
                            <div className="subwallet-item-chevron">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <div className="subwallet-actions">
                    <button
                      onClick={handleCreateSubWallet}
                      className="subwallet-create-button"
                    >
                      <div className="subwallet-button-icon-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="subwallet-button-icon">
                          <path d="M12 5V19M5 12H19" stroke="#00BDFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      Create Sub-Wallet
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Limit Reached Modal */}
      {showLimitReachedModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background with gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 25%, #6A5ACD40 50%, #F8FAFC 100%)'
            }}
          />
          
          <div className="relative z-10 bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl backdrop-blur-sm border border-blue-200/50">
            {/* Close Button */}
            <button
              onClick={handleCloseLimitModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <img src={rejectIcon} alt="Limit Reached" className="w-20 h-20" />
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#022466] mb-2">
                Limit Reached
              </h2>
              <p className="text-red-600 text-lg">
                You have reached the maximum number of sub-wallets (5)
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCloseLimitModal}
                className="px-8 py-3 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubWallet;

