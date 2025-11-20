import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { UserManagementService } from '../../../services/userManagementService';
import { 
  IoPhonePortraitOutline, 
  IoMailOutline, 
  IoDocumentTextOutline, 
  IoLockClosedOutline,
  IoNotificationsOutline,
  IoLanguageOutline,
  IoHomeOutline,
  IoStatsChartOutline,
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline
} from 'react-icons/io5';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add dashboard-root class to root element
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('dashboard-root');
    }
    
    // Cleanup function to remove class when component unmounts
    return () => {
      if (root) {
        root.classList.remove('dashboard-root');
      }
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const profile = await UserManagementService.getProfile();
        setName(profile.name || profile.email || 'User');
        setEmail(profile.email || 'No email');
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Set default values on error
        setName('User');
        setEmail('No email');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleMenuItemClick = (path: string) => {
    // Navigate to specific settings page
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Account & Settings</h1>
          
          <div className="account-settings-container">
            {/* Profile Section */}
            <div className="profile-section">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <div className="avatar-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#022466" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="#022466" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="edit-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="profile-info">
                <h3 className="profile-name">{isLoading ? 'Loading...' : (name || 'User')}</h3>
                <p className="profile-email">{isLoading ? 'Loading...' : (email || 'No email')}</p>
              </div>
            </div>

            {/* Account & Security Section */}
            <div className="settings-section">
              <h2 className="section-title">Account & Security</h2>
              
              <div className="settings-menu">
                <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/mobile')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoPhonePortraitOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Update Mobile Number</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div>

                <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/email')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoMailOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Update / Add Email</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div>

                <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/kyc')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoDocumentTextOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Update KYB Form</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div>

                <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/password')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoLockClosedOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Change Password</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="settings-section">
              <h2 className="section-title">Settings</h2>
              
              <div className="settings-menu">
                <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/notifications')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoNotificationsOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Notification Management</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div>

                <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/language')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoLanguageOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Preferred Language</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div>

                <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/national-address')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoHomeOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Update National Address</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div>

                {/* <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/limits')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoStatsChartOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Limit Management</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div> */}

                <div 
                  className="menu-item"
                  onClick={() => handleMenuItemClick('/app/account-settings/devices')}
                >
                  <div className="menu-item-content">
                    <div className="menu-item-icon">
                      <IoShieldCheckmarkOutline size={24} color="#022466" />
                    </div>
                    <span className="menu-item-text">Trusted Devices Management</span>
                  </div>
                  <IoChevronForwardOutline size={20} color="#667085" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
