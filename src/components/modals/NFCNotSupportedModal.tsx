import React from 'react';
import warningIcon from '../../assets/warning.svg';

interface NFCNotSupportedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToManual: () => void;
}

export default function NFCNotSupportedModal({
  isOpen,
  onClose,
  onContinueToManual
}: NFCNotSupportedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <img src={warningIcon} alt="Warning" className="w-20 h-20" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          NFC Not Supported
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          Your device does not support NFC. Please proceed with Manual Activation.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* Continue to Manual Activation Button */}
          <button
            onClick={onContinueToManual}
            className="w-full py-3 px-6 rounded-xl bg-[#022466] text-white font-medium hover:bg-[#011a4d] transition-colors"
          >
            Continue to Manual Activation
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl border-2 border-[#022466] text-[#022466] bg-white font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

