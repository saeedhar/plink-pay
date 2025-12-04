/**
 * Layout wrapper for onboarding routes
 * Intercepts browser back navigation and redirects to business type selection
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../store/OnboardingContext';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

const BUSINESS_TYPE_ROUTE = '/onboarding/business-type';
const ONBOARDING_PREFIX = '/onboarding';

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearProgress } = useOnboarding();
  const isRedirecting = useRef(false);
  const lastPushedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only handle onboarding routes
    if (!location.pathname.startsWith(ONBOARDING_PREFIX)) {
      return;
    }

    // Don't intercept on business type screen itself
    if (location.pathname === BUSINESS_TYPE_ROUTE) {
      isRedirecting.current = false;
      lastPushedPath.current = null;
      return;
    }

    // Function to handle browser back button
    const handlePopState = () => {
      // Prevent multiple simultaneous redirects
      if (isRedirecting.current) {
        return;
      }

      isRedirecting.current = true;

      // Clear onboarding progress
      clearProgress();

      // Redirect to business type screen immediately
      // Use replace: true to prevent going back
      navigate(BUSINESS_TYPE_ROUTE, { replace: true });

      // Push a new state to prevent further back navigation
      setTimeout(() => {
        window.history.pushState(null, '', BUSINESS_TYPE_ROUTE);
        isRedirecting.current = false;
        lastPushedPath.current = null;
      }, 100);
    };

    // Push a new history state entry only once per route
    // This creates an entry we can intercept when back is pressed
    if (lastPushedPath.current !== location.pathname && !isRedirecting.current) {
      window.history.pushState(
        { onboardingStep: true, path: location.pathname },
        '',
        location.pathname
      );
      lastPushedPath.current = location.pathname;
    }

    // Listen for browser back/forward button
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate, clearProgress]);

  return <>{children}</>;
}