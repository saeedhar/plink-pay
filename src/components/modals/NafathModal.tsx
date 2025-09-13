import React from 'react';
import { AlertModal } from '../ui/Modal';
import { useNafathModal } from '../../hooks/useNafathModal';

export function NafathModal() {
  const {
    isOpen,
    currentStatus,
    timeRemaining,
    isInitializing,
    handleGoToNafath,
    handleResend,
    handleClose,
    handleDone
  } = useNafathModal();

  if (!isOpen) return null;

  // Redirection Modal
  if (currentStatus === 'REDIRECTION') {
    return (
      <AlertModal
        isOpen={true}
        onClose={() => {}} // No close for this modal
        title="Nafath Redirection"
        message=""
        buttonLabel=""
        variant="primary"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#2E248F] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">77</span>
          </div>
          <h3 className="text-2xl font-bold text-[#CE2E81] mb-4">Nafath Redirection</h3>
          <p className="text-gray-600 mb-4">
            Go to Nafath portal to verify your registration
          </p>
          {timeRemaining && (
            <p className="text-[#CE2E81] font-medium mb-6">
              Code will expire in {timeRemaining}
            </p>
          )}
          <button
            onClick={handleGoToNafath}
            disabled={isInitializing}
            className="bg-[#2E248F] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1a1a5a] transition-colors"
          >
            {isInitializing ? 'Initializing...' : 'Go to Nafath'}
          </button>
        </div>
      </AlertModal>
    );
  }

  // Request Sent Modal
  if (currentStatus === 'SENT') {
    return (
      <AlertModal
        isOpen={true}
        onClose={() => {}} // No close for this modal
        title="نفاذ"
        message=""
        buttonLabel=""
        variant="primary"
      >
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-[#00B4A6] mb-4">نفاذ</h3>
          <div className="w-12 h-12 border-4 border-[#2E248F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mb-6">Request sent to Nafath</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDone}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium cursor-not-allowed"
              disabled
            >
              Done
            </button>
            <button
              onClick={handleDone}
              className="bg-[#2E248F] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1a1a5a] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </AlertModal>
    );
  }

  // Request Under Review Modal
  if (currentStatus === 'UNDER_REVIEW') {
    return (
      <AlertModal
        isOpen={true}
        onClose={handleClose}
        title="Request Under Review"
        message="Your request has been received and is under review for compliance. We'll notify you once the process is complete."
        buttonLabel="Done"
        variant="info"
        icon={
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  // Request Received Modal
  if (currentStatus === 'RECEIVED') {
    return (
      <AlertModal
        isOpen={true}
        onClose={handleDone}
        title="Request Received"
        message="Thank you! Your request has been successfully submitted and is currently under compliance review. You will be notified through alerts once the process is complete."
        buttonLabel="Done"
        variant="success"
        icon={
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  // Request Failed Modal
  if (currentStatus === 'FAILED') {
    return (
      <AlertModal
        isOpen={true}
        onClose={handleClose}
        title="Request Failed"
        message="Your Nafath request was declined by you. Please restart the process if this was a mistake."
        buttonLabel="Done"
        variant="danger"
        icon={
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      >
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            className="bg-[#CE2E81] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#a8246a] transition-colors"
          >
            Resend Code via Nafath
          </button>
        </div>
      </AlertModal>
    );
  }

  // Request Rejected Modal
  if (currentStatus === 'REJECTED') {
    return (
      <AlertModal
        isOpen={true}
        onClose={handleClose}
        title="Request Rejected"
        message="We're unable to process your request right now. Please try again later."
        buttonLabel="Done"
        variant="danger"
        icon={
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
    );
  }

  return null;
}
