import React from 'react';
import WarningIcon from '../../assets/warning.svg';

interface AccountBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountBlockedModal({ isOpen, onClose }: AccountBlockedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <img src={WarningIcon} alt="Warning" className="w-16 h-16" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Account Blocked</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Your account has been blocked, please register again to continue using the app.
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-3/4 py-4 px-6 rounded-2xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
