import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoLogOutOutline, IoSettingsSharp } from 'react-icons/io5';
import { logout } from '../../../services/realBackendAPI';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAccountSettings = () => {
    navigate('/app/account-settings');
    onClose();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🚪 Starting logout process...');
      
      // Call logout API to invalidate session on backend and clear tokens
      await logout();
      
      console.log('✅ Logged out successfully, redirecting to login');
      
      // Navigate to login using replace to prevent going back to dashboard
      navigate('/login', { replace: true });
      onClose();
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Even if logout throws an error, tokens should be cleared
      // Navigate to login to ensure user is logged out
      navigate('/login', { replace: true });
    onClose();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="profile-dropdown-backdrop" 
        onClick={onClose}
      />
      
      {/* Dropdown Menu */}
      <div className="profile-dropdown">
        <div className="profile-dropdown-content">
          <button 
            className="profile-dropdown-item"
            onClick={handleAccountSettings}
          >
            <div className="profile-dropdown-icon">
              <IoSettingsSharp size={20} color="#1F2937" />
            </div>
            <span className="profile-dropdown-text">Account & Settings</span>
          </button>

          <button 
            className="profile-dropdown-item"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <div className="profile-dropdown-icon">
              {isLoggingOut ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
              <IoLogOutOutline size={20} color="#1F2937" />
              )}
            </div>
            <span className="profile-dropdown-text">
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;
