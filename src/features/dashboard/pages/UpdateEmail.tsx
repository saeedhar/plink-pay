import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import { IoMailOutline } from 'react-icons/io5';
import EmailIcon from '../../../assets/Profile/Email.svg';
import { UserManagementService } from '../../../services/userManagementService';
import { getCurrentUser } from '../../../services/realBackendAPI';

const UpdateEmail: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingEmail, setHasExistingEmail] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

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

  // Fetch user profile to check if they have an email
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const user = await getCurrentUser();
        if (user.email) {
          setHasExistingEmail(true);
          setEmail(user.email);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'Email is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleClose = () => {
    navigate('/app/account-settings');
  };

  const handleNext = async () => {
    const validationError = validateEmail(email);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Call API to initiate email update
      const response = await UserManagementService.initiateEmailUpdate({
        email
      });
      
      // Navigate to OTP verification page with sessionId
      navigate('/app/account-settings/email/otp', {
        state: { 
          email,
          sessionId: response.sessionId,
          otpCode: response.otpCode // For testing/display
        }
      });
    } catch (error: any) {
      console.error('Failed to initiate email update:', error);
      setError(error.message || 'Failed to initiate email update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                  <IoMailOutline size={24} color="#022466" />
                </div>
                <h2 className="modal-title">Email Management</h2>
              </div>

              {/* Content */}
              <div className="modal-content">
                <div className="email-add-section">
                  <div className="email-add-icon">
                    <img src={EmailIcon} alt="Email" style={{ width: '50px', height: '50px' }} />
                  </div>
                  
                  <h3 className="email-add-title">
                    {hasExistingEmail ? 'Update Email Address' : 'Add Email'}
                  </h3>
                  <p className="email-add-description">
                    {hasExistingEmail 
                      ? 'Update your email address to receive alerts and notifications'
                      : 'You have not added an email yet'
                    }
                  </p>
                </div>

                <div className="form-section">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    className={`email-input ${error ? 'email-input-error' : ''}`}
                  />
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                  
                  {!hasExistingEmail && (
                    <p className="email-help-text">
                      Please add your email to receive alerts and notifications
                    </p>
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
                  onClick={handleNext}
                  disabled={isSubmitting || !email.trim()}
                >
                  {isSubmitting ? 'Processing...' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateEmail;
