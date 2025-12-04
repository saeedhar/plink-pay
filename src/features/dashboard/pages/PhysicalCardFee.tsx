import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import physicalCardIcon from '../../../assets/card-service/physical-card.svg';
import '../../../styles/dashboard.css';

const PhysicalCardFee: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { cardType?: 'mada' | 'mastercard'; source?: string; reason?: string } | null;
  const isReplacement = state?.source === 'card-replacement';

  // Static fee values (to be replaced with API data later)
  const cardIssuanceFee = 25.00;
  const vatRate = 0.15;
  const vatAmount = cardIssuanceFee * vatRate;
  const total = cardIssuanceFee + vatAmount;

  const handleClose = () => {
    if (isReplacement) {
      navigate('/app/services/cards/report-replace/select-type', {
        state: { reason: state?.reason }
      });
    } else {
      navigate('/app/services/cards/request-physical');
    }
  };

  const handleConfirm = () => {
    // Navigate to delivery location screen with card type and fee info
    navigate('/app/services/cards/request-physical/delivery', {
      state: { 
        cardType: state?.cardType,
        fee: total,
        source: state?.source,
        reason: state?.reason
      }
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="physical-card-fee-screen">
            <div className="physical-card-fee-container">
              {/* Header with icon, title, and close button */}
              <div className="physical-card-fee-header">
                <div className="physical-card-fee-header-left">
                  <div className="physical-card-fee-icon">
                    <img src={physicalCardIcon} alt="Physical Card" />
                  </div>
                  <h2 className="physical-card-fee-title">Physical Card Fee</h2>
                </div>
                <button 
                  className="physical-card-fee-close-button"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Description */}
              <p className="physical-card-fee-description">
                Before we proceed with your card request, please review the issuance fee details below.
              </p>

              {/* Fee Table */}
              <div className="physical-card-fee-table">
                <div className="physical-card-fee-table-header">
                  <div className="physical-card-fee-table-header-cell">Description</div>
                  <div className="physical-card-fee-table-header-cell">Amount</div>
                </div>
                
                <div className="physical-card-fee-table-row">
                  <div className="physical-card-fee-table-cell">Card Issuance Fee</div>
                  <div className="physical-card-fee-table-cell">{cardIssuanceFee.toFixed(2)} SAR</div>
                </div>
                
                <div className="physical-card-fee-table-row">
                  <div className="physical-card-fee-table-cell">VAT (15%)</div>
                  <div className="physical-card-fee-table-cell">{vatAmount.toFixed(2)} SAR</div>
                </div>
                
                <div className="physical-card-fee-table-row physical-card-fee-table-row-total">
                  <div className="physical-card-fee-table-cell physical-card-fee-table-cell-total">Total</div>
                  <div className="physical-card-fee-table-cell physical-card-fee-table-cell-total">{total.toFixed(2)} SAR</div>
                </div>
              </div>

              {/* Confirm Button */}
              <button 
                className="physical-card-fee-confirm-button"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalCardFee;

