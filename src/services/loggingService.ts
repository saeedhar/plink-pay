/**
 * Centralized Logging Service
 * Implements BRD requirements for logging with correlation IDs and no PII
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  correlationId: string;
  sessionId?: string;
  userId?: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration: number;
    memory?: number;
  };
  metadata: {
    userAgent: string;
    url: string;
    component?: string;
    action?: string;
    step?: string;
  };
}

export interface LoggingConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  excludePII: boolean;
  enablePerformanceLogs: boolean;
  enableDebugInProduction: boolean;
  maxLogSize: number;
}

export class LoggingService {
  private config: LoggingConfig;
  private logQueue: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private correlationId: string;
  private sessionId?: string;

  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  };

  constructor(config: Partial<LoggingConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      batchSize: 20,
      flushInterval: 60000, // 1 minute
      excludePII: true,
      enablePerformanceLogs: true,
      enableDebugInProduction: false,
      maxLogSize: 1000, // Maximum number of logs to keep in memory
      ...config
    };

    this.correlationId = this.generateCorrelationId();
    this.initialize();
  }

  /**
   * Initialize logging service
   */
  private initialize(): void {
    this.setupFlushTimer();
    this.setupUnhandledErrorLogging();
    
    // Log service initialization
    this.info('Logging service initialized', {
      config: {
        level: this.config.level,
        enableConsole: this.config.enableConsole,
        enableRemote: this.config.enableRemote
      }
    });
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set session ID for all subsequent logs
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Set user ID for all subsequent logs (will be sanitized if PII exclusion is enabled)
   */
  setUserId(userId: string): void {
    // Don't store actual user ID if PII exclusion is enabled
    if (this.config.excludePII) {
      this.log('info', 'User context set', { hasUserId: !!userId });
    }
  }

  /**
   * Generate new correlation ID for request tracing
   */
  generateNewCorrelationId(): string {
    this.correlationId = this.generateCorrelationId();
    return this.correlationId;
  }

  /**
   * Get current correlation ID
   */
  getCorrelationId(): string {
    return this.correlationId;
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  /**
   * Fatal level logging
   */
  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('fatal', message, context, error);
  }

  /**
   * Log API requests and responses
   */
  logApiCall(
    method: string,
    url: string,
    duration: number,
    status: number,
    context?: Record<string, any>
  ): void {
    const level: LogLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    
    this.log(level, `API ${method} ${this.sanitizeUrl(url)}`, {
      method,
      status,
      duration,
      ...context
    });
  }

  /**
   * Log user actions
   */
  logUserAction(
    action: string,
    component: string,
    step?: string,
    context?: Record<string, any>
  ): void {
    this.log('info', `User action: ${action}`, {
      component,
      step,
      action,
      ...this.sanitizeContext(context)
    });
  }

  /**
   * Log validation errors
   */
  logValidationError(
    field: string,
    errorType: string,
    step: string,
    context?: Record<string, any>
  ): void {
    this.log('warn', `Validation error in ${field}`, {
      field,
      errorType,
      step,
      component: 'validation',
      ...this.sanitizeContext(context)
    });
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: Record<string, any>
  ): void {
    const level: LogLevel = severity === 'critical' ? 'fatal' : 
                           severity === 'high' ? 'error' : 
                           severity === 'medium' ? 'warn' : 'info';

    this.log(level, `Security event: ${event}`, {
      event,
      severity,
      component: 'security',
      ...this.sanitizeContext(context)
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    operation: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    if (!this.config.enablePerformanceLogs) return;

    this.log('info', `Performance: ${operation}`, {
      operation,
      duration,
      component: 'performance',
      ...this.sanitizeContext(context)
    }, undefined, { duration });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    performance?: { duration: number; memory?: number }
  ): void {
    // Check if log level is enabled
    if (this.LOG_LEVELS[level] < this.LOG_LEVELS[this.config.level]) {
      return;
    }

    // Skip debug logs in production unless explicitly enabled
    if (level === 'debug' && 
        process.env.NODE_ENV === 'production' && 
        !this.config.enableDebugInProduction) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      correlationId: this.correlationId,
      sessionId: this.sessionId,
      context: context ? this.sanitizeContext(context) : undefined,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      performance,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? this.sanitizeUrl(window.location.href) : 'server',
        component: context?.component,
        action: context?.action,
        step: context?.step
      }
    };

    // Add to queue
    this.logQueue.push(logEntry);

    // Maintain max log size
    if (this.logQueue.length > this.config.maxLogSize) {
      this.logQueue = this.logQueue.slice(-this.config.maxLogSize);
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Flush if batch size reached or if error/fatal level
    if (this.logQueue.length >= this.config.batchSize || 
        level === 'error' || 
        level === 'fatal') {
      this.flush();
    }
  }

  /**
   * Log to console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.correlationId}]`;
    
    const logData = {
      message: entry.message,
      context: entry.context,
      error: entry.error,
      performance: entry.performance
    };

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, logData);
        break;
      case 'info':
        console.info(prefix, logData);
        break;
      case 'warn':
        console.warn(prefix, logData);
        break;
      case 'error':
      case 'fatal':
        console.error(prefix, logData);
        break;
    }
  }

  /**
   * Sanitize context to remove PII
   */
  private sanitizeContext(context?: Record<string, any>): Record<string, any> {
    if (!context || !this.config.excludePII) {
      return context || {};
    }

    const sanitized: Record<string, any> = {};
    const piiFields = [
      'phone', 'email', 'name', 'firstName', 'lastName', 
      'id', 'nationalId', 'crNumber', 'password', 'otp',
      'ssn', 'address', 'dateOfBirth'
    ];

    Object.entries(context).forEach(([key, value]) => {
      const isPII = piiFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );

      if (isPII) {
        // Replace with metadata about the field
        if (typeof value === 'string') {
          sanitized[`has${key.charAt(0).toUpperCase() + key.slice(1)}`] = !!value;
          sanitized[`${key}Length`] = value.length;
          sanitized[`${key}Type`] = 'string';
        } else if (typeof value === 'number') {
          sanitized[`has${key.charAt(0).toUpperCase() + key.slice(1)}`] = !!value;
          sanitized[`${key}Type`] = 'number';
        } else {
          sanitized[`has${key.charAt(0).toUpperCase() + key.slice(1)}`] = !!value;
          sanitized[`${key}Type`] = typeof value;
        }
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * Sanitize URL to remove sensitive parameters
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const sensitiveParams = ['token', 'key', 'secret', 'password', 'otp'];
      
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });
      
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Setup flush timer
   */
  private setupFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * Setup unhandled error logging
   */
  private setupUnhandledErrorLogging(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.error('Unhandled error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        component: 'global'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', new Error(event.reason), {
        component: 'global',
        type: 'promise'
      });
    });
  }

  /**
   * Flush logs to remote endpoint
   */
  private async flush(): void {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      if (this.config.enableRemote && this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logs,
            sessionId: this.sessionId,
            timestamp: Date.now()
          })
        });
      }
    } catch (error) {
      console.warn('Failed to send logs to remote endpoint:', error);
      // Re-queue logs for retry (keep only recent ones)
      this.logQueue.unshift(...logs.slice(-10));
    }
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logQueue.slice(-count);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logQueue.filter(log => log.level === level);
  }

  /**
   * Get logs by correlation ID
   */
  getLogsByCorrelationId(correlationId: string): LogEntry[] {
    return this.logQueue.filter(log => log.correlationId === correlationId);
  }

  /**
   * Clear log queue
   */
  clearLogs(): void {
    this.logQueue = [];
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Final flush
    this.flush();
  }
}

// Export singleton instance
export const loggingService = new LoggingService();
