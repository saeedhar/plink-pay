/**
 * Security Hook - Integrates all security features
 * Implements BRD requirements for session management, MFA, and rate limiting
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { securityService, type SessionInfo } from '../services/securityService';
import { mfaService, type MFAStatus } from '../services/mfaService';

export interface SecurityState {
  session: SessionInfo | null;
  isSessionActive: boolean;
  timeUntilExpiry: number;
  timeUntilWarning: number;
  shouldShowWarning: boolean;
  mfaStatus: MFAStatus | null;
  isOnSensitivePage: boolean;
}

export interface SecurityActions {
  startSession: (userId?: string) => void;
  updateActivity: () => void;
  extendSession: () => void;
  endSession: () => void;
  checkLockout: (type: string, identifier: string) => boolean;
  recordFailure: (type: string, identifier: string) => void;
  clearFailures: (type: string, identifier: string) => void;
  getFailureCount: (type: string, identifier: string) => number;
  getRemainingLockoutTime: (type: string, identifier: string) => number;
}

export function useSecurity() {
  const [securityState, setSecurityState] = useState<SecurityState>({
    session: null,
    isSessionActive: false,
    timeUntilExpiry: 0,
    timeUntilWarning: 0,
    shouldShowWarning: false,
    mfaStatus: null,
    isOnSensitivePage: false
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Update security state periodically
  useEffect(() => {
    const updateState = () => {
      const session = securityService.getSessionInfo();
      const timeUntilExpiry = securityService.getTimeUntilExpiry();
      const timeUntilWarning = securityService.getTimeUntilWarning();
      const shouldShowWarning = securityService.shouldShowWarning();
      const isOnSensitivePage = securityService.isSensitivePage(location.pathname);

      setSecurityState(prev => ({
        ...prev,
        session,
        isSessionActive: session?.isActive || false,
        timeUntilExpiry,
        timeUntilWarning,
        shouldShowWarning,
        isOnSensitivePage
      }));
    };

    // Update immediately
    updateState();

    // Update every second for accurate timers
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  // Setup security service callbacks
  useEffect(() => {
    securityService.onSessionWarning(() => {
      console.log('Session warning triggered');
      // Warning state will be picked up by the periodic update
    });

    securityService.onSessionTimeout(() => {
      console.log('Session timeout - logging out');
      navigate('/', { replace: true });
      // Could also clear any sensitive data here
    });

    return () => {
      securityService.cleanup();
    };
  }, [navigate]);

  // Update activity on user interactions (only on sensitive pages)
  useEffect(() => {
    if (!securityState.isOnSensitivePage) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      securityService.updateActivity();
    };

    // Throttle activity updates to avoid excessive calls
    let lastUpdate = 0;
    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastUpdate > 5000) { // Update at most every 5 seconds
        lastUpdate = now;
        handleActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, throttledHandler, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandler);
      });
    };
  }, [securityState.isOnSensitivePage]);

  // Load MFA status when session starts
  useEffect(() => {
    const loadMFAStatus = async () => {
      if (securityState.session?.userId) {
        try {
          const mfaStatus = await mfaService.getMFAStatus(securityState.session.userId);
          setSecurityState(prev => ({ ...prev, mfaStatus }));
        } catch (error) {
          console.error('Failed to load MFA status:', error);
        }
      }
    };

    loadMFAStatus();
  }, [securityState.session?.userId]);

  // Security actions
  const startSession = useCallback((userId?: string) => {
    securityService.startSession(userId);
  }, []);

  const updateActivity = useCallback(() => {
    securityService.updateActivity();
  }, []);

  const extendSession = useCallback(() => {
    securityService.extendSession();
    securityService.markWarningShown();
  }, []);

  const endSession = useCallback(() => {
    securityService.endSession();
    navigate('/', { replace: true });
  }, [navigate]);

  const checkLockout = useCallback((type: string, identifier: string): boolean => {
    return securityService.isLockedOut(type, identifier);
  }, []);

  const recordFailure = useCallback((type: string, identifier: string) => {
    securityService.recordFailureAttempt(type as any, identifier);
  }, []);

  const clearFailures = useCallback((type: string, identifier: string) => {
    securityService.clearFailureAttempts(type, identifier);
  }, []);

  const getFailureCount = useCallback((type: string, identifier: string): number => {
    return securityService.getFailureAttemptCount(type, identifier);
  }, []);

  const getRemainingLockoutTime = useCallback((type: string, identifier: string): number => {
    return securityService.getRemainingLockoutTime(type, identifier);
  }, []);

  const actions: SecurityActions = {
    startSession,
    updateActivity,
    extendSession,
    endSession,
    checkLockout,
    recordFailure,
    clearFailures,
    getFailureCount,
    getRemainingLockoutTime
  };

  return {
    ...securityState,
    ...actions,
    
    // Computed values
    isSessionExpired: securityService.isSessionExpired(),
    sessionTimeRemaining: securityState.timeUntilExpiry,
    warningTimeRemaining: securityState.timeUntilWarning,
    
    // MFA helpers
    isMFAEnabled: securityState.mfaStatus?.isEnabled || false,
    mfaMethods: securityState.mfaStatus?.methods || { otp: false, webauthn: false, backupCodes: false },
    
    // Format helpers
    formatTimeRemaining: (ms: number) => {
      const seconds = Math.ceil(ms / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };
}
