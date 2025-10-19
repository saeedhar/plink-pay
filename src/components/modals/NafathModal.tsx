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
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl relative">
          {/* Close Button */}
          <button
            onClick={() => {}}
            className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center space-y-6">
            {/* Circular Badge with Number */}
            <div className="w-20 h-20 bg-[#023B67] rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-3xl font-bold">77</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-[#00BDFF]">
              Nafath Redirection
            </h2>

            {/* Instruction Text */}
            <p className="text-gray-600 text-base">
              Go to Nafath portal to verify your registration
            </p>

            {/* Timer */}
            {timeRemaining && (
              <p className="text-[#00BDFF] text-base font-medium">
                Code will Expired in {timeRemaining}
              </p>
            )}

            {/* Button */}
            <button
              onClick={handleGoToNafath}
              disabled={isInitializing}
              className="w-full bg-[#023B67] text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-[#023B67]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInitializing ? 'Initializing...' : 'Go to Nafath'}
            </button>
          </div>
        </div>
      </div>
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
          <div className="flex justify-center">
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
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl relative">
          {/* Close Button */}
          <button
            onClick={handleDone}
            className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center space-y-6">
            {/* Review Icon */}
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800">
              Request Under Review
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed">
              Your request has been received and is under review for compliance. We'll notify you once the process is complete.
            </p>

            {/* Done Button */}
            <button
              onClick={handleDone}
              className="w-full bg-[#023B67] text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-[#023B67]/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Request Successfully Submitted Modal
  if (currentStatus === 'RECEIVED') {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl relative">
          {/* Close Button */}
          <button
            onClick={handleDone}
            className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800">
              Request Successfully Submitted
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed">
              Thank you! Your request has been successfully submitted and is currently under compliance review. You will be notified through alerts once the process is complete.
            </p>

            {/* Done Button */}
            <button
              onClick={handleDone}
              className="w-full bg-[#023B67] text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-[#023B67]/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
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
