import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSettingsOutline, IoLogOutOutline, IoSettingsSharp } from 'react-icons/io5';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleAccountSettings = () => {
    navigate('/app/account-settings');
    onClose();
  };

  const handleLogout = () => {
    // Clear user session/tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    
    // Navigate to login
    navigate('/login');
    onClose();
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
          >
            <div className="profile-dropdown-icon">
              <IoLogOutOutline size={20} color="#1F2937" />
            </div>
            <span className="profile-dropdown-text">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;
