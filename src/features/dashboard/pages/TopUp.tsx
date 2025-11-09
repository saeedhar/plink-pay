import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import topupIcon from '../../../assets/topup/topup.svg';
import cardIcon from '../../../assets/topup/card-pos.svg';
import appleIcon from '../../../assets/topup/apple-pay.svg';
import ibanIcon from '../../../assets/topup/iban1.svg';

const TopUp: React.FC = () => {
  const navigate = useNavigate();
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
                <img src={topupIcon} alt="Top Up" className="wallet-header-icon-img" />
              </div>
              <h2 className="wallet-header-title">Top Up Your Wallet</h2>
            </div>

            <div className="wallet-sections">
              <div className="wallet-section" onClick={() => navigate('/services/topup/card')}>
                <div className="wallet-section-content">
                  <div className="wallet-section-icon">
                    <img src={cardIcon} alt="Card Top Up" className="wallet-section-icon-img" />
                  </div>
                  <div className="wallet-section-info">
                    <h3 className="wallet-section-title">Card Top Up</h3>
                    <p className="wallet-section-description">Card Top-Up adds wallet funds via secure cards.</p>
                  </div>
                </div>
                <div className="wallet-section-control">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                  </svg>
                </div>
              </div>

              <div className="wallet-section">
                <div className="wallet-section-content">
                  <div className="wallet-section-icon">
                    <img src={appleIcon} alt="Apple Pay Top Up" className="wallet-section-icon-img" />
                  </div>
                  <div className="wallet-section-info">
                    <h3 className="wallet-section-title">Apple Pay Top Up</h3>
                    <p className="wallet-section-description">Apple Pay Top-Up adds wallet funds instantly and securely.</p>
                  </div>
                </div>
                <div className="wallet-section-control">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="#1F2937"/>
                  </svg>
                </div>
              </div>

              <div className="wallet-section" onClick={() => navigate('/services/topup/virtual-iban')}>
                <div className="wallet-section-content">
                  <div className="wallet-section-icon">
                    <img src={ibanIcon} alt="Virtual IBAN Top Up" className="wallet-section-icon-img" />
                  </div>
                  <div className="wallet-section-info">
                    <h3 className="wallet-section-title">Virtual IBAN Top Up</h3>
                    <p className="wallet-section-description">Virtual IBAN Top-Up adds wallet funds safely via IBAN.</p>
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

export default TopUp;


