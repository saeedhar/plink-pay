import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import DeactivateWalletModal from '../../../components/modals/DeactivateWalletModal';
import ActivateWalletModal from '../../../components/modals/ActivateWalletModal';
import { WalletService, WalletStatus, WalletBalance } from '../../../services/walletService';
import walletManagementIcon from '../../../assets/wallet-managment/wallet-managment.svg';
import statusIcon from '../../../assets/wallet-managment/status.svg';
import limitsIcon from '../../../assets/wallet-managment/limits.svg';
import subWalletIcon from '../../../assets/wallet-managment/sub-wallet.svg';

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { subWalletName?: string; subWalletId?: string; isSubWallet?: boolean } | null;
  const subWalletId = state?.subWalletId;
  const isSubWallet = state?.isSubWallet;
  const [isWalletActive, setIsWalletActive] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load wallet data on component mount or when sub-wallet changes
  useEffect(() => {
    loadWalletData();
  }, [isSubWallet, subWalletId]);

  // Check for completed OTP verification
  useEffect(() => {
    const actionCompleted = localStorage.getItem('walletActionCompleted');
    const action = localStorage.getItem('walletAction');
    const actionSubWalletId = localStorage.getItem('walletActionSubWalletId');
    const actionIsSubWallet = localStorage.getItem('walletActionIsSubWallet') === 'true';
    
    // Only process if this is for the current sub-wallet (or main wallet if no sub-wallet)
    const isForCurrentWallet = (
      (!isSubWallet && !actionIsSubWallet) || // Both main wallet
      (isSubWallet && actionIsSubWallet && subWalletId === actionSubWalletId) // Same sub-wallet
    );
    
    if (actionCompleted === 'true' && action && isForCurrentWallet) {
      if (action === 'activate') {
        setIsWalletActive(true);
        // Reload wallet data after activation
        loadWalletData();
      } else if (action === 'deactivate') {
        setIsWalletActive(false);
        // Reload wallet data after deactivation
        loadWalletData();
      }
      
      // Clear the stored action
      localStorage.removeItem('walletAction');
      localStorage.removeItem('walletActionCompleted');
      localStorage.removeItem('walletActionSubWalletId');
      localStorage.removeItem('walletActionIsSubWallet');
      localStorage.removeItem('walletActionSubWalletName');
    }
  }, [isSubWallet, subWalletId]);

  // Close modals when navigating back or away
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Close any open modals when navigating back
      setShowDeactivateModal(false);
      setShowActivateModal(false);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Also close modals when component unmounts (navigating away)
    return () => {
      window.removeEventListener('popstate', handlePopState);
      setShowDeactivateModal(false);
      setShowActivateModal(false);
    };
  }, []);

  // Load wallet data from API
  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load wallet status and balance in parallel, using subWalletId if viewing a sub-wallet
      const [status, balance] = await Promise.all([
        WalletService.getStatus(isSubWallet ? subWalletId : undefined),
        WalletService.getBalance(isSubWallet ? subWalletId : undefined)
      ]);
      
      setWalletStatus(status);
      setWalletBalance(balance);
      setIsWalletActive(status.isActive);
      
      console.log('🔍 Wallet data loaded:', {
        status: status,
        balance: balance,
        isWalletActive: status.isActive
      });
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChange = () => {
    if (isWalletActive) {
      // If currently active, show deactivation modal
      setShowDeactivateModal(true);
    } else {
      // If currently inactive, show activation modal
      setShowActivateModal(true);
    }
  };

  const handleConfirmDeactivation = () => {
    setShowDeactivateModal(false);
    // Navigate to OTP page with deactivate action and sub-wallet info
    navigate('/app/services/wallet/otp', { 
      state: { 
        action: 'deactivate',
        subWalletId: isSubWallet ? subWalletId : undefined,
        isSubWallet: isSubWallet
      } 
    });
  };

  const handleConfirmActivation = () => {
    setShowActivateModal(false);
    // Navigate to OTP page with activate action and sub-wallet info
    navigate('/app/services/wallet/otp', { 
      state: { 
        action: 'activate',
        subWalletId: isSubWallet ? subWalletId : undefined,
        isSubWallet: isSubWallet
      } 
    });
  };

  const handleCloseModal = () => {
    setShowDeactivateModal(false);
    setShowActivateModal(false);
  };

  const handleLimitsClick = () => {
    if (!isWalletActive) return; // Disable if wallet is deactivated
    navigate('/app/services/wallet/limits', {
      state: {
        subWalletId: isSubWallet ? subWalletId : undefined,
        isSubWallet: isSubWallet,
        subWalletName: state?.subWalletName
      }
    });
  };

  const handleSubWalletClick = () => {
    if (!isWalletActive || isSubWallet) return; // Disable if wallet is deactivated or viewing a sub-wallet
    navigate('/app/services/wallet/subwallet');
  };

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
                <img src={walletManagementIcon} alt="Wallet Management" className="wallet-header-icon-img" />
              </div>
              <h2 className="wallet-header-title">
                {isSubWallet && state?.subWalletName 
                  ? `${state.subWalletName} - Wallet Management`
                  : 'Wallet Management'}
              </h2>
            </div>
            
            <div className="wallet-sections">
              {/* Wallet Status Section */}
              <div className="wallet-section">
                <div className="wallet-section-content">
                  <div className="wallet-section-icon">
                    <img src={statusIcon} alt="Wallet Status" className="wallet-section-icon-img" />
                  </div>
                  <div className="wallet-section-info">
                    <h3 className="wallet-section-title">Wallet Status</h3>
                    <p className="wallet-section-description">
                      {isLoading ? (
                        "Loading wallet status..."
                      ) : error ? (
                        `Error: ${error}`
                      ) : isWalletActive ? (
                        "Wallet is activated. You can use all services."
                      ) : (
                        "Wallet is deactivated. Reactivate to use services."
                      )}
                    </p>
                    
                  </div>
                </div>
                <div className="wallet-section-control">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={isWalletActive}
                      onChange={handleToggleChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
                  {/* Limits Configuration Section */}
                  <div 
                    className={`wallet-section ${!isWalletActive ? 'wallet-section-disabled' : ''}`} 
                    onClick={handleLimitsClick}
                    style={{ cursor: !isWalletActive ? 'not-allowed' : 'pointer', opacity: !isWalletActive ? 0.5 : 1 }}
                  >
                    <div className="wallet-section-content">
                      <div className="wallet-section-icon">
                        <img src={limitsIcon} alt="Limits Configuration" className="wallet-section-icon-img" />
                      </div>
                      <div className="wallet-section-info">
                        <h3 className="wallet-section-title">Limits Configuration</h3>
                        <p className="wallet-section-description">
                          {!isWalletActive 
                            ? 'Wallet must be activated to configure limits.' 
                            : 'Manage your transfer and withdrawal limits.'}
                        </p>
                      </div>
                    </div>
                    <div className="wallet-section-control">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill={!isWalletActive ? "#9CA3AF" : "#1F2937"}/>
                      </svg>
                    </div>
                  </div>
              
              {/* Create Sub-Wallet Section */}
              <div 
                className={`wallet-section ${(!isWalletActive || isSubWallet) ? 'wallet-section-disabled' : ''}`} 
                onClick={handleSubWalletClick}
                style={{ cursor: (!isWalletActive || isSubWallet) ? 'not-allowed' : 'pointer', opacity: (!isWalletActive || isSubWallet) ? 0.5 : 1 }}
              >
                <div className="wallet-section-content">
                  <div className="wallet-section-icon">
                    <img src={subWalletIcon} alt="Create Sub-Wallet" className="wallet-section-icon-img" />
                  </div>
                  <div className="wallet-section-info">
                    <h3 className="wallet-section-title">Create Sub-Wallet</h3>
                    <p className="wallet-section-description">
                      {!isWalletActive 
                        ? 'Wallet must be activated to create sub-wallets.' 
                        : isSubWallet 
                          ? 'You are currently in a sub-wallet. Return to the main wallet to create a new sub-wallet.' 
                          : 'Add a new sub-wallet to manage your funds.'}
                    </p>
                  </div>
                </div>
                <div className="wallet-section-control">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill={!isWalletActive ? "#9CA3AF" : "#1F2937"}/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deactivate Wallet Modal */}
      <DeactivateWalletModal
        isSubWallet={isSubWallet}
        subWalletName={state?.subWalletName}
        isOpen={showDeactivateModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDeactivation}
      />
      
      {/* Activate Wallet Modal */}
      <ActivateWalletModal
        isOpen={showActivateModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmActivation}
      />
    </div>
  );
};

export default Wallet;
