import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoNotificationsOutline, IoMailOutline, IoMegaphoneOutline } from 'react-icons/io5';
import NotificationsIcon from '../../../assets/Profile/notification-managment.svg';
import EmailIcon from '../../../assets/Profile/Email.svg';

const NotificationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(true);

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

  const handleEmailToggle = () => {
    setEmailNotifications(!emailNotifications);
    // TODO: Update email notification preference in backend
  };

  const handleMarketingToggle = () => {
    setMarketingNotifications(!marketingNotifications);
    // TODO: Update marketing notification preference in backend
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

