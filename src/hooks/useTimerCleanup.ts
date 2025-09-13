/**
 * Timer Cleanup Hook
 * Implements BRD requirements for proper timer management and cleanup
 */

import { useEffect, useRef, useCallback } from 'react';

interface TimerConfig {
  id: string;
  interval: number;
  callback: () => void;
  immediate?: boolean;
  maxExecutions?: number;
}

export function useTimerCleanup() {
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const intervals = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const executionCounts = useRef<Map<string, number>>(new Map());

  /**
   * Create a timeout with automatic cleanup
   */
  const createTimeout = useCallback((
    id: string,
    callback: () => void,
    delay: number
  ): void => {
    // Clear existing timer with same ID
    clearTimer(id);

    const timer = setTimeout(() => {
      callback();
      timers.current.delete(id);
    }, delay);

    timers.current.set(id, timer);
  }, []);

  /**
   * Create an interval with automatic cleanup
   */
  const createInterval = useCallback((config: TimerConfig): void => {
    const { id, interval, callback, immediate = false, maxExecutions } = config;

    // Clear existing interval with same ID
    clearInterval(id);

    // Reset execution count
    executionCounts.current.set(id, 0);

    // Execute immediately if requested
    if (immediate) {
      callback();
      if (maxExecutions === 1) {
        return;
      }
      executionCounts.current.set(id, 1);
    }

    const timer = setInterval(() => {
      const currentCount = executionCounts.current.get(id) || 0;
      
      // Check if max executions reached
      if (maxExecutions && currentCount >= maxExecutions) {
        clearInterval(id);
        return;
      }

      callback();
      executionCounts.current.set(id, currentCount + 1);
    }, interval);

    intervals.current.set(id, timer);
  }, []);

  /**
   * Clear a specific timer
   */
  const clearTimer = useCallback((id: string): void => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    const interval = intervals.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervals.current.delete(id);
    }

    executionCounts.current.delete(id);
  }, []);

  /**
   * Clear all timers
   */
  const clearAllTimers = useCallback((): void => {
    // Clear all timeouts
    timers.current.forEach(timer => clearTimeout(timer));
    timers.current.clear();

    // Clear all intervals
    intervals.current.forEach(interval => clearInterval(interval));
    intervals.current.clear();

    // Clear execution counts
    executionCounts.current.clear();
  }, []);

  /**
   * Check if timer exists
   */
  const hasTimer = useCallback((id: string): boolean => {
    return timers.current.has(id) || intervals.current.has(id);
  }, []);

  /**
   * Get execution count for an interval
   */
  const getExecutionCount = useCallback((id: string): number => {
    return executionCounts.current.get(id) || 0;
  }, []);

  /**
   * Pause an interval (clear but remember config for resume)
   */
  const pauseInterval = useCallback((id: string): void => {
    const interval = intervals.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervals.current.delete(id);
    }
  }, []);

  /**
   * Create a countdown timer with callback on each tick and completion
   */
  const createCountdown = useCallback((
    id: string,
    duration: number,
    onTick: (remaining: number) => void,
    onComplete: () => void,
    interval: number = 1000
  ): void => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    createInterval({
      id,
      interval,
      immediate: true,
      callback: () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        
        onTick(remaining);
        
        if (remaining <= 0) {
          clearTimer(id);
          onComplete();
        }
      }
    });
  }, [createInterval, clearTimer]);

  /**
   * Create a debounced function
   */
  const createDebounced = useCallback((
    id: string,
    callback: () => void,
    delay: number
  ): () => void => {
    return () => {
      clearTimer(id);
      createTimeout(id, callback, delay);
    };
  }, [createTimeout, clearTimer]);

  /**
   * Create a throttled function
   */
  const createThrottled = useCallback((
    id: string,
    callback: () => void,
    interval: number
  ): () => void => {
    let lastExecution = 0;

    return () => {
      const now = Date.now();
      if (now - lastExecution >= interval) {
        callback();
        lastExecution = now;
      }
    };
  }, []);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    createTimeout,
    createInterval,
    createCountdown,
    createDebounced,
    createThrottled,
    clearTimer,
    clearAllTimers,
    pauseInterval,
    hasTimer,
    getExecutionCount,
    
    // Stats
    activeTimerCount: timers.current.size + intervals.current.size
  };
}
