/**
 * Analytics Hook
 * Integrates analytics and logging services for comprehensive tracking
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService, type AnalyticsEvent } from '../services/analyticsService';
import { loggingService } from '../services/loggingService';

export interface UseAnalyticsOptions {
  enablePageTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableErrorTracking?: boolean;
  component?: string;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    enablePageTracking = true,
    enablePerformanceTracking = true,
    enableErrorTracking = true,
    component
  } = options;

  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());
  const performanceMarks = useRef<Map<string, number>>(new Map());

  // Track page views
  useEffect(() => {
    if (!enablePageTracking) return;

    const step = getStepFromPath(location.pathname);
    const correlationId = loggingService.generateNewCorrelationId();

    // Track page view
    analyticsService.trackStepViewed(step, {
      path: location.pathname,
      correlationId
    });

    // Log page navigation
    loggingService.info(`Page viewed: ${step}`, {
      step,
      path: location.pathname,
      component: component || 'page'
    });

    // Reset page start time
    pageStartTime.current = Date.now();

    return () => {
      // Track page duration on unmount
      const duration = Date.now() - pageStartTime.current;
      if (duration > 1000) { // Only track if user spent more than 1 second
        analyticsService.trackPerformance({
          [`${step}_duration`]: duration
        });

        loggingService.logPerformance(`Page duration: ${step}`, duration, {
          step,
          component: component || 'page'
        });
      }
    };
  }, [location.pathname, enablePageTracking, component]);

  // Analytics tracking functions
  const trackEvent = useCallback((
    event: string,
    category: AnalyticsEvent['category'],
    action: string,
    properties: Record<string, any> = {}
  ) => {
    const correlationId = loggingService.generateNewCorrelationId();
    
    analyticsService.track(event, category, action, {
      ...properties,
      correlationId,
      component
    });

    loggingService.logUserAction(action, component || 'unknown', properties.step, {
      event,
      category,
      ...properties
    });
  }, [component]);

  const trackStepViewed = useCallback((step: string, properties: Record<string, any> = {}) => {
    analyticsService.trackStepViewed(step, {
      ...properties,
      component
    });

    loggingService.info(`Step viewed: ${step}`, {
      step,
      component: component || 'onboarding',
      ...properties
    });
  }, [component]);

  const trackValidationError = useCallback((field: string, error: string, step: string) => {
    analyticsService.trackValidationFailed(field, error, step);
    
    loggingService.logValidationError(field, categorizeError(error), step, {
      component: component || 'validation'
    });
  }, [component]);

  const trackFormSubmission = useCallback((
    formName: string,
    success: boolean,
    step: string,
    properties: Record<string, any> = {}
  ) => {
    trackEvent('form_submission', 'onboarding', success ? 'success' : 'failure', {
      formName,
      success,
      step,
      ...properties
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((
    buttonName: string,
    step: string,
    properties: Record<string, any> = {}
  ) => {
    trackEvent('button_click', 'navigation', 'click', {
      buttonName,
      step,
      ...properties
    });
  }, [trackEvent]);

  const trackInputFocus = useCallback((
    fieldName: string,
    step: string,
    properties: Record<string, any> = {}
  ) => {
    trackEvent('input_focus', 'onboarding', 'focus', {
      fieldName,
      step,
      ...properties
    });
  }, [trackEvent]);

  const trackDropdown = useCallback((
    dropdownName: string,
    selectedValue: string,
    step: string,
    properties: Record<string, any> = {}
  ) => {
    trackEvent('dropdown_selection', 'onboarding', 'select', {
      dropdownName,
      hasSelection: !!selectedValue,
      step,
      ...properties
    });
  }, [trackEvent]);

  const trackModal = useCallback((
    modalName: string,
    action: 'open' | 'close' | 'confirm' | 'cancel',
    properties: Record<string, any> = {}
  ) => {
    trackEvent('modal_interaction', 'navigation', action, {
      modalName,
      action,
      ...properties
    });
  }, [trackEvent]);

  const trackError = useCallback((error: Error, context: Record<string, any> = {}) => {
    if (!enableErrorTracking) return;

    analyticsService.trackError(error, {
      ...context,
      component
    });

    loggingService.error(`Error in ${component || 'unknown'}`, error, {
      component: component || 'error',
      ...context
    });
  }, [enableErrorTracking, component]);

  const trackPerformance = useCallback((
    operation: string,
    duration: number,
    properties: Record<string, any> = {}
  ) => {
    if (!enablePerformanceTracking) return;

    analyticsService.trackPerformance({
      [operation]: duration,
      ...properties
    });

    loggingService.logPerformance(operation, duration, {
      component: component || 'performance',
      ...properties
    });
  }, [enablePerformanceTracking, component]);

  // Performance measurement utilities
  const startPerformanceMark = useCallback((markName: string) => {
    if (!enablePerformanceTracking) return;

    performanceMarks.current.set(markName, Date.now());
    
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${markName}_start`);
    }
  }, [enablePerformanceTracking]);

  const endPerformanceMark = useCallback((markName: string, properties: Record<string, any> = {}) => {
    if (!enablePerformanceTracking) return;

    const startTime = performanceMarks.current.get(markName);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    performanceMarks.current.delete(markName);

    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${markName}_end`);
      performance.measure(markName, `${markName}_start`, `${markName}_end`);
    }

    trackPerformance(markName, duration, properties);
  }, [enablePerformanceTracking, trackPerformance]);

  const measureAsync = useCallback(async <T>(
    operation: string,
    asyncFunction: () => Promise<T>,
    properties: Record<string, any> = {}
  ): Promise<T> => {
    if (!enablePerformanceTracking) {
      return asyncFunction();
    }

    const startTime = Date.now();
    
    try {
      const result = await asyncFunction();
      const duration = Date.now() - startTime;
      
      trackPerformance(operation, duration, {
        ...properties,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      trackPerformance(operation, duration, {
        ...properties,
        success: false,
        error: error instanceof Error ? error.name : 'unknown'
      });
      
      throw error;
    }
  }, [enablePerformanceTracking, trackPerformance]);

  // Onboarding-specific tracking functions
  const trackOTPSent = useCallback((method: 'sms' | 'call' = 'sms') => {
    analyticsService.trackOTPSent(method);
    loggingService.info('OTP sent', { method, component: 'otp' });
  }, []);

  const trackOTPResent = useCallback((attempt: number) => {
    analyticsService.trackOTPResent(attempt);
    loggingService.info('OTP resent', { attempt, component: 'otp' });
  }, []);

  const trackOTPVerified = useCallback((success: boolean, attempts: number) => {
    analyticsService.trackOTPVerified(success, attempts);
    loggingService.info(`OTP verification ${success ? 'successful' : 'failed'}`, {
      success,
      attempts,
      component: 'otp'
    });
  }, []);

  const trackNafathStatus = useCallback((status: string, duration?: number) => {
    analyticsService.trackNafathStatus(status, duration);
    loggingService.info(`Nafath status: ${status}`, {
      status,
      duration,
      component: 'nafath'
    });
  }, []);

  const trackKYBSubmitted = useCallback((data: Record<string, any>) => {
    analyticsService.trackKYBSubmitted(data);
    loggingService.info('KYB submitted', {
      component: 'kyb',
      hasData: !!data
    });
  }, []);

  const trackPasswordSet = useCallback((strength: 'weak' | 'medium' | 'strong') => {
    analyticsService.trackPasswordSet(strength);
    loggingService.info('Password set', {
      strength,
      component: 'password'
    });
  }, []);

  const trackConversion = useCallback((totalDuration: number) => {
    analyticsService.trackConversion(totalDuration);
    loggingService.info('Onboarding conversion completed', {
      totalDuration,
      component: 'onboarding'
    });
  }, []);

  const trackDropOff = useCallback((step: string, reason?: string) => {
    analyticsService.trackDropOff(step, reason);
    loggingService.warn('User dropped off', {
      step,
      reason,
      component: 'onboarding'
    });
  }, []);

  return {
    // General tracking
    trackEvent,
    trackStepViewed,
    trackValidationError,
    trackFormSubmission,
    trackButtonClick,
    trackInputFocus,
    trackDropdown,
    trackModal,
    trackError,
    trackPerformance,

    // Performance utilities
    startPerformanceMark,
    endPerformanceMark,
    measureAsync,

    // Onboarding-specific tracking
    trackOTPSent,
    trackOTPResent,
    trackOTPVerified,
    trackNafathStatus,
    trackKYBSubmitted,
    trackPasswordSet,
    trackConversion,
    trackDropOff,

    // Utility functions
    getSessionId: () => analyticsService.getSessionId(),
    getCorrelationId: () => loggingService.getCorrelationId(),
    getUserJourney: () => analyticsService.getUserJourney()
  };
}

/**
 * Extract step name from pathname
 */
function getStepFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  const stepMap: Record<string, string> = {
    'business-type': 'business_type',
    'phone': 'phone',
    'otp': 'otp',
    'cr-number': 'cr_number',
    'id-number': 'id_number',
    'nafath': 'nafath',
    'kyb': 'kyb',
    'password': 'password'
  };

  return stepMap[lastSegment] || lastSegment || 'unknown';
}

/**
 * Categorize error for logging
 */
function categorizeError(error: string): string {
  const errorTypes = {
    validation: ['required', 'invalid', 'format', 'length', 'pattern'],
    network: ['network', 'timeout', 'connection', 'fetch'],
    auth: ['unauthorized', 'forbidden', 'expired', 'token'],
    server: ['500', '502', '503', 'server', 'internal']
  };

  const lowerError = error.toLowerCase();
  
  for (const [type, keywords] of Object.entries(errorTypes)) {
    if (keywords.some(keyword => lowerError.includes(keyword))) {
      return type;
    }
  }

  return 'unknown';
}
