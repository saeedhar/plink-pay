/**
 * Accessibility Hook
 * Integrates accessibility and i18n services for comprehensive a11y support
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { accessibilityService } from '../services/accessibilityService';
import { i18nService, type Locale } from '../services/i18nService';

export interface UseAccessibilityOptions {
  announcePageChanges?: boolean;
  enableFocusTrapping?: boolean;
  enableKeyboardNavigation?: boolean;
  autoFocusOnMount?: boolean;
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    announcePageChanges = true,
    enableFocusTrapping = true,
    enableKeyboardNavigation = true,
    autoFocusOnMount = false
  } = options;

  const location = useLocation();
  const containerRef = useRef<HTMLElement>(null);
  const focusTrapCleanup = useRef<(() => void) | null>(null);

  // Announce page changes
  useEffect(() => {
    if (!announcePageChanges) return;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const pageName = pathSegments[pathSegments.length - 1] || 'home';
    const stepNumber = getStepNumber(location.pathname);
    const totalSteps = 8; // Total onboarding steps

    accessibilityService.announcePageChange(
      formatPageName(pageName),
      stepNumber,
      stepNumber ? totalSteps : undefined
    );
  }, [location.pathname, announcePageChanges]);

  // Setup focus trapping
  useEffect(() => {
    if (!enableFocusTrapping || !containerRef.current) return;

    // Clean up previous trap
    if (focusTrapCleanup.current) {
      focusTrapCleanup.current();
    }

    // Setup new trap
    focusTrapCleanup.current = accessibilityService.trapFocus(containerRef.current);

    return () => {
      if (focusTrapCleanup.current) {
        focusTrapCleanup.current();
        focusTrapCleanup.current = null;
      }
    };
  }, [enableFocusTrapping]);

  // Auto focus on mount
  useEffect(() => {
    if (!autoFocusOnMount || !containerRef.current) return;

    const focusableElements = accessibilityService.getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      // Focus first interactive element or heading
      const firstHeading = containerRef.current.querySelector('h1, h2, h3');
      const firstInput = focusableElements[0]?.element;
      
      if (firstHeading instanceof HTMLElement) {
        firstHeading.tabIndex = -1;
        firstHeading.focus();
      } else if (firstInput) {
        firstInput.focus();
      }
    }
  }, [autoFocusOnMount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (focusTrapCleanup.current) {
        focusTrapCleanup.current();
      }
    };
  }, []);

  // Accessibility actions
  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    accessibilityService.announce(message, priority);
  }, []);

  const announceError = useCallback((fieldName: string, error: string) => {
    accessibilityService.announceValidationError(fieldName, error);
  }, []);

  const announceSuccess = useCallback((message: string) => {
    accessibilityService.announceSuccess(message);
  }, []);

  const generateId = useCallback((prefix?: string) => {
    return accessibilityService.generateId(prefix);
  }, []);

  const createDescription = useCallback((text: string, id?: string) => {
    return accessibilityService.createDescription(text, id);
  }, []);

  // I18n actions
  const setLocale = useCallback((locale: Locale) => {
    i18nService.setLocale(locale);
    i18nService.applyRTLProperties();
  }, []);

  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions) => {
    return i18nService.formatNumber(number, options);
  }, []);

  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => {
    return i18nService.formatDate(date, options);
  }, []);

  const formatPhoneNumber = useCallback((phoneNumber: string) => {
    return i18nService.formatPhoneNumber(phoneNumber);
  }, []);

  const toArabicNumerals = useCallback((input: string) => {
    return i18nService.toArabicNumerals(input);
  }, []);

  const toEnglishNumerals = useCallback((input: string) => {
    return i18nService.toEnglishNumerals(input);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return i18nService.t(key, params);
  }, []);

  return {
    // Refs
    containerRef,
    
    // State
    currentLocale: i18nService.getCurrentLocale(),
    isRTL: i18nService.isRTL(),
    availableLocales: i18nService.getAvailableLocales(),
    
    // Accessibility actions
    announce,
    announceError,
    announceSuccess,
    generateId,
    createDescription,
    
    // I18n actions
    setLocale,
    formatNumber,
    formatDate,
    formatPhoneNumber,
    toArabicNumerals,
    toEnglishNumerals,
    t,
    
    // Utility functions
    getFocusableElements: (container?: HTMLElement) => 
      accessibilityService.getFocusableElements(container || containerRef.current!),
    
    getTextDirection: (text: string) => i18nService.getTextDirection(text)
  };
}

/**
 * Get step number from pathname
 */
function getStepNumber(pathname: string): number | undefined {
  const stepMap: Record<string, number> = {
    'business-type': 1,
    'phone': 2,
    'otp': 3,
    'cr-number': 4,
    'id-number': 5,
    'nafath': 6,
    'kyb': 7,
    'password': 8
  };

  const pathSegments = pathname.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  
  return stepMap[lastSegment];
}

/**
 * Format page name for announcements
 */
function formatPageName(pageName: string): string {
  const nameMap: Record<string, string> = {
    'business-type': 'Business Type Selection',
    'phone': 'Phone Number Entry',
    'otp': 'OTP Verification',
    'cr-number': 'CR Number Entry',
    'id-number': 'ID Number Entry',
    'nafath': 'Nafath Verification',
    'kyb': 'Know Your Business',
    'password': 'Password Setup',
    'home': 'Welcome Page'
  };

  return nameMap[pageName] || pageName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
