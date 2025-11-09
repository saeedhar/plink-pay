import React, { useState } from 'react';
import { Sidebar, Header } from '../components';
import ibanIcon from '../../../assets/topup/virtualiban2.svg';
import QRCode from 'react-qr-code';

const VIRTUAL_IBAN = 'SA12 34567890 1234 5678 90';

const TopUpVirtualIBAN: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(VIRTUAL_IBAN.replace(/\s+/g, ''));
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = VIRTUAL_IBAN.replace(/\s+/g, '');
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopyError('');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy IBAN', error);
      setCopied(false);
      setCopyError('Unable to copy. Please copy manually.');
    }
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
              borderRadius: 24,
              padding: 32,
              maxWidth: 760,
              margin: '0 auto 0 0'
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: '40px 48px',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <img src={ibanIcon} alt="Virtual IBAN" style={{ width: 35, height: 35 }} />
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
                Top Up via Virtual IBAN
              </h2>
              <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.6 }}>
                Transfer funds directly from your bank account to your Tayseer Wallet using your unique Virtual IBAN.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: '1px solid #E5E7EB',
                  marginBottom: 16,
                  maxWidth: 420,
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 600, color: '#1F2937', letterSpacing: 1 }}>
                  {VIRTUAL_IBAN}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                  aria-label="Copy Virtual IBAN"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H9"
                      stroke="#1F2937"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect x="9" y="7" width="12" height="14" rx="2" stroke="#1F2937" strokeWidth="1.8" />
                  </svg>
                </button>
              </div>

              {copied && (
                <div style={{ color: '#047857', fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
                  IBAN copied to clipboard
                </div>
              )}
              {copyError && (
                <div style={{ color: '#B91C1C', fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
                  {copyError}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 24
                }}
              >
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: 16,
                    borderRadius: 20,
                    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <QRCode
                    value={VIRTUAL_IBAN.replace(/\s+/g, '')}
                    size={168}
                    fgColor="#0F172A"
                    bgColor="#FFFFFF"
                    style={{ display: 'block', height: 'auto', width: '168px' }}
                  />
                </div>
              </div>

              <p style={{ fontSize: 14, color: '#4B5563' }}>
                Make sure the transfer is sent from an account registered under your name.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpVirtualIBAN;
