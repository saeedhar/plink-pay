import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardHeaderIcon from '../../../assets/topup/card.svg';
import cardIcon from '../../../assets/topup/card-pos.svg';
import addCardIcon from '../../../assets/topup/add-card.svg';

const TopUpSelectMethod: React.FC = () => {
  const navigate = useNavigate();

  const goBack = () => navigate('/services/topup');

  const handleUseExisting = () => {
    navigate('/services/topup/card/select-existing');
  };

  const handleAddNew = () => {
    navigate('/services/topup/card/add');
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
              <h2 className="wallet-header-title">Select Payment Method</h2>
            </div>
            <p className="wallet-section-description" style={{ marginTop: -8 }}>Select how you want to top up using a card.</p>

            <div className="wallet-sections">
              <div className="wallet-section" onClick={handleUseExisting}>
                <div className="wallet-section-content">
                  <div className="wallet-section-icon">
                    <img src={cardIcon} alt="Use Existing" className="wallet-section-icon-img" />
                  </div>
                  <div className="wallet-section-info">
                    <h3 className="wallet-section-title">Use Existing Card</h3>
                    <p className="wallet-section-description">Select one of your saved cards to complete the payment.</p>
                  </div>
                </div>
                <div className="wallet-section-control">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                  </svg>
                </div>
              </div>

              <div className="wallet-section" onClick={handleAddNew}>
                <div className="wallet-section-content">
                  <div className="wallet-section-icon">
                    <img src={addCardIcon} alt="Add New Card" className="wallet-section-icon-img" />
                  </div>
                  <div className="wallet-section-info">
                    <h3 className="wallet-section-title">Add New Card</h3>
                    <p className="wallet-section-description">Add a new card to your account for future payments.</p>
                  </div>
                </div>
                <div className="wallet-section-control">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpSelectMethod;


