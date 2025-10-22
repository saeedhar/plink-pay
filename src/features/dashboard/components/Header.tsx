import React from 'react';
import balanceIcon from '../../../assets/dashboard/balance.svg';
import profileIcon from '../../../assets/dashboard/profile.svg';
import notificationsIcon from '../../../assets/dashboard/Notifications.svg';

const Header: React.FC = () => {
  return (
    <div className="header">
      <div className="header-left">
        <div className="balance-badge">
          <img src={balanceIcon} alt="Balance" className="wallet-icon" />
          <span>Total Balance : 2.400,00 SAR</span>
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
          <div className="icon-button profile-icon">
            <img src={profileIcon} alt="Profile" className="profile-icon-img" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
