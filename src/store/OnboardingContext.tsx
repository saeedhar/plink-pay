/**
 * React context for onboarding finite state machine
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  OnboardingState,
  OnboardingAction,
  OnboardingStep,
  onboardingReducer,
  initialState,
  canAdvanceToStep
} from './onboardingFSM';

interface OnboardingContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  canAdvanceTo: (step: OnboardingStep) => boolean;
  isStepCompleted: (step: OnboardingStep) => boolean;
  goToNextStep: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const canAdvanceTo = (step: OnboardingStep) => canAdvanceToStep(state, step);
  
  const isStepCompleted = (step: OnboardingStep) => state.completedSteps.has(step);
  
  const goToNextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const value = {
    state,
    dispatch,
    canAdvanceTo,
    isStepCompleted,
    goToNextStep
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
