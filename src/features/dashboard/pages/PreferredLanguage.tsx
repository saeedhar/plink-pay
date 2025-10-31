import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoMailOutline, IoGlobeOutline ,IoLanguageOutline} from 'react-icons/io5';

const PreferredLanguage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [error, setError] = useState('');

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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLanguage(value);
    
    if (error) {
      setError('');
    }
  };

  const handleClose = () => {
    navigate('/app/account-settings');
  };

  const handleConfirm = () => {
    // TODO: Submit language preference to backend
    console.log('Selected language:', selectedLanguage);
    
    // Navigate back to account settings
    navigate('/app/account-settings');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Account & Settings</h1>
          
          <div className="update-mobile-container">
            <div className="update-mobile-modal">
              {/* Header */}
              <div className="modal-header">
                <div className="modal-header-icon">
                  <IoLanguageOutline size={24} color="#022466" />
                </div>
                <h2 className="modal-title">Preferred Language</h2>
              </div>

              {/* Content */}
              <div className="modal-content">
                {/* Icon and Title Section */}
                <div className="email-add-section">
                  <div className="email-add-icon">
                    <IoGlobeOutline size={50} color="#022466" />
                  </div>
                  
                  <h3 className="email-add-title">Preferred Language</h3>
                  <p className="email-add-description">Choose your preferred language.</p>
                </div>

                {/* Form Section */}
                <div className="form-section" style={{ alignItems: 'center' }}>
                  <label className="form-label" style={{ marginLeft: '70px' }}>Language</label>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                    <select
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      className={`email-input ${error ? 'email-input-error' : ''}`}
                      style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                    >
                      <option value="english">English</option>
                      <option value="arabic">Arabic</option>
                    </select>
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {error && (
                    <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px' }}>
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={handleClose}
                >
                  Close
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferredLanguage;

