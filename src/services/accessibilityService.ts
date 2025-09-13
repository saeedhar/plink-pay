/**
 * Accessibility Service
 * Implements BRD requirements for WCAG compliance and screen reader support
 */

export interface A11yConfig {
  announcePageChanges: boolean;
  enableKeyboardNavigation: boolean;
  enableFocusTrapping: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
}

export interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
  originalTabIndex: string | null;
}

export class AccessibilityService {
  private config: A11yConfig;
  private liveRegion: HTMLElement | null = null;
  private focusHistory: HTMLElement[] = [];
  private trapStack: HTMLElement[][] = [];

  constructor(config: Partial<A11yConfig> = {}) {
    this.config = {
      announcePageChanges: true,
      enableKeyboardNavigation: true,
      enableFocusTrapping: true,
      enableHighContrast: false,
      enableReducedMotion: false,
      ...config
    };

    this.initialize();
  }

  /**
   * Initialize accessibility features
   */
  private initialize(): void {
    this.createLiveRegion();
    this.setupKeyboardNavigation();
    this.detectUserPreferences();
  }

  /**
   * Create ARIA live region for announcements
   */
  private createLiveRegion(): void {
    if (typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion || !this.config.announcePageChanges) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  /**
   * Announce page/step changes
   */
  announcePageChange(pageName: string, stepNumber?: number, totalSteps?: number): void {
    let message = `Navigated to ${pageName}`;
    
    if (stepNumber && totalSteps) {
      message += `. Step ${stepNumber} of ${totalSteps}`;
    }

    this.announce(message, 'polite');
  }

  /**
   * Announce form validation errors
   */
  announceValidationError(fieldName: string, error: string): void {
    const message = `${fieldName} has an error: ${error}`;
    this.announce(message, 'assertive');
  }

  /**
   * Announce successful actions
   */
  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    if (typeof document === 'undefined' || !this.config.enableKeyboardNavigation) return;

    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
  }

  /**
   * Handle global keyboard events
   */
  private handleGlobalKeydown(event: KeyboardEvent): void {
    // Skip navigation (Alt + S)
    if (event.altKey && event.key === 's') {
      event.preventDefault();
      this.skipToMainContent();
      return;
    }

    // Focus first focusable element (Alt + F)
    if (event.altKey && event.key === 'f') {
      event.preventDefault();
      this.focusFirstFocusable();
      return;
    }

    // Escape key handling
    if (event.key === 'Escape') {
      this.handleEscapeKey();
      return;
    }
  }

  /**
   * Skip to main content
   */
  private skipToMainContent(): void {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent instanceof HTMLElement) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Focus first focusable element
   */
  private focusFirstFocusable(): void {
    const focusable = this.getFocusableElements(document.body);
    if (focusable.length > 0) {
      focusable[0].element.focus();
    }
  }

  /**
   * Handle escape key press
   */
  private handleEscapeKey(): void {
    // Close modals, dropdowns, etc.
    const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
    if (activeModal) {
      const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="Close"]');
      if (closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    }
  }

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): FocusableElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    return elements
      .filter(el => this.isVisible(el))
      .map(el => ({
        element: el,
        tabIndex: el.tabIndex,
        originalTabIndex: el.getAttribute('tabindex')
      }))
      .sort((a, b) => {
        if (a.tabIndex === b.tabIndex) return 0;
        if (a.tabIndex === 0) return 1;
        if (b.tabIndex === 0) return -1;
        return a.tabIndex - b.tabIndex;
      });
  }

  /**
   * Check if element is visible
   */
  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  /**
   * Trap focus within a container
   */
  trapFocus(container: HTMLElement): () => void {
    if (!this.config.enableFocusTrapping) {
      return () => {};
    }

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0].element;
    const lastElement = focusableElements[focusableElements.length - 1].element;

    // Store current focus
    const previousFocus = document.activeElement as HTMLElement;
    this.focusHistory.push(previousFocus);

    // Focus first element
    firstElement.focus();

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeydown);
    this.trapStack.push(focusableElements.map(f => f.element));

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeydown);
      this.trapStack.pop();
      
      // Restore previous focus
      if (previousFocus && this.focusHistory.length > 0) {
        const lastFocus = this.focusHistory.pop();
        if (lastFocus && document.body.contains(lastFocus)) {
          lastFocus.focus();
        }
      }
    };
  }

  /**
   * Detect user accessibility preferences
   */
  private detectUserPreferences(): void {
    if (typeof window === 'undefined') return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.config.enableReducedMotion = prefersReducedMotion.matches;

    // Detect high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    this.config.enableHighContrast = prefersHighContrast.matches;

    // Listen for changes
    prefersReducedMotion.addEventListener('change', (e) => {
      this.config.enableReducedMotion = e.matches;
      this.applyMotionPreferences();
    });

    prefersHighContrast.addEventListener('change', (e) => {
      this.config.enableHighContrast = e.matches;
      this.applyContrastPreferences();
    });

    // Apply initial preferences
    this.applyMotionPreferences();
    this.applyContrastPreferences();
  }

  /**
   * Apply motion preferences
   */
  private applyMotionPreferences(): void {
    const root = document.documentElement;
    if (this.config.enableReducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
  }

  /**
   * Apply contrast preferences
   */
  private applyContrastPreferences(): void {
    const root = document.documentElement;
    if (this.config.enableHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }

  /**
   * Generate unique ID for ARIA relationships
   */
  generateId(prefix: string = 'a11y'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create ARIA description element
   */
  createDescription(text: string, id?: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id || this.generateId('desc');
    element.className = 'sr-only';
    element.textContent = text;
    element.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    
    document.body.appendChild(element);
    return element;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
    }
    
    // Clear focus traps
    this.trapStack.forEach(trap => {
      // Focus traps are cleaned up by their return functions
    });
    
    this.focusHistory = [];
    this.trapStack = [];
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();
