/**
 * Analytics Service
 * Implements BRD requirements for event tracking and user journey analytics
 */

export interface AnalyticsEvent {
  event: string;
  category: 'onboarding' | 'validation' | 'security' | 'navigation' | 'error' | 'performance';
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
  correlationId: string;
  sessionId: string;
  userId?: string;
  step?: string;
  userAgent: string;
  url: string;
  referrer?: string;
}

export interface UserJourney {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  events: AnalyticsEvent[];
  currentStep?: string;
  completedSteps: string[];
  dropOffPoint?: string;
  conversionFunnel: {
    step: string;
    timestamp: number;
    duration: number;
  }[];
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTimes: Record<string, number>;
  renderTime: number;
  interactionDelay: number;
  memoryUsage?: number;
  networkType?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  apiEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableUserJourneyTracking: boolean;
  excludePII: boolean;
  debugMode: boolean;
}

export class AnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private userJourney: UserJourney | null = null;
  private sessionId: string;
  private correlationId: string;
  private flushTimer: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      enableUserJourneyTracking: true,
      excludePII: true,
      debugMode: false,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.correlationId = this.generateCorrelationId();

    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize analytics service
   */
  private initialize(): void {
    this.startUserJourney();
    this.setupPerformanceTracking();
    this.setupErrorTracking();
    this.setupFlushTimer();
    this.trackPageLoad();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate correlation ID for request tracing
   */
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start user journey tracking
   */
  private startUserJourney(): void {
    if (!this.config.enableUserJourneyTracking) return;

    this.userJourney = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      events: [],
      completedSteps: [],
      conversionFunnel: []
    };
  }

  /**
   * Track analytics event
   */
  track(
    event: string,
    category: AnalyticsEvent['category'],
    action: string,
    properties: Record<string, any> = {}
  ): void {
    if (!this.config.enabled) return;

    // Generate new correlation ID for each event
    this.correlationId = this.generateCorrelationId();

    // Clean properties to exclude PII
    const cleanProperties = this.config.excludePII 
      ? this.sanitizeProperties(properties)
      : properties;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label: cleanProperties.label,
      value: cleanProperties.value,
      properties: cleanProperties,
      timestamp: Date.now(),
      correlationId: this.correlationId,
      sessionId: this.sessionId,
      userId: cleanProperties.userId,
      step: cleanProperties.step,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer || undefined
    };

    // Add to queue
    this.eventQueue.push(analyticsEvent);

    // Add to user journey
    if (this.userJourney) {
      this.userJourney.events.push(analyticsEvent);
    }

    // Debug logging
    if (this.config.debugMode) {
      console.log('Analytics Event:', analyticsEvent);
    }

    // Flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Track onboarding step events
   */
  trackStepViewed(step: string, properties: Record<string, any> = {}): void {
    this.track('step_viewed', 'onboarding', 'view', {
      step,
      ...properties
    });

    // Update user journey
    if (this.userJourney) {
      this.userJourney.currentStep = step;
      if (!this.userJourney.completedSteps.includes(step)) {
        this.userJourney.completedSteps.push(step);
        this.userJourney.conversionFunnel.push({
          step,
          timestamp: Date.now(),
          duration: Date.now() - this.userJourney.startTime
        });
      }
    }
  }

  /**
   * Track validation failures
   */
  trackValidationFailed(field: string, error: string, step: string): void {
    this.track('validation_failed', 'validation', 'error', {
      field,
      errorType: this.categorizeError(error),
      step,
      // Don't include actual error message to avoid PII
      hasError: true
    });
  }

  /**
   * Track OTP events
   */
  trackOTPSent(method: 'sms' | 'call' = 'sms'): void {
    this.track('otp_sent', 'onboarding', 'send', {
      method,
      step: 'phone'
    });
  }

  trackOTPResent(attempt: number): void {
    this.track('otp_resent', 'onboarding', 'resend', {
      attempt,
      step: 'otp'
    });
  }

  trackOTPVerified(success: boolean, attempts: number): void {
    this.track('otp_verified', 'onboarding', success ? 'success' : 'failure', {
      success,
      attempts,
      step: 'otp'
    });
  }

  /**
   * Track Nafath events
   */
  trackNafathStatus(status: string, duration?: number): void {
    this.track('nafath_status', 'onboarding', 'status_change', {
      status,
      duration,
      step: 'nafath'
    });
  }

  /**
   * Track KYB submission
   */
  trackKYBSubmitted(data: Record<string, any>): void {
    // Sanitize KYB data to remove PII
    const sanitizedData = {
      hasAnnualRevenue: !!data.annualRevenue,
      hasBusinessActivity: !!data.businessActivity,
      purposeCount: Array.isArray(data.purposeOfAccount) ? data.purposeOfAccount.length : 0,
      hasOtherPurpose: data.purposeOfAccount?.includes('other') || false
    };

    this.track('kyb_submitted', 'onboarding', 'submit', {
      ...sanitizedData,
      step: 'kyb'
    });
  }

  /**
   * Track password setup
   */
  trackPasswordSet(strength: 'weak' | 'medium' | 'strong'): void {
    this.track('password_set', 'onboarding', 'complete', {
      strength,
      step: 'password'
    });
  }

  /**
   * Track navigation events
   */
  trackNavigation(from: string, to: string, method: 'click' | 'keyboard' | 'programmatic' = 'click'): void {
    this.track('navigation', 'navigation', 'navigate', {
      from,
      to,
      method
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: Partial<PerformanceMetrics>): void {
    if (!this.config.enablePerformanceTracking) return;

    this.track('performance', 'performance', 'metrics', {
      ...metrics,
      timestamp: Date.now()
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context: Record<string, any> = {}): void {
    if (!this.config.enableErrorTracking) return;

    this.track('error', 'error', 'exception', {
      errorName: error.name,
      errorType: error.constructor.name,
      hasStack: !!error.stack,
      context: this.sanitizeProperties(context)
    });
  }

  /**
   * Track user drop-off
   */
  trackDropOff(step: string, reason?: string): void {
    this.track('drop_off', 'onboarding', 'abandon', {
      step,
      reason
    });

    if (this.userJourney) {
      this.userJourney.dropOffPoint = step;
      this.userJourney.endTime = Date.now();
    }
  }

  /**
   * Track conversion completion
   */
  trackConversion(totalDuration: number): void {
    this.track('conversion', 'onboarding', 'complete', {
      totalDuration,
      stepsCompleted: this.userJourney?.completedSteps.length || 0
    });

    if (this.userJourney) {
      this.userJourney.endTime = Date.now();
    }
  }

  /**
   * Setup performance tracking
   */
  private setupPerformanceTracking(): void {
    if (!this.config.enablePerformanceTracking || typeof PerformanceObserver === 'undefined') return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackPerformance({
              pageLoadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
            });
          }
          
          if (entry.entryType === 'measure') {
            this.trackPerformance({
              [entry.name]: entry.duration
            });
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'measure'] });
    } catch (error) {
      console.warn('Performance tracking not supported:', error);
    }
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    if (!this.config.enableErrorTracking) return;

    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandledrejection'
      });
    });
  }

  /**
   * Track page load
   */
  private trackPageLoad(): void {
    this.track('page_load', 'navigation', 'load', {
      url: window.location.href,
      referrer: document.referrer
    });
  }

  /**
   * Setup flush timer
   */
  private setupFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * Sanitize properties to remove PII
   */
  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const piiFields = ['phone', 'email', 'name', 'id', 'password', 'ssn', 'nationalId'];

    Object.entries(properties).forEach(([key, value]) => {
      const isPII = piiFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );

      if (isPII) {
        // Replace with boolean or length indicator
        if (typeof value === 'string') {
          sanitized[`has${key.charAt(0).toUpperCase() + key.slice(1)}`] = !!value;
          sanitized[`${key}Length`] = value.length;
        } else {
          sanitized[`has${key.charAt(0).toUpperCase() + key.slice(1)}`] = !!value;
        }
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * Categorize error types
   */
  private categorizeError(error: string): string {
    const errorCategories = {
      validation: ['required', 'invalid', 'format', 'length'],
      network: ['network', 'timeout', 'connection'],
      auth: ['unauthorized', 'forbidden', 'expired'],
      server: ['500', 'error', 'failed']
    };

    for (const [category, keywords] of Object.entries(errorCategories)) {
      if (keywords.some(keyword => error.toLowerCase().includes(keyword))) {
        return category;
      }
    }

    return 'unknown';
  }

  /**
   * Flush events to analytics endpoint
   */
  private async flush(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (this.config.apiEndpoint) {
        await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events,
            sessionId: this.sessionId,
            timestamp: Date.now()
          })
        });
      } else {
        // Fallback to console logging in development
        if (this.config.debugMode) {
          console.log('Analytics Events Batch:', events);
        }
      }
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Get current user journey
   */
  getUserJourney(): UserJourney | null {
    return this.userJourney;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get correlation ID
   */
  getCorrelationId(): string {
    return this.correlationId;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Final flush
    this.flush();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService({
  debugMode: process.env.NODE_ENV === 'development'
});
