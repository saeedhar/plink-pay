/**
 * Nafath Service - Complete integration with polling and status management
 * Implements BRD requirements for 5 Nafath status outcomes
 */

import { initiateNafath, getNafathStatus, type NafathStatus, type NafathInitiateResponse, type NafathStatusResponse } from './onboardingAPI';

export interface NafathSession {
  requestId: string;
  expiresAt: Date;
  nafathUrl: string;
  status: NafathStatus | 'PENDING';
  pollInterval?: NodeJS.Timeout;
}

export class NafathManager {
  private session: NafathSession | null = null;
  private statusCallbacks: ((status: NafathStatus) => void)[] = [];
  private expiryCallback: (() => void) | null = null;

  /**
   * Initiate Nafath verification process
   */
  async initiate(idNumber: string): Promise<NafathSession> {
    try {
      const response: NafathInitiateResponse = await initiateNafath(idNumber);
      
      this.session = {
        requestId: response.requestId,
        expiresAt: new Date(response.expiresAt),
        nafathUrl: response.nafathUrl,
        status: 'PENDING'
      };

      // Start polling for status updates
      this.startPolling();
      
      // Set expiry timer
      this.setExpiryTimer();

      return this.session;
    } catch (error) {
      console.error('Failed to initiate Nafath:', error);
      throw error;
    }
  }

  /**
   * Start polling for Nafath status updates
   */
  private startPolling(): void {
    if (!this.session) return;

    // Poll every 3 seconds
    this.session.pollInterval = setInterval(async () => {
      await this.checkStatus();
    }, 3000);
  }

  /**
   * Check current Nafath status
   */
  private async checkStatus(): Promise<void> {
    if (!this.session) return;

    try {
      const statusResponse: NafathStatusResponse = await getNafathStatus(this.session.requestId);
      
      // Update session status
      this.session.status = statusResponse.status;

      // Notify subscribers
      this.statusCallbacks.forEach(callback => callback(statusResponse.status));

      // Stop polling if final status reached
      if (['RECEIVED', 'FAILED', 'REJECTED'].includes(statusResponse.status)) {
        this.stopPolling();
      }

    } catch (error) {
      console.error('Failed to check Nafath status:', error);
      // Continue polling on error
    }
  }

  /**
   * Set expiry timer for Nafath session
   */
  private setExpiryTimer(): void {
    if (!this.session) return;

    const timeUntilExpiry = this.session.expiresAt.getTime() - Date.now();
    
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        if (this.session && !['RECEIVED', 'FAILED', 'REJECTED'].includes(this.session.status)) {
          this.session.status = 'FAILED';
          this.stopPolling();
          
          if (this.expiryCallback) {
            this.expiryCallback();
          }
        }
      }, timeUntilExpiry);
    }
  }

  /**
   * Stop polling for status updates
   */
  private stopPolling(): void {
    if (this.session?.pollInterval) {
      clearInterval(this.session.pollInterval);
      this.session.pollInterval = undefined;
    }
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: NafathStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to expiry events
   */
  onExpiry(callback: () => void): void {
    this.expiryCallback = callback;
  }

  /**
   * Get current session
   */
  getCurrentSession(): NafathSession | null {
    return this.session;
  }

  /**
   * Open Nafath URL in new window/tab
   */
  openNafath(): void {
    if (this.session?.nafathUrl) {
      window.open(this.session.nafathUrl, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Get time remaining until expiry
   */
  getTimeRemaining(): number {
    if (!this.session) return 0;
    return Math.max(0, this.session.expiresAt.getTime() - Date.now());
  }

  /**
   * Format time remaining as MM:SS
   */
  getFormattedTimeRemaining(): string {
    const timeRemaining = this.getTimeRemaining();
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return this.getTimeRemaining() <= 0;
  }

  /**
   * Resend Nafath request
   */
  async resend(idNumber: string): Promise<void> {
    this.cleanup();
    await this.initiate(idNumber);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopPolling();
    this.session = null;
    this.statusCallbacks = [];
    this.expiryCallback = null;
  }
}

// Export singleton instance
export const nafathManager = new NafathManager();
