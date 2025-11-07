import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardHeaderIcon from '../../../assets/topup/card.svg';

const TopUpEnterCVV: React.FC = () => {
  const navigate = useNavigate();
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');

  const onBack = () => navigate('/services/topup/card/select-existing');
  const onContinue = () => {
    if (!/^\d{3,4}$/.test(cvv)) {
      setError('Please enter a valid 3 or 4 digit CVV');
      return;
    }
    // Next step placeholder (e.g., OTP)
    navigate('/services/topup/card');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Top Up</h1>

          <div className="wallet-management-card" style={{ maxWidth: 640 }}>
            <div className="wallet-header">
              <div className="wallet-header-icon">
                <img src={cardHeaderIcon} alt="Top Up" className="wallet-header-icon-img" />
              </div>
              <h2 className="wallet-header-title">Enter your card CVV</h2>
            </div>
            <p className="wallet-section-description" style={{ marginTop: -8 }}>Please enter the CVV of your card to proceed with the top-up.</p>

            <div style={{
              marginTop: 16,
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
            }}>
              <div className="form-section" style={{ gap: 8 }}>
                <label className="form-label" style={{ marginLeft: 0 }}>CVV</label>
                <input
                  value={cvv}
                  onChange={(e) => { setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0,4)); setError(''); }}
                  placeholder="CVV (e.g. 123)"
                  className="limit-input"
                  style={{
                    maxWidth: 420,
                    height: 48,
                    borderRadius: 12,
                    fontSize: 16
                  }}
                />
                {error && <div className="limit-error" style={{ alignSelf: 'flex-start' }}>{error}</div>}
                <div className="wallet-section-description" style={{ marginTop: 8 }}>The CVV is the 3-digit code on the back of your card.</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 28 }}>
                <button className="limits-button limits-button-secondary" onClick={onBack}>Back</button>
                <button className="limits-button limits-button-primary" onClick={onContinue}>Continue</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpEnterCVV;


