/**
 * Security Service - Session management and auto-logout
 * Implements BRD requirements for security features
 */

import { globalCache } from './cacheService';

export interface SecurityConfig {
  sessionTimeoutMs: number;
  warningTimeoutMs: number;
  maxFailureAttempts: number;
  lockoutDurationMs: number;
  sensitivePages: string[];
}

export interface SessionInfo {
  startTime: number;
  lastActivity: number;
  isActive: boolean;
  warningShown: boolean;
  userId?: string;
}

export interface FailureAttempt {
  timestamp: number;
  type: 'login' | 'otp' | 'password' | 'verification';
  identifier: string; // phone, email, etc.
}

export interface LockoutInfo {
  lockedUntil: number;
  attempts: FailureAttempt[];
  type: string;
}

export class SecurityService {
  private config: SecurityConfig;
  private session: SessionInfo | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private onWarningCallback: (() => void) | null = null;
  private onLogoutCallback: (() => void) | null = null;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      sessionTimeoutMs: 5 * 60 * 1000, // 5 minutes
      warningTimeoutMs: 60 * 1000, // 1 minute warning
      maxFailureAttempts: 5,
      lockoutDurationMs: 15 * 60 * 1000, // 15 minutes lockout
      sensitivePages: ['/onboarding/otp', '/onboarding/nafath', '/onboarding/password'],
      ...config
    };
  }

  /**
   * Start security session
   */
  startSession(userId?: string): void {
    const now = Date.now();
    
    this.session = {
      startTime: now,
      lastActivity: now,
      isActive: true,
      warningShown: false,
      userId
    };

    this.resetActivityTimer();
    console.log('Security session started', { userId, timeout: this.config.sessionTimeoutMs });
  }

  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    if (!this.session || !this.session.isActive) return;

    this.session.lastActivity = Date.now();
    this.session.warningShown = false;
    this.resetActivityTimer();
  }

  /**
   * Check if current page is sensitive
   */
  isSensitivePage(pathname: string): boolean {
    return this.config.sensitivePages.some(page => pathname.includes(page));
  }

  /**
   * Get session info
   */
  getSessionInfo(): SessionInfo | null {
    return this.session;
  }

  /**
   * Get time until session expires
   */
  getTimeUntilExpiry(): number {
    if (!this.session) return 0;
    
    const elapsed = Date.now() - this.session.lastActivity;
    return Math.max(0, this.config.sessionTimeoutMs - elapsed);
  }

  /**
   * Get time until warning should be shown
   */
  getTimeUntilWarning(): number {
    if (!this.session) return 0;
    
    const timeUntilExpiry = this.getTimeUntilExpiry();
    return Math.max(0, timeUntilExpiry - this.config.warningTimeoutMs);
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(): boolean {
    return this.getTimeUntilExpiry() <= 0;
  }

  /**
   * Check if warning should be shown
   */
  shouldShowWarning(): boolean {
    return this.getTimeUntilWarning() <= 0 && !this.session?.warningShown;
  }

  /**
   * Mark warning as shown
   */
  markWarningShown(): void {
    if (this.session) {
      this.session.warningShown = true;
    }
  }

  /**
   * Extend session (when user confirms they want to continue)
   */
  extendSession(): void {
    if (this.session) {
      this.session.lastActivity = Date.now();
      this.session.warningShown = false;
      this.resetActivityTimer();
      console.log('Session extended');
    }
  }

  /**
   * End session manually
   */
  endSession(): void {
    if (this.session) {
      this.session.isActive = false;
      this.clearTimers();
      console.log('Session ended manually');
    }
  }

  /**
   * Set callback for session warning
   */
  onSessionWarning(callback: () => void): void {
    this.onWarningCallback = callback;
  }

  /**
   * Set callback for session timeout
   */
  onSessionTimeout(callback: () => void): void {
    this.onLogoutCallback = callback;
  }

  /**
   * Reset activity timer
   */
  private resetActivityTimer(): void {
    this.clearTimers();

    // Set warning timer
    const warningDelay = this.config.sessionTimeoutMs - this.config.warningTimeoutMs;
    this.warningTimer = setTimeout(() => {
      if (this.session && this.session.isActive && !this.session.warningShown) {
        this.session.warningShown = true;
        if (this.onWarningCallback) {
          this.onWarningCallback();
        }
      }
    }, warningDelay);

    // Set logout timer
    this.activityTimer = setTimeout(() => {
      if (this.session && this.session.isActive) {
        this.session.isActive = false;
        if (this.onLogoutCallback) {
          this.onLogoutCallback();
        }
        console.log('Session expired due to inactivity');
      }
    }, this.config.sessionTimeoutMs);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  /**
   * Record failure attempt
   */
  recordFailureAttempt(type: FailureAttempt['type'], identifier: string): void {
    const cacheKey = `failures:${type}:${identifier}`;
    const existing = globalCache.get<FailureAttempt[]>(cacheKey) || [];
    
    const attempt: FailureAttempt = {
      timestamp: Date.now(),
      type,
      identifier
    };

    existing.push(attempt);
    
    // Keep only recent attempts (last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentAttempts = existing.filter(a => a.timestamp > oneHourAgo);
    
    globalCache.set(cacheKey, recentAttempts, 60 * 60 * 1000); // 1 hour cache
    
    // Check if lockout should be applied
    if (recentAttempts.length >= this.config.maxFailureAttempts) {
      this.applyLockout(type, identifier, recentAttempts);
    }
  }

  /**
   * Check if identifier is locked out
   */
  isLockedOut(type: string, identifier: string): boolean {
    const cacheKey = `lockout:${type}:${identifier}`;
    const lockout = globalCache.get<LockoutInfo>(cacheKey);
    
    if (!lockout) return false;
    
    if (Date.now() > lockout.lockedUntil) {
      // Lockout expired, clear it
      globalCache.delete(cacheKey);
      return false;
    }
    
    return true;
  }

  /**
   * Get lockout info
   */
  getLockoutInfo(type: string, identifier: string): LockoutInfo | null {
    const cacheKey = `lockout:${type}:${identifier}`;
    return globalCache.get<LockoutInfo>(cacheKey);
  }

  /**
   * Get remaining lockout time
   */
  getRemainingLockoutTime(type: string, identifier: string): number {
    const lockout = this.getLockoutInfo(type, identifier);
    if (!lockout) return 0;
    
    return Math.max(0, lockout.lockedUntil - Date.now());
  }

  /**
   * Apply lockout
   */
  private applyLockout(type: string, identifier: string, attempts: FailureAttempt[]): void {
    const cacheKey = `lockout:${type}:${identifier}`;
    const lockout: LockoutInfo = {
      lockedUntil: Date.now() + this.config.lockoutDurationMs,
      attempts,
      type
    };
    
    globalCache.set(cacheKey, lockout, this.config.lockoutDurationMs);
    console.warn(`Lockout applied for ${type}:${identifier}`, { 
      duration: this.config.lockoutDurationMs,
      attempts: attempts.length 
    });
  }

  /**
   * Clear failure attempts (on successful action)
   */
  clearFailureAttempts(type: string, identifier: string): void {
    const cacheKey = `failures:${type}:${identifier}`;
    globalCache.delete(cacheKey);
  }

  /**
   * Get failure attempt count
   */
  getFailureAttemptCount(type: string, identifier: string): number {
    const cacheKey = `failures:${type}:${identifier}`;
    const attempts = globalCache.get<FailureAttempt[]>(cacheKey) || [];
    
    // Count only recent attempts (last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return attempts.filter(a => a.timestamp > oneHourAgo).length;
  }

  /**
   * Cleanup expired data
   */
  cleanup(): void {
    this.clearTimers();
    this.session = null;
  }
}

// Export singleton instance
export const securityService = new SecurityService();
