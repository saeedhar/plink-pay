import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../store/OnboardingContext';
import { nafathManager, type NafathSession } from '../services/nafathService';
import type { NafathStatus } from '../services/onboardingAPI';

export interface NafathModalState {
  isOpen: boolean;
  currentStatus: NafathStatus | 'REDIRECTION' | null;
  timeRemaining: string;
  isInitializing: boolean;
  session: NafathSession | null;
  processedRequestIds: Set<string>;
}

export function useNafathModal() {
  const [state, setState] = useState<NafathModalState>({
    isOpen: false,
    currentStatus: null,
    timeRemaining: '',
    isInitializing: false,
    session: null,
    processedRequestIds: new Set()
  });

  const navigate = useNavigate();
  const { dispatch } = useOnboarding();

  // Initialize Nafath when entering nafath step
  const initializeNafath = useCallback(async () => {
    const storedState = localStorage.getItem('plink_onboarding_state');
    const persistedState = storedState ? JSON.parse(storedState) : null;
    const onboardingState = persistedState?.data || {};
    
    if (!onboardingState.data?.idNumber) {
      console.error("ID Number not found");
      navigate("/onboarding/id-number");
      return;
    }

    setState(prev => ({ ...prev, isInitializing: true, isOpen: true }));

    try {
      const cleanId = onboardingState.data.idNumber.replace(/\s/g, '');
      const nafathSession = await nafathManager.initiate(cleanId);
      
      setState(prev => ({
        ...prev,
        session: nafathSession,
        timeRemaining: nafathManager.getFormattedTimeRemaining(),
        currentStatus: 'REDIRECTION',
        isInitializing: false
      }));

      // Subscribe to status changes
      const unsubscribe = nafathManager.onStatusChange((status) => {
        setState(prev => {
          // Only prevent processing if modal is closed
          if (!prev.isOpen) {
            return prev;
          }
          
          return {
            ...prev,
            currentStatus: status,
            timeRemaining: nafathManager.getFormattedTimeRemaining()
          };
        });

        dispatch({ type: 'SET_NAFATH_STATUS', payload: status });
      });

      // Subscribe to expiry
      nafathManager.onExpiry(() => {
        setState(prev => ({
          ...prev,
          currentStatus: 'FAILED'
        }));
      });

      // Cleanup subscription on unmount
      return unsubscribe;
    } catch (error) {
      console.error("Failed to initialize Nafath:", error);
      setState(prev => ({
        ...prev,
        currentStatus: 'FAILED',
        isInitializing: false
      }));
    }
  }, [navigate, dispatch]);

  // Check if we should show Nafath modal
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/onboarding/nafath' && !state.isOpen) {
      initializeNafath();
    }
  }, [initializeNafath, state.isOpen]);

  // Update countdown timer
  useEffect(() => {
    if (!state.session) return;

    const interval = setInterval(() => {
      if (state.session) {
        setState(prev => ({
          ...prev,
          timeRemaining: nafathManager.getFormattedTimeRemaining()
        }));
        
        // Check if expired
        if (nafathManager.isExpired() && state.currentStatus === 'REDIRECTION') {
          setState(prev => ({
            ...prev,
            currentStatus: 'FAILED'
          }));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.session, state.currentStatus]);

  const handleGoToNafath = useCallback(() => {
    nafathManager.openNafath();
    setState(prev => ({
      ...prev,
      currentStatus: 'SENT'
    }));
  }, []);

  const handleResend = useCallback(async () => {
    const storedState = localStorage.getItem('plink_onboarding_state');
    const persistedState = storedState ? JSON.parse(storedState) : null;
    const onboardingState = persistedState?.data || {};
    
    if (!onboardingState.data?.idNumber) return;
    
    setState(prev => ({ ...prev, isInitializing: true, currentStatus: 'REDIRECTION' }));
    
    try {
      const cleanId = onboardingState.data.idNumber.replace(/\s/g, '');
      await nafathManager.resend(cleanId);
      const session = nafathManager.getCurrentSession();
      setState(prev => ({
        ...prev,
        session,
        timeRemaining: nafathManager.getFormattedTimeRemaining(),
        isInitializing: false
      }));
    } catch (error) {
      console.error("Failed to resend Nafath:", error);
      setState(prev => ({
        ...prev,
        currentStatus: 'FAILED',
        isInitializing: false
      }));
    }
  }, []);

  const handleClose = useCallback(() => {
    // For terminal states, go back to previous step
    if (state.currentStatus === 'FAILED' || state.currentStatus === 'REJECTED') {
      nafathManager.cleanup();
      setState(prev => ({ ...prev, isOpen: false }));
      navigate("/onboarding/id-number");
    }
  }, [state.currentStatus, navigate]);

  const handleDone = useCallback(() => {
    if (state.currentStatus === 'RECEIVED') {
      // Mark this request as processed to prevent loops
      if (state.session) {
        setState(prev => ({
          ...prev,
          processedRequestIds: new Set([...prev.processedRequestIds, state.session!.requestId])
        }));
      }
      
      // Cleanup and navigate to global screening
      nafathManager.cleanup();
      setState(prev => ({ ...prev, isOpen: false }));
      
      // Navigate to global screening step (which will then go to KYB)
      dispatch({ type: 'NEXT_STEP' });
      navigate("/onboarding/global-screening");
    } else if (state.currentStatus === 'UNDER_REVIEW') {
      // For under review, just close the modal and let it continue to RECEIVED
      setState(prev => ({ ...prev, currentStatus: null }));
    } else if (state.currentStatus === 'SENT') {
      // Just close the modal, stay on page
      setState(prev => ({ ...prev, currentStatus: null }));
    }
  }, [state.currentStatus, state.session, navigate, dispatch]);

  return {
    isOpen: state.isOpen,
    currentStatus: state.currentStatus,
    timeRemaining: state.timeRemaining,
    isInitializing: state.isInitializing,
    handleGoToNafath,
    handleResend,
    handleClose,
    handleDone
  };
}
