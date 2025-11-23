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
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
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
        <div className="balance-badge">
          <img src={balanceIcon} alt="Balance" className="wallet-icon" />
          <span>
            Total Balance: {
              isLoadingBalance 
                ? 'Loading...' 
                : balanceError 
                  ? 'Error' 
                  : walletBalance 
                    ? TransactionService.formatCurrency(walletBalance.totalBalance, walletBalance.currency)
                    : '0.00 SAR'
            }
          </span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
