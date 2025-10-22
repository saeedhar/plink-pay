import React, { useState } from 'react';
import { Button } from '../ui/Button';
import subWalletIcon from '../../assets/wallet-managment/sub-wallet.svg';

interface CreateSubWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (walletName: string) => void;
}

const CreateSubWalletModal: React.FC<CreateSubWalletModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletName.trim()) {
      setError('Sub-wallet name is required');
      return;
    }

    if (walletName.trim().length < 3) {
      setError('Sub-wallet name must be at least 3 characters');
      return;
    }

    onConfirm(walletName.trim());
    setWalletName('');
    setError('');
  };

  const handleClose = () => {
    setWalletName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="create-subwallet-modal">
          <div className="create-subwallet-header">
            <div className="create-subwallet-header-icon">
              <img src={subWalletIcon} alt="Create Sub-Wallet" className="create-subwallet-header-icon-img" />
            </div>
            <h2 className="create-subwallet-header-title">Create Sub-Wallet</h2>
          </div>

          <div className="create-subwallet-content">
            <h3 className="create-subwallet-title">Create Sub-Wallets</h3>
            <p className="create-subwallet-description">
              Create a new sub-wallet to organize your money and manage your expenses more effectively.
            </p>

            <form onSubmit={handleSubmit} className="create-subwallet-form">
              <label className="create-subwallet-label">Sub-Wallet Name</label>
              <input
                type="text"
                placeholder="Enter Sub-Wallet Name"
                value={walletName}
                onChange={(e) => {
                  setWalletName(e.target.value);
                  if (error) setError('');
                }}
                className={`create-subwallet-input ${error ? 'error' : ''}`}
                autoFocus
              />
              {error && (
                <span className="create-subwallet-error">{error}</span>
              )}
            </form>
          </div>

          <div className="create-subwallet-actions">
            <Button
              onClick={handleClose}
              className="create-subwallet-button create-subwallet-button-secondary"
            >
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              className="create-subwallet-button create-subwallet-button-primary"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubWalletModal;
