import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import PasswordIcon from '../../../assets/password.svg';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return 'Password is required';
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    navigate('/forgot-password');
  };

  const handleClose = () => {
    navigate('/app/account-settings');
  };

  const handleNext = () => {
    const validationError = validatePassword(password);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Navigate to set new password screen
    navigate('/app/account-settings/password/new', {
      state: { currentPassword: password }
    });
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
                  <IoLockClosedOutline size={24} color="#022466" />
                </div>
                <h2 className="modal-title">Change Password</h2>
              </div>

              {/* Content */}
              <div className="modal-content">
                {/* Icon and Title Section */}
                <div className="email-add-section">
                  <div className="email-add-icon">
                    <img src={PasswordIcon} alt="Password" style={{ width: '50px', height: '50px' }} />
                  </div>
                  
                  <h3 className="email-add-title">Enter your password</h3>
                  <p className="email-add-description">Please enter your password to continue.</p>
                </div>

                {/* Form Section */}
                <div className="form-section" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                    {/* Label - Top left corner of input */}
                    <label className="form-label" style={{ marginLeft: '8px', textAlign: 'left', display: 'block', marginBottom: '8px' }}>Password</label>
                    
                    {/* Input Field Container */}
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your password"
                        className={`email-input ${error ? 'email-input-error' : ''}`}
                        style={{ 
                          paddingRight: '48px',
                          paddingLeft: '16px',
                          width: '100%'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleTogglePassword}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#98A2B3',
                          zIndex: 1
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <IoEyeOffOutline size={20} color="#98A2B3" />
                        ) : (
                          <IoEyeOutline size={20} color="#98A2B3" />
                        )}
                      </button>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                      <div className="error-message" style={{ marginLeft: '8px', marginTop: '4px', textAlign: 'left', width: '100%' }}>
                        {error}
                      </div>
                    )}
                    
                    {/* Forgot Password - Bottom left corner of input */}
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0475CC',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0,
                        marginTop: '8px',
                        fontSize: '14px',
                        fontFamily: 'Hanken Grotesk, sans-serif',
                        textAlign: 'left',
                        marginLeft: '8px',
                        width: 'auto',
                        display: 'block'
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
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
                  onClick={handleNext}
                  disabled={!password.trim()}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;

