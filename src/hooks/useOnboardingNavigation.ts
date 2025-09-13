/**
 * Onboarding Navigation Hook
 * Implements BRD requirements for navigation control and validation
 */

import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../store/OnboardingContext';
import type { OnboardingStep } from '../store/onboardingFSM';
import { useLoadingState } from './useLoadingState';
import { useTimerCleanup } from './useTimerCleanup';

export function useOnboardingNavigation() {
  const { state, dispatch, canAdvanceTo } = useOnboarding();
  const navigate = useNavigate();
  const { executeAction, isActionPending } = useLoadingState();
  const { clearAllTimers } = useTimerCleanup();
  const navigationLock = useRef<boolean>(false);

  /**
   * Navigate to a specific step with validation
   */
  const navigateToStep = useCallback(async (
    step: OnboardingStep,
    options: {
      force?: boolean;
      validateFirst?: boolean;
      clearTimers?: boolean;
    } = {}
  ): Promise<boolean> => {
    const { force = false, validateFirst = true, clearTimers = true } = options;

    // Prevent concurrent navigation
    if (navigationLock.current) {
      console.warn('Navigation already in progress');
      return false;
    }

    try {
      navigationLock.current = true;

      // Clear timers if requested
      if (clearTimers) {
        clearAllTimers();
      }

      // Check if we can advance to this step
      if (!force && validateFirst && !canAdvanceTo(step)) {
        console.warn(`Cannot advance to step ${step}`);
        return false;
      }

      // Map step to route
      const route = getStepRoute(step);
      if (!route) {
        console.error(`No route found for step ${step}`);
        return false;
      }

      // Navigate
      navigate(route, { replace: true });
      return true;

    } finally {
      navigationLock.current = false;
    }
  }, [canAdvanceTo, navigate, clearAllTimers]);

  /**
   * Navigate to next step with validation
   */
  const goToNextStep = useCallback(async (
    currentData?: any,
    options: {
      skipValidation?: boolean;
      optimisticUpdate?: () => void;
    } = {}
  ): Promise<boolean> => {
    const { skipValidation = false, optimisticUpdate } = options;

    return executeAction('navigate_next', async () => {
      // Update current step data if provided
      if (currentData) {
        // Dispatch appropriate action based on current step
        const actionType = getUpdateActionForStep(state.currentStep);
        if (actionType) {
          dispatch({ type: actionType, payload: currentData } as any);
        }
      }

      // Trigger next step transition
      dispatch({ type: 'NEXT_STEP' });

      // Get next step
      const nextStep = getNextStep(state.currentStep);
      if (nextStep) {
        return navigateToStep(nextStep, { validateFirst: !skipValidation });
      }

      return false;
    }, { optimisticUpdate });
  }, [state.currentStep, dispatch, executeAction, navigateToStep]);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(async (): Promise<boolean> => {
    const previousStep = getPreviousStep(state.currentStep);
    if (previousStep) {
      return navigateToStep(previousStep, { force: true, validateFirst: false });
    }
    return false;
  }, [state.currentStep, navigateToStep]);

  /**
   * Check if navigation to next step is allowed
   */
  const canGoToNextStep = useCallback((
    additionalValidation?: () => boolean
  ): boolean => {
    // Check if any action is pending
    if (isActionPending('navigate_next')) {
      return false;
    }

    // Check current step validation
    const hasValidationErrors = Object.values(state.validationErrors).some(error => error);
    if (hasValidationErrors) {
      return false;
    }

    // Check additional validation if provided
    if (additionalValidation && !additionalValidation()) {
      return false;
    }

    // Check if we can advance to next step
    const nextStep = getNextStep(state.currentStep);
    if (!nextStep) {
      return false;
    }

    return canAdvanceTo(nextStep);
  }, [state.validationErrors, state.currentStep, canAdvanceTo, isActionPending]);

  /**
   * Restart onboarding flow
   */
  const restartOnboarding = useCallback(async (): Promise<void> => {
    clearAllTimers();
    dispatch({ type: 'RESET_STATE' });
    navigate('/onboarding/business-type', { replace: true });
  }, [dispatch, navigate, clearAllTimers]);

  /**
   * Navigate with optimistic updates
   */
  const navigateWithOptimism = useCallback(async (
    step: OnboardingStep,
    updateData: any,
    optimisticUpdate: () => void,
    revertUpdate: () => void
  ): Promise<boolean> => {
    return executeAction(`navigate_to_${step}`, async () => {
      // Apply optimistic update
      optimisticUpdate();

      // Navigate
      const success = await navigateToStep(step);
      if (!success) {
        throw new Error(`Failed to navigate to ${step}`);
      }

      return success;
    }, {
      optimisticUpdate,
      onOptimisticRevert: revertUpdate
    });
  }, [executeAction, navigateToStep]);

  return {
    // Navigation actions
    navigateToStep,
    goToNextStep,
    goToPreviousStep,
    restartOnboarding,
    navigateWithOptimism,

    // Navigation state
    canGoToNextStep,
    isNavigating: isActionPending('navigate_next'),
    currentStep: state.currentStep,

    // Utility
    getStepRoute,
    getNextStep: () => getNextStep(state.currentStep),
    getPreviousStep: () => getPreviousStep(state.currentStep)
  };
}

/**
 * Map onboarding steps to route paths
 */
function getStepRoute(step: OnboardingStep): string | null {
  const routes: Record<OnboardingStep, string> = {
    'businessType': '/onboarding/business-type',
    'phone': '/onboarding/phone',
    'otp': '/onboarding/otp',
    'cr': '/onboarding/cr-number',
    'id': '/onboarding/id-number',
    'nafath': '/onboarding/nafath',
    'kyb': '/onboarding/kyb',
    'password': '/onboarding/password',
    'done': '/onboarding/complete'
  };

  return routes[step] || null;
}

/**
 * Get next step in sequence
 */
function getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
  const stepOrder: OnboardingStep[] = [
    'businessType',
    'phone',
    'otp',
    'cr',
    'id',
    'nafath',
    'kyb',
    'password'
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }

  return stepOrder[currentIndex + 1];
}

/**
 * Get previous step in sequence
 */
function getPreviousStep(currentStep: OnboardingStep): OnboardingStep | null {
  const stepOrder: OnboardingStep[] = [
    'businessType',
    'phone',
    'otp',
    'cr',
    'id',
    'nafath',
    'kyb',
    'password'
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex <= 0) {
    return null;
  }

  return stepOrder[currentIndex - 1];
}

/**
 * Get appropriate update action for current step
 */
function getUpdateActionForStep(step: OnboardingStep): string | null {
  const actionMap: Record<OnboardingStep, string> = {
    'businessType': 'SET_BUSINESS_TYPE',
    'phone': 'SET_PHONE',
    'otp': 'VERIFY_OTP_SUCCESS',
    'cr': 'SET_CR_NUMBER',
    'id': 'SET_ID_NUMBER',
    'nafath': 'SET_NAFATH_STATUS',
    'kyb': 'SET_KYB_DATA',
    'password': 'SET_PASSWORD_SUCCESS',
    'done': 'COMPLETE'
  };

  return actionMap[step] || null;
}
