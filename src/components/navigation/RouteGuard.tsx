/**
 * Route Guard Component - Protects onboarding routes
 * Implements BRD requirements for step-by-step progression
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../../store/OnboardingContext';
import type { OnboardingStep } from '../../store/onboardingFSM';
import { canAdvanceToStep } from '../../store/onboardingFSM';

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
  const steps: OnboardingStep[] = [
    'businessType',
    'phone',
    'otp',
    'cr',
    'id',
    'nafath',
    'kyb',
    'password'
  ];

  // Start from the end and work backwards
  for (let i = steps.length - 1; i >= 0; i--) {
    if (canAdvanceToStep(state, steps[i])) {
      return steps[i];
    }
  }

  return 'businessType';
}

/**
 * Map onboarding steps to route paths
 */
function getStepPath(step: OnboardingStep): string {
  const stepPaths: Record<OnboardingStep, string> = {
    'businessType': '/onboarding/business-type',
    'phone': '/onboarding/phone',
    'otp': '/onboarding/otp',
    'cr': '/onboarding/cr-number',
    'id': '/onboarding/id-number',
    'nafath': '/onboarding/nafath',
    'globalScreening': '/onboarding/global-screening',
    'kyb': '/onboarding/kyb',
    'password': '/onboarding/password',
    'done': '/onboarding/business-type'
  };

  return stepPaths[step] || '/onboarding/business-type';
}
