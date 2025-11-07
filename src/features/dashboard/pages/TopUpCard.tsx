import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardHeaderIcon from '../../../assets/topup/card.svg';

const TopUpCard: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const currentLimit = '2,000 SAR';

  const handleContinue = () => {
    navigate('/services/topup/card/select-method');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Top Up</h1>

          <div className="wallet-management-card">
            <div className="wallet-header">
              <div className="wallet-header-icon">
                <img src={cardHeaderIcon} alt="Top Up" className="wallet-header-icon-img" />
              </div>
              <h2 className="wallet-header-title">Top Up with Card</h2>
            </div>
            <p className="wallet-section-description" style={{ marginTop: -8 }}>Enter the amount you want to add.</p>

            <div className="wallet-sections">
              <div className="wallet-section no-hover" style={{ cursor: 'default' }}>
                <div className="wallet-section-content" style={{ width: '100%' }}>
                  <div className="wallet-section-info" style={{ width: '100%' }}>
                    <div style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 12,
                      padding: 16,
                      background: '#FFFFFF'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <div className="wallet-section-title" style={{ marginBottom: 8 }}>Current Limit</div>
                          <div style={{ color: '#6B7280', fontSize: 14 }}>{currentLimit}</div>
                        </div>
                        <div>
                          <div className="wallet-section-title" style={{ marginBottom: 8, marginLeft: 8 }}>Amount</div>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter limit amount"
                            onFocus={() => setAmountFocused(true)}
                            onBlur={() => setAmountFocused(false)}
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              borderRadius: 14,
                              border: amountFocused ? '1.5px solid #022466' : '1px solid #E5E7EB',
                              outline: 'none',
                              boxShadow: amountFocused ? '0 0 0 3px rgba(2,36,102,0.1)' : 'none'
                            }}
                          />
                          <div style={{ marginTop: 8, color: '#6B7280', fontSize: 14, marginLeft: 8 }}>Allowed range: 0 - 100,000 SAR</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                        style={{ flex: 1 }}
                      >
                        Back
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleContinue}
                        style={{ flex: 1 }}
                      >
                        Continue
                      </button>
                    </div>
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

export default TopUpCard;


