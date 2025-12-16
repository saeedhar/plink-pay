import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import replaceIcon from '../../../assets/card-service/replace.svg';
import '../../../styles/card-management.css';

type ReportReason = 'lost' | 'stolen' | 'fraud' | 'damaged' | 'other';

const ReportReplaceCard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    originalCardType?: 'mada' | 'mastercard'; 
    action?: 'replace' | 'stop';
    cardId?: string;
  } | null;
  const action = state?.action || 'replace';
  const [selectedReason, setSelectedReason] = useState<ReportReason>();
  const [otherReason, setOtherReason] = useState('');

  const handleBack = () => {
    navigate('/app/services/cards');
  };

  const handleContinue = () => {
    const reason = selectedReason === 'other' ? otherReason : selectedReason;
    if (selectedReason === 'other' && !otherReason.trim()) {
      // TODO: Show error message
      return;
    }
    
    if (action === 'stop') {
      // For stop card, navigate directly to OTP
      navigate('/app/services/cards/stop-card/otp', { 
        state: { 
          reason,
          originalCardType: state?.originalCardType,
          action,
          cardId: state?.cardId
        } 
      });
    } else {
      // For replace, navigate to select card type screen
      navigate('/app/services/cards/report-replace/select-type', { 
        state: { 
          reason,
          originalCardType: state?.originalCardType,
          action,
          cardId: state?.cardId
        } 
      });
    }
  };

  const isContinueDisabled = selectedReason === 'other' && !otherReason.trim();

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Cards</h1>
          
          <div className="report-replace-card-screen">
            <div className="report-replace-card-container">
              {/* Header */}
              <div className="report-replace-card-header">
                <div className="report-replace-card-icon">
                  <img src={replaceIcon} alt={action === 'stop' ? 'Stop' : 'Replace'} />
                </div>
                <h3 className="report-replace-card-subtitle">Select Reason</h3>
                <p className="report-replace-card-description">
                  {action === 'stop' 
                    ? 'Please select the reason for stopping your card.'
                    : 'Please select the reason for reporting or requesting a replacement card.'}
                </p>
              </div>

              {/* Reason Options */}
              <div className="report-replace-card-options">
                <label className="report-replace-card-option">
                  <input
                    type="radio"
                    name="reason"
                    value="lost"
                    checked={selectedReason === 'lost'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                  />
                  <span className="report-replace-card-option-label">Lost</span>
                </label>

                <label className="report-replace-card-option">
                  <input
                    type="radio"
                    name="reason"
                    value="stolen"
                    checked={selectedReason === 'stolen'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                  />
                  <span className="report-replace-card-option-label">Stolen</span>
                </label>

                <label className="report-replace-card-option">
                  <input
                    type="radio"
                    name="reason"
                    value="fraud"
                    checked={selectedReason === 'fraud'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                  />
                  <span className="report-replace-card-option-label">Fraud</span>
                </label>

                <label className="report-replace-card-option">
                  <input
                    type="radio"
                    name="reason"
                    value="damaged"
                    checked={selectedReason === 'damaged'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                  />
                  <span className="report-replace-card-option-label">Damaged</span>
                </label>

                <label className="report-replace-card-option">
                  <input
                    type="radio"
                    name="reason"
                    value="other"
                    checked={selectedReason === 'other'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                  />
                  <span className="report-replace-card-option-label">Other</span>
                </label>

                {/* Other Reason Input */}
                {selectedReason === 'other' && (
                  <div className="report-replace-card-other-reason">
                    <label className="report-replace-card-other-label">Other Reason</label>
                    <input
                      type="text"
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      placeholder="Please Enter Other Reason ....."
                      className="report-replace-card-other-input"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="report-replace-card-actions">
                <button 
                  className="report-replace-card-back-button"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="report-replace-card-continue-button"
                  onClick={handleContinue}
                  disabled={isContinueDisabled}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportReplaceCard;

