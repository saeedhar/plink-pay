/**
 * Loading State Management Hook
 * Implements BRD requirements for double-submit protection and optimistic UI
 */

import { useState, useRef, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastAction: string | null;
  retryCount: number;
}

interface UseLoadingStateOptions {
  maxRetries?: number;
  debounceMs?: number;
  optimisticUpdates?: boolean;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    maxRetries = 3,
    debounceMs = 300,
    optimisticUpdates = false
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    lastAction: null,
    retryCount: 0
  });

  const pendingActions = useRef<Set<string>>(new Set());
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const optimisticStates = useRef<Map<string, any>>(new Map());

  /**
   * Execute an async action with loading state management
   */
  const executeAction = useCallback(async <T>(
    actionId: string,
    action: () => Promise<T>,
    options: {
      optimisticUpdate?: () => void;
      onOptimisticRevert?: () => void;
      skipDebounce?: boolean;
    } = {}
  ): Promise<T> => {
    const { optimisticUpdate, onOptimisticRevert, skipDebounce = false } = options;

    // Prevent duplicate submissions
    if (pendingActions.current.has(actionId)) {
      throw new Error(`Action ${actionId} is already in progress`);
    }

    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          pendingActions.current.add(actionId);

          // Set loading state
          setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            lastAction: actionId
          }));

          // Apply optimistic update if provided
          if (optimisticUpdates && optimisticUpdate) {
            optimisticUpdate();
          }

          // Execute the actual action
          const result = await action();

          // Clear optimistic state on success
          optimisticStates.current.delete(actionId);

          // Update state
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
            retryCount: 0
          }));

          resolve(result);
        } catch (error) {
          // Revert optimistic update on error
          if (optimisticUpdates && onOptimisticRevert) {
            onOptimisticRevert();
          }

          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
            retryCount: prev.retryCount + 1
          }));

          reject(error);
        } finally {
          pendingActions.current.delete(actionId);
        }
      };

      // Apply debouncing if not skipped
      if (!skipDebounce && debounceMs > 0) {
        // Clear existing timer for this action
        const existingTimer = debounceTimers.current.get(actionId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Set new timer
        const timer = setTimeout(execute, debounceMs);
        debounceTimers.current.set(actionId, timer);
      } else {
        execute();
      }
    });
  }, [maxRetries, debounceMs, optimisticUpdates]);

  /**
   * Check if a specific action is in progress
   */
  const isActionPending = useCallback((actionId: string): boolean => {
    return pendingActions.current.has(actionId);
  }, []);

  /**
   * Check if any action is in progress
   */
  const isAnyActionPending = useCallback((): boolean => {
    return pendingActions.current.size > 0;
  }, []);

  /**
   * Retry the last failed action
   */
  const retry = useCallback(async <T>(
    actionId: string,
    action: () => Promise<T>
  ): Promise<T> => {
    if (state.retryCount >= maxRetries) {
      throw new Error(`Maximum retry attempts (${maxRetries}) exceeded for ${actionId}`);
    }

    return executeAction(actionId, action, { skipDebounce: true });
  }, [state.retryCount, maxRetries, executeAction]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  /**
   * Clear all pending actions (useful for cleanup)
   */
  const clearPendingActions = useCallback(() => {
    // Clear all timers
    debounceTimers.current.forEach(timer => clearTimeout(timer));
    debounceTimers.current.clear();
    
    // Clear pending actions
    pendingActions.current.clear();
    
    // Clear optimistic states
    optimisticStates.current.clear();

    setState(prev => ({
      ...prev,
      isLoading: false,
      error: null
    }));
  }, []);

  /**
   * Get current action status
   */
  const getActionStatus = useCallback((actionId: string) => {
    return {
      isPending: pendingActions.current.has(actionId),
      canRetry: state.retryCount < maxRetries && state.lastAction === actionId && state.error,
      retryCount: state.lastAction === actionId ? state.retryCount : 0
    };
  }, [state.retryCount, state.lastAction, state.error, maxRetries]);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    lastAction: state.lastAction,
    retryCount: state.retryCount,
    
    // Actions
    executeAction,
    retry,
    clearError,
    clearPendingActions,
    
    // Queries
    isActionPending,
    isAnyActionPending,
    getActionStatus,
    
    // Computed
    canRetry: state.retryCount < maxRetries && !!state.error,
    hasReachedMaxRetries: state.retryCount >= maxRetries
  };
}
