import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../components';
import cardDetailsIcon from '../../../assets/topup/card.svg';
import visaLogo from '../../../assets/topup/cards/visa-logo.svg';
import mastercardLogo from '../../../assets/topup/cards/mastercard-logo.svg';

const formatCardNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned
    .match(/.{1,4}/g)
    ?.join(' ')
    .trim() || '';
};

const detectCardBrand = (number: string) => {
  const digits = number.replace(/\s/g, '');
  if (digits.length < 4) {
    return null;
  }

  const firstTwo = parseInt(digits.slice(0, 2), 10);
  const firstSix = parseInt(digits.slice(0, 6), 10);

  if (digits.startsWith('4')) {
    return 'visa';
  }

  // Mastercard BIN ranges: 51-55, 2221-2720
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstSix >= 222100 && firstSix <= 272099)) {
    return 'mastercard';
  }

  return null;
};

const isExpiryValid = (value: string) => {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);

  if (month < 1 || month > 12) return false;

  const current = new Date();
  const currentMonth = current.getMonth() + 1;
  const currentYear = current.getFullYear() % 100;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

const TopUpAddNewCard: React.FC = () => {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  const digitsOnlyCardNumber = cardNumber.replace(/\s/g, '');
  const isCardNumberValid = digitsOnlyCardNumber.length === 16 && !!cardBrand;
  const isCvvValid = cvv.length >= 3 && cvv.length <= 4;
  const isExpiryDateValid = isExpiryValid(expiry);

  const isContinueDisabled = !(isCardNumberValid && isCvvValid && isExpiryDateValid);

  const handleContinue = () => {
    if (!isContinueDisabled) {
      const now = new Date();
      const timestamp = now
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        .replace(',', ' at');

      navigate('/services/topup/card/3d-secure', {
        state: {
          fromAddCard: true,
          cardType: cardBrand === 'visa' ? 'Visa' : cardBrand === 'mastercard' ? 'Mastercard' : 'Card',
          last4: digitsOnlyCardNumber.slice(-4) || '0000',
          amount: '500',
          timestamp
        }
      });
    }
  };

  const handleClose = () => {
    navigate('/services/topup/card/select-method');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-content">
          <h1 className="dashboard-title">Top Up</h1>

          <div
            style={{
              maxWidth: 620,
              margin: '0 auto 0 0',
              padding: 24,
              borderRadius: 20,
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: '32px 36px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                border: '1px solid rgba(2, 36, 102, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src={cardDetailsIcon} alt="Card" style={{ width: 40, height: 40 }} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1F2937' }}>Enter Card Details</h2>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: '1px solid rgba(15, 23, 42, 0.1)',
                  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                  padding: '26px 28px',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 60%, #FFFFFF 100%)'
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 15, fontWeight: 600, color: '#111827' }}>
                    Card Number
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1.5px solid #CBD5F5',
                      borderRadius: 16,
                      padding: '12px 14px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: 'inset 0 0 0 1px rgba(2, 36, 102, 0.05)'
                    }}
                  >
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: 16,
                        color: '#111827',
                        letterSpacing: '0.6px'
                      }}
                    />
                    {cardBrand === 'visa' && (
                      <img src={visaLogo} alt="Visa" style={{ width: 42, height: 16 }} />
                    )}
                    {cardBrand === 'mastercard' && (
                      <img src={mastercardLogo} alt="Mastercard" style={{ width: 40, height: 24 }} />
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 15, fontWeight: 600, color: '#111827' }}>CVV</label>
                    <input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="CVV (e.g. 123)"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5F5',
                        backgroundColor: '#FFFFFF',
                        fontSize: 15,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                    />
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
                      The CVV is the 3-digit code on the back of your card.
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 15, fontWeight: 600, color: '#111827' }}>Expiry Date</label>
                    <input
                      value={expiry}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                        if (cleaned.length <= 2) {
                          setExpiry(cleaned);
                        } else {
                          setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
                        }
                      }}
                      placeholder="MM / YY"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5F5',
                        backgroundColor: '#FFFFFF',
                        fontSize: 15,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: '1px solid rgba(2, 36, 102, 0.08)',
                    backgroundColor: '#F8FBFF',
                    marginBottom: 24,
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      position: 'relative',
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: saveCard ? '2px solid #011B4E' : '2px solid #CBD5F5',
                      background: saveCard ? '#011B4E' : '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    {saveCard && (
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11 1L4.33333 7.66667L1 4.33333"
                          stroke="#FFFFFF"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>Save this card for future top-ups.</p>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>Your card will be securely saved with our payment gateway.</p>
                  </div>
                </label>

                <div style={{ display: 'flex', gap: 14 }}>
                  <button
                    onClick={handleClose}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 12,
                      border: '1.5px solid #011B4E',
                      backgroundColor: '#FFFFFF',
                      color: '#011B4E',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={isContinueDisabled}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 12,
                      border: 'none',
                      backgroundColor: isContinueDisabled ? '#C7D2FE' : '#011B4E',
                      color: isContinueDisabled ? '#FFFFFF' : '#FFFFFF',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: isContinueDisabled ? 'not-allowed' : 'pointer',
                      boxShadow: isContinueDisabled ? 'none' : '0 8px 16px rgba(1, 27, 78, 0.2)'
                    }}
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
  );
};

export default TopUpAddNewCard;
