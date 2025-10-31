import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import PasswordIcon from '../../../assets/password.svg';

const SetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

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

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character (!@#$...)');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: undefined }));
    }
    
    // Clear confirm password error if passwords match
    if (value && confirmPassword && value === confirmPassword && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
    
    // Validate match
    if (value && newPassword && value !== newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (value && newPassword && value === newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleClose = () => {
    navigate('/app/account-settings');
  };

  const handleNext = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = 'Password does not meet requirements';
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Prepare password data to pass to OTP screen
    const passwordData = {
      newPassword,
      confirmPassword,
      currentPassword: location.state?.currentPassword
    };
    
    // Navigate to OTP screen
    navigate('/app/account-settings/password/otp', {
      state: { passwordData }
    });
  };

  const passwordValidation = validatePassword(newPassword);

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
                <div className="email-add-section" style={{ marginBottom: '24px' }}>
                  <div className="email-add-icon" style={{ marginBottom: '16px' }}>
                    <img src={PasswordIcon} alt="Password" style={{ width: '50px', height: '50px' }} />
                  </div>
                  
                  <h3 className="email-add-title">Set your password</h3>
                  <p className="email-add-description">Please Set your password to continue.</p>
                </div>

                {/* Form Section */}
                <div className="form-section" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', marginBottom: '0' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                    {/* Password New */}
                    <div style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ marginLeft: '8px', textAlign: 'left', display: 'block', marginBottom: '8px' }}>Password New</label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={handleNewPasswordChange}
                          placeholder="Create Your Password"
                          className={`email-input ${errors.newPassword ? 'email-input-error' : ''}`}
                          style={{ 
                            paddingRight: '48px',
                            paddingLeft: '16px',
                            width: '100%'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
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
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? (
                            <IoEyeOffOutline size={20} color="#98A2B3" />
                          ) : (
                            <IoEyeOutline size={20} color="#98A2B3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Confirm */}
                    <div style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ marginLeft: '8px', textAlign: 'left', display: 'block', marginBottom: '8px' }}>Password Confirm</label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          placeholder="Confirm Your Password"
                          className={`email-input ${errors.confirmPassword ? 'email-input-error' : ''}`}
                          style={{ 
                            paddingRight: '48px',
                            paddingLeft: '16px',
                            width: '100%'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? (
                            <IoEyeOffOutline size={20} color="#98A2B3" />
                          ) : (
                            <IoEyeOutline size={20} color="#98A2B3" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="error-message" style={{ marginLeft: '8px', textAlign: 'left' }}>
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto'}}>
                    <p style={{ 
                      fontFamily: 'Hanken Grotesk', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#374151',
                      textAlign: 'left',
                      marginLeft: '8px'
                    }}>
                      Your password should contain at least:
                    </p>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: 0,
                      marginLeft: '8px',
                      textAlign: 'left'
                    }}>
                      <li style={{ 
                        fontFamily: 'Hanken Grotesk', 
                        fontSize: '14px', 
                        color: passwordValidation.errors.includes('8 characters') ? '#6B7280' : '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '12px' }}>•</span>
                        8 characters
                      </li>
                      <li style={{ 
                        fontFamily: 'Hanken Grotesk', 
                        fontSize: '14px', 
                        color: passwordValidation.errors.includes('One uppercase letter') ? '#6B7280' : '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '12px' }}>•</span>
                        One uppercase letter
                      </li>
                      <li style={{ 
                        fontFamily: 'Hanken Grotesk', 
                        fontSize: '14px', 
                        color: passwordValidation.errors.includes('One lowercase letter') ? '#6B7280' : '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '12px' }}>•</span>
                        One lowercase letter
                      </li>
                      <li style={{ 
                        fontFamily: 'Hanken Grotesk', 
                        fontSize: '14px', 
                        color: passwordValidation.errors.includes('One number') ? '#6B7280' : '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '12px' }}>•</span>
                        One number
                      </li>
                      <li style={{ 
                        fontFamily: 'Hanken Grotesk', 
                        fontSize: '14px', 
                        color: passwordValidation.errors.includes('One special character (!@#$...)') ? '#6B7280' : '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '12px' }}>•</span>
                        One special character (!@#$...)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer" style={{ marginTop: '2px' }}>
                <button 
                  className="btn-secondary"
                  onClick={handleClose}
                >
                  Close
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={!newPassword || !confirmPassword || !passwordValidation.isValid || newPassword !== confirmPassword}
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

export default SetPassword;

