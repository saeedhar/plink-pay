import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import balanceIcon from '../../../assets/dashboard/balance.svg';
import profileIcon from '../../../assets/dashboard/profile.svg';
import notificationsIcon from '../../../assets/dashboard/Notifications.svg';
import ProfileDropdown from './ProfileDropdown';
import { TransactionService, WalletBalanceResponse } from '../../../services/transactionService';

interface HeaderProps {
  subWalletId?: string;
  isSubWallet?: boolean;
}

const Header: React.FC<HeaderProps> = ({ subWalletId, isSubWallet }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalanceResponse | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  // Fetch wallet balance on component mount or when sub-wallet changes
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        setIsLoadingBalance(true);
        setBalanceError(null);
        // Pass subWalletId if viewing a sub-wallet
        const balance = await TransactionService.getWalletBalance(isSubWallet ? subWalletId : undefined);
        setWalletBalance(balance);
        console.log('🔍 Header: Wallet balance loaded:', balance, isSubWallet ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
      } catch (error) {
        console.error('Error loading wallet balance in header:', error);
        setBalanceError(error instanceof Error ? error.message : 'Failed to load balance');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadWalletBalance();
    
    // Also reload when component becomes visible (handles back navigation)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Header: Page visible again, reloading balance...');
        loadWalletBalance();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubWallet, subWalletId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        closeProfileDropdown();
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  return (
    <div className="header">
      <div className="header-left">
        <div className="balance-badge-wrapper">
        <div className="balance-badge">
          <img src={balanceIcon} alt="Balance" className="wallet-icon" />
          <span>
            Total Balance: {
              isLoadingBalance 
                ? 'Loading...' 
                : balanceError 
                  ? 'Error' 
                    : isBalanceVisible
                      ? (walletBalance 
                          ? `${walletBalance.totalBalance.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${walletBalance.currency || 'SAR'}`
                          : '0.00 SAR')
                      : '••••••'
            }
          </span>
            <button 
              onClick={toggleBalanceVisibility}
              className="balance-toggle-icon"
              type="button"
              aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
            >
              {isBalanceVisible ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#022466" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#022466" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1757 15.0074 10.8016 14.8565C10.4276 14.7056 10.0867 14.481 9.79772 14.1961C9.50873 13.9113 9.27752 13.5716 9.11711 13.1976C8.9567 12.8236 8.87011 12.4232 8.86218 12.0196C8.85425 11.616 8.92511 11.2162 9.071 10.8419C9.2169 10.4676 9.43519 10.1263 9.714 9.837" stroke="#022466" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 1L23 23" stroke="#022466" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" color="#022466" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Type here..." 
            className="search-input"
          />
        </div>
        <div className="header-icons">
          <div className="icon-button notification-icon">
            <img src={notificationsIcon} alt="Notifications" className="notification-icon-img" />
          </div>
          <div 
            ref={profileRef}
            className="icon-button profile-icon"
            onClick={toggleProfileDropdown}
          >
            <img src={profileIcon} alt="Profile" className="profile-icon-img" />
            <ProfileDropdown 
              isOpen={isProfileDropdownOpen}
              onClose={closeProfileDropdown}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
