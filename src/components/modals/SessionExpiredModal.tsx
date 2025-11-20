import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertModal } from '../ui/Modal';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    // Clear all tokens and user data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('callbackId');
    localStorage.removeItem('deviceId');
    sessionStorage.removeItem('lastAuthenticatedRoute');
    
    // Close modal
    onClose();
    
    // Navigate to login page using window.location to ensure full reload
    window.location.href = '/login';
  };

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={handleConfirm}
      onConfirm={handleConfirm}
      title="Session Expired"
      message="Your session has expired. Please login again."
      buttonLabel="OK"
      variant="info"
      persistent={true}
      icon={
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      }
    />
  );
}

// Global event listener for session expired
let sessionExpiredCallback: (() => void) | null = null;

export function setSessionExpiredHandler(callback: () => void) {
  sessionExpiredCallback = callback;
}

export function triggerSessionExpired() {
  if (sessionExpiredCallback) {
    sessionExpiredCallback();
  }
}

