import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import DeactivateWalletModal from '../../../components/modals/DeactivateWalletModal';
import ActivateWalletModal from '../../../components/modals/ActivateWalletModal';
import walletManagementIcon from '../../../assets/wallet-managment/wallet-managment.svg';
import statusIcon from '../../../assets/wallet-managment/status.svg';
import limitsIcon from '../../../assets/wallet-managment/limits.svg';
import subWalletIcon from '../../../assets/wallet-managment/sub-wallet.svg';

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [isWalletActive, setIsWalletActive] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);

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

  // Check for completed OTP verification
  useEffect(() => {
    const actionCompleted = localStorage.getItem('walletActionCompleted');
    const action = localStorage.getItem('walletAction');
    
    if (actionCompleted === 'true' && action) {
      if (action === 'activate') {
        setIsWalletActive(true);
      } else if (action === 'deactivate') {
        setIsWalletActive(false);
      }
      
      // Clear the stored action
      localStorage.removeItem('walletAction');
      localStorage.removeItem('walletActionCompleted');
    }
  }, []);

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
    // Navigate to OTP page with deactivate action
    navigate('/app/services/wallet/otp', { 
      state: { action: 'deactivate' } 
    });
  };

  const handleConfirmActivation = () => {
    setShowActivateModal(false);
    // Navigate to OTP page with activate action
    navigate('/app/services/wallet/otp', { 
      state: { action: 'activate' } 
    });
  };

  const handleCloseModal = () => {
    setShowDeactivateModal(false);
    setShowActivateModal(false);
  };

  const handleLimitsClick = () => {
    navigate('/app/services/wallet/limits');
  };

  const handleSubWalletClick = () => {
    navigate('/app/services/wallet/subwallet');
  };

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
                <img src={walletManagementIcon} alt="Wallet Management" className="wallet-header-icon-img" />
              </div>
              <h2 className="wallet-header-title">Wallet Management</h2>
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
                      {isWalletActive 
                        ? "Wallet is activated. You can use all services." 
                        : "Wallet is deactivated. Reactivate to use services."
                      }
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
                  <div className="wallet-section" onClick={handleLimitsClick}>
                    <div className="wallet-section-content">
                      <div className="wallet-section-icon">
                        <img src={limitsIcon} alt="Limits Configuration" className="wallet-section-icon-img" />
                      </div>
                      <div className="wallet-section-info">
                        <h3 className="wallet-section-title">Limits Configuration</h3>
                        <p className="wallet-section-description">Manage your transfer and withdrawal limits.</p>
                      </div>
                    </div>
                    <div className="wallet-section-control">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                      </svg>
                    </div>
                  </div>
              
              {/* Create Sub-Wallet Section */}
              <div className="wallet-section" onClick={handleSubWalletClick}>
                <div className="wallet-section-content">
                  <div className="wallet-section-icon">
                    <img src={subWalletIcon} alt="Create Sub-Wallet" className="wallet-section-icon-img" />
                  </div>
                  <div className="wallet-section-info">
                    <h3 className="wallet-section-title">Create Sub-Wallet</h3>
                    <p className="wallet-section-description">Add a new sub-wallet to manage your funds.</p>
                  </div>
                </div>
                <div className="wallet-section-control">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deactivate Wallet Modal */}
      <DeactivateWalletModal
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
