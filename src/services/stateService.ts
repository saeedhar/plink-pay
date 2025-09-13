/**
 * State Persistence Service
 * Implements BRD requirements for state management across sessions
 */

import { OnboardingState, initialState } from '../store/onboardingFSM';

const STORAGE_KEY = 'plink_onboarding_state';
const STATE_VERSION = '1.0';

interface PersistedState {
  version: string;
  data: OnboardingState;
  timestamp: number;
  expiresAt: number;
}

export class StateService {
  private readonly EXPIRY_HOURS = 24; // State expires after 24 hours

  /**
   * Save state to localStorage with expiry
   */
  saveState(state: OnboardingState): void {
    try {
      const persistedState: PersistedState = {
        version: STATE_VERSION,
        data: {
          ...state,
          // Convert Set to Array for JSON serialization
          completedSteps: Array.from(state.completedSteps)
        } as any,
        timestamp: Date.now(),
        expiresAt: Date.now() + (this.EXPIRY_HOURS * 60 * 60 * 1000)
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  loadState(): OnboardingState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const persistedState: PersistedState = JSON.parse(stored);

      // Check version compatibility
      if (persistedState.version !== STATE_VERSION) {
        console.warn('State version mismatch, clearing stored state');
        this.clearState();
        return null;
      }

      // Check expiry
      if (Date.now() > persistedState.expiresAt) {
        console.warn('Stored state expired, clearing');
        this.clearState();
        return null;
      }

      // Restore state with proper Set conversion
      const restoredState: OnboardingState = {
        ...persistedState.data,
        // Convert Array back to Set
        completedSteps: new Set(persistedState.data.completedSteps as any)
      };

      return restoredState;
    } catch (error) {
      console.warn('Failed to load onboarding state:', error);
      this.clearState();
      return null;
    }
  }

  /**
   * Clear stored state
   */
  clearState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear onboarding state:', error);
    }
  }

  /**
   * Check if state exists and is valid
   */
  hasValidState(): boolean {
    return this.loadState() !== null;
  }

  /**
   * Get state age in minutes
   */
  getStateAge(): number {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return -1;

      const persistedState: PersistedState = JSON.parse(stored);
      return Math.floor((Date.now() - persistedState.timestamp) / (60 * 1000));
    } catch {
      return -1;
    }
  }

  /**
   * Create a checkpoint of current state
   */
  createCheckpoint(state: OnboardingState, label: string): void {
    try {
      const checkpointKey = `${STORAGE_KEY}_checkpoint_${label}`;
      const checkpoint = {
        version: STATE_VERSION,
        data: {
          ...state,
          completedSteps: Array.from(state.completedSteps)
        } as any,
        timestamp: Date.now(),
        label
      };

      localStorage.setItem(checkpointKey, JSON.stringify(checkpoint));
    } catch (error) {
      console.warn(`Failed to create checkpoint ${label}:`, error);
    }
  }

  /**
   * List available checkpoints
   */
  getCheckpoints(): Array<{ key: string; label: string; timestamp: number }> {
    const checkpoints: Array<{ key: string; label: string; timestamp: number }> = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${STORAGE_KEY}_checkpoint_`)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const checkpoint = JSON.parse(stored);
            checkpoints.push({
              key,
              label: checkpoint.label,
              timestamp: checkpoint.timestamp
            });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get checkpoints:', error);
    }

    return checkpoints.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear sensitive data (passwords, etc.) while keeping progress
   */
  clearSensitiveData(state: OnboardingState): OnboardingState {
    return {
      ...state,
      data: {
        ...state.data,
        // Clear sensitive fields
        password: undefined,
        // Keep other data for UX
      }
    };
  }

  /**
   * Migrate state from older versions (future-proofing)
   */
  private migrateState(oldState: any): OnboardingState {
    // Add migration logic here when state schema changes
    return oldState;
  }
}

// Export singleton instance
export const stateService = new StateService();
