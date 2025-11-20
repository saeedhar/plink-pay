import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoNotificationsOutline, IoMailOutline, IoMegaphoneOutline } from 'react-icons/io5';
import NotificationsIcon from '../../../assets/Profile/notification-managment.svg';
import EmailIcon from '../../../assets/Profile/Email.svg';
import { UserManagementService } from '../../../services/userManagementService';

const NotificationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Load notification preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const prefs = await UserManagementService.getNotificationPreferences();
        setEmailNotifications(prefs.emailNotifications);
        setMarketingNotifications(prefs.marketingNotifications || false);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, []);

  const handleEmailToggle = async () => {
    const newValue = !emailNotifications;
    const previousValue = emailNotifications;
    
    // Optimistically update UI
    setEmailNotifications(newValue);
    setIsUpdating(true);
    
    try {
      await UserManagementService.updateNotificationPreferences({
        emailNotifications: newValue
      });
    } catch (error) {
      console.error('Failed to update email notifications:', error);
      // Revert on error
      setEmailNotifications(previousValue);
      alert('Failed to update email notification preference. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarketingToggle = async () => {
    const newValue = !marketingNotifications;
    const previousValue = marketingNotifications;
    
    // Optimistically update UI
    setMarketingNotifications(newValue);
    setIsUpdating(true);
    
    try {
      await UserManagementService.updateNotificationPreferences({
        marketingNotifications: newValue
      });
    } catch (error) {
      console.error('Failed to update marketing notifications:', error);
      // Revert on error
      setMarketingNotifications(previousValue);
      alert('Failed to update marketing notification preference. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Account & Settings</h1>
          
          <div className="account-settings-container" style={{ maxWidth: '600px' }}>
            {/* Notification Management Section */}
            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <img src={NotificationsIcon} alt="Notifications" style={{ width: '35px', height: '35px' }} />
                </div>
                <h2 className="section-title" style={{ margin: 0 }}>Notification Management</h2>
              </div>

              {/* Notification Items */}
              <div className="notification-list">
                {/* Email Notifications */}
                <div className="notification-item">
                  <div className="notification-content">
                    <div className="notification-icon">
                      <IoMailOutline size={24} color="#022466" />
                    </div>
                    <div className="notification-info">
                      <h3 className="notification-title">Email Notifications</h3>
                      <p className="notification-description">
                        Email notifications are {emailNotifications ? 'active' : 'inactive'} to receive updates.
                      </p>
                    </div>
                  </div>
                  <div className="toggle-switch-container">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={handleEmailToggle}
                        disabled={isLoading || isUpdating}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Marketing Notifications */}
                <div className="notification-item">
                  <div className="notification-content">
                    <div className="notification-icon">
                      <IoMegaphoneOutline size={24} color="#022466" />
                    </div>
                    <div className="notification-info">
                      <h3 className="notification-title">Marketing Notifications</h3>
                      <p className="notification-description">
                        Marketing notifications are {marketingNotifications ? 'active' : 'inactive'} to receive updates.
                      </p>
                    </div>
                  </div>
                  <div className="toggle-switch-container">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={marketingNotifications}
                        onChange={handleMarketingToggle}
                        disabled={isLoading || isUpdating}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;

