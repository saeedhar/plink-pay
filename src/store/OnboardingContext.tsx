/**
 * React context for onboarding finite state machine
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { OnboardingState, OnboardingAction, OnboardingStep } from './onboardingFSM';
import { onboardingReducer, initialState, canAdvanceToStep } from './onboardingFSM';
import { stateService } from '../services/stateService';

interface OnboardingContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  canAdvanceTo: (step: OnboardingStep) => boolean;
  isStepCompleted: (step: OnboardingStep) => boolean;
  goToNextStep: () => void;
  saveCheckpoint: (label: string) => void;
  clearProgress: () => void;
  hasPersistedState: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Initialize state with persistence
  const [state, dispatch] = useReducer(onboardingReducer, () => {
    const persistedState = stateService.loadState();
    return persistedState || initialState;
  });

  // Save state changes to localStorage
  useEffect(() => {
    stateService.saveState(state);
  }, [state]);

  // Cleanup on unmount (clear sensitive data)
  useEffect(() => {
    return () => {
      // Clear sensitive data but keep progress
      const cleanState = stateService.clearSensitiveData(state);
      stateService.saveState(cleanState);
    };
  }, [state]);

  const canAdvanceTo = (step: OnboardingStep) => canAdvanceToStep(state, step);
  
  const isStepCompleted = (step: OnboardingStep) => state.completedSteps.includes(step);
  
  const goToNextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const saveCheckpoint = (label: string) => {
    stateService.createCheckpoint(state, label);
  };

  const clearProgress = () => {
    stateService.clearState();
    // Reset to initial state
    dispatch({ type: 'RESET_STATE' } as OnboardingAction);
  };

  const hasPersistedState = stateService.hasValidState();

  const value = {
    state,
    dispatch,
    canAdvanceTo,
    isStepCompleted,
    goToNextStep,
    saveCheckpoint,
    clearProgress,
    hasPersistedState
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
