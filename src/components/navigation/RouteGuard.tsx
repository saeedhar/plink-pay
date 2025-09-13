/**
 * Route Guard Component - Protects onboarding routes
 * Implements BRD requirements for step-by-step progression
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../../store/OnboardingContext';
import { OnboardingStep, canAdvanceToStep } from '../../store/onboardingFSM';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredStep: OnboardingStep;
  redirectTo?: string;
}

export function RouteGuard({ children, requiredStep, redirectTo }: RouteGuardProps) {
  const { state } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user can access this step
    const canAccess = canAdvanceToStep(state, requiredStep);
    
    if (!canAccess) {
      // Find the furthest step the user can access
      const allowedStep = findFurthestAccessibleStep(state);
      const redirectPath = redirectTo || getStepPath(allowedStep);
      
      console.warn(`Access denied to ${requiredStep}. Redirecting to ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
  }, [state, requiredStep, navigate, redirectTo, location.pathname]);

  // Only render children if user can access this step
  const canAccess = canAdvanceToStep(state, requiredStep);
  return canAccess ? <>{children}</> : null;
}

/**
 * Find the furthest step the user can access
 */
function findFurthestAccessibleStep(state: any): OnboardingStep {
  const steps = [
    OnboardingStep.BUSINESS_TYPE,
    OnboardingStep.PHONE,
    OnboardingStep.OTP,
    OnboardingStep.CR_NUMBER,
    OnboardingStep.ID_NUMBER,
    OnboardingStep.NAFATH,
    OnboardingStep.KYB,
    OnboardingStep.PASSWORD
  ];

  // Start from the end and work backwards
  for (let i = steps.length - 1; i >= 0; i--) {
    if (canAdvanceToStep(state, steps[i])) {
      return steps[i];
    }
  }

  return OnboardingStep.BUSINESS_TYPE;
}

/**
 * Map onboarding steps to route paths
 */
function getStepPath(step: OnboardingStep): string {
  const stepPaths: Record<OnboardingStep, string> = {
    [OnboardingStep.BUSINESS_TYPE]: '/onboarding/business-type',
    [OnboardingStep.PHONE]: '/onboarding/phone',
    [OnboardingStep.OTP]: '/onboarding/otp',
    [OnboardingStep.CR_NUMBER]: '/onboarding/cr-number',
    [OnboardingStep.ID_NUMBER]: '/onboarding/id-number',
    [OnboardingStep.NAFATH]: '/onboarding/nafath',
    [OnboardingStep.KYB]: '/onboarding/kyb',
    [OnboardingStep.PASSWORD]: '/onboarding/password'
  };

  return stepPaths[step] || '/onboarding/business-type';
}
