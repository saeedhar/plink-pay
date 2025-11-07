import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardHeaderIcon from '../../../assets/topup/card.svg';
import visaCard from '../../../assets/topup/cards/visa.svg';
import masterCard from '../../../assets/topup/cards/master-card.svg';
import visaMada from '../../../assets/topup/cards/visa-mada.svg';
import selectedBadge from '../../../assets/topup/selected.svg';
import nonSelectedBadge from '../../../assets/topup/non-selected.svg';

const TopUpSelectExistingCard: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(0);

  const goBack = () => navigate('/services/topup/card/select-method');
  const handleContinue = () => navigate('/services/topup/card/cvv');

  const cards = [
    { id: 0, label: 'Visa', img: visaCard, last4: '2345' },
    { id: 1, label: 'Mastercard', img: masterCard, last4: '2345' },
    { id: 2, label: 'Visa Mada', img: visaMada, last4: '2345' },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Top Up</h1>

          <div className="wallet-management-card" style={{ maxWidth: 900 }}>
            <div className="wallet-header">
              <div className="wallet-header-icon">
                <img src={cardHeaderIcon} alt="Top Up" className="wallet-header-icon-img" />
              </div>
              <h2 className="wallet-header-title">Select Saved Card</h2>
            </div>
            <p className="wallet-section-description" style={{ marginTop: -8 }}>Select how you want to top up using a card.</p>

            <div style={{ marginTop: 16 }}>
              <h3 className="wallet-section-title" style={{ marginBottom: 12 }}>Cards</h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                overflowX: 'auto',
                overflowY: 'visible',
                paddingBottom: 12,
                borderBottom: '1px solid #E5E7EB',
                paddingTop: 20
              }}>
                <div
                  className="wallet-section no-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 200,
                    height: 120,
                    background: '#E6F4FB',
                    border: '2px solid #55CAF3',
                    borderRadius: 16,
                    cursor: 'pointer',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6)'
                  }}
                  onClick={() => navigate('/services/topup/card/select-method')}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      background: '#5C74A0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: 28,
                      lineHeight: '28px',
                      margin: '0 auto 10px'
                    }}>+
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#022466' }}>Add card</div>
                  </div>
                </div>

                {cards.map((c) => (
                  <div key={c.id} style={{ position: 'relative', overflow: 'visible' }}>
                    <img
                      onClick={() => setSelected(c.id)}
                      src={selected === c.id ? nonSelectedBadge : selectedBadge}
                      alt={selected === c.id ? 'Selected' : 'Not Selected'}
                      style={{
                        position: 'absolute',
                        top: -16,
                        left: 6,
                        width: 26,
                        height: 26,
                        zIndex: 5,
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    />

                    <button
                      onClick={() => setSelected(c.id)}
                      style={{
                        padding: 0,
                        borderRadius: 12,
                        background: 'transparent',
                        cursor: 'pointer',
                        overflow: 'visible'
                      }}
                    >
                      <img src={c.img} alt={c.label} style={{ width: 200, height: 120, display: 'block', borderRadius: 12 }} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button className="limits-button limits-button-secondary" onClick={goBack}>Back</button>
                <button className="limits-button limits-button-primary" onClick={handleContinue} disabled={selected === null}>Continue</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpSelectExistingCard;


