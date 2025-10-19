/**
 * Modal component matching Figma design specifications
 * Includes focus trap, ESC to close, and consistent styling
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Header icon */
  icon?: ReactNode;
  /** Modal content */
  children: ReactNode;
  /** Primary CTA button */
  primaryButton?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'danger';
  };
  /** Secondary button */
  secondaryButton?: {
    label: string;
    onClick: () => void;
  };
  /** Prevent closing with ESC or backdrop click */
  persistent?: boolean;
  /** Custom modal size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class names */
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  primaryButton,
  secondaryButton,
  persistent = false,
  size = 'md',
  className = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement>(null);
  const lastFocusableRef = useRef<HTMLElement>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Find focusable elements
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0] as HTMLElement;
      lastFocusableRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      // Focus first element
      firstFocusableRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusableRef.current) {
            e.preventDefault();
            lastFocusableRef.current?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusableRef.current) {
            e.preventDefault();
            firstFocusableRef.current?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, persistent]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  const buttonVariants = {
    primary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200'
  };

  const modal = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]}
          transform transition-all duration-200
          ${className}
        `}
      >
        {/* Header */}
        {(title || icon) && (
          <div className="relative p-6 pb-4">
            {/* Close button positioned absolutely in top right */}
            {!persistent && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors z-10"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Title content */}
            <div className="flex items-center gap-4">
              {icon && (
                <div className="flex-shrink-0 w-12 h-12 bg-[#2E248F]/10 rounded-full flex items-center justify-center">
                  {icon}
                </div>
              )}
              {title && (
                <div className={`flex-1 ${icon ? '' : 'text-center'}`}>
                  {title}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 pb-6">
          {children}
        </div>

        {/* Footer */}
        {(primaryButton || secondaryButton) && (
          <div className={`flex gap-3 p-6 pt-0 ${primaryButton && !secondaryButton ? 'justify-center' : 'justify-end'}`}>
            {secondaryButton && (
              <button
                onClick={secondaryButton.onClick}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-medium"
              >
                {secondaryButton.label}
              </button>
            )}
            {primaryButton && (
              <button
                onClick={primaryButton.onClick}
                disabled={primaryButton.disabled}
                className={`
                  px-8 py-3 rounded-2xl font-medium transition-all focus:outline-none focus:ring-2 min-w-50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${buttonVariants[primaryButton.variant || 'primary']}
                `}
              >
                {primaryButton.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// Specific modal variants for common use cases
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  icon?: ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      primaryButton={{
        label: confirmLabel,
        onClick: onConfirm,
        variant
      }}
      secondaryButton={{
        label: cancelLabel,
        onClick: onClose
      }}
      size="sm"
    >
      <p className="text-gray-600 leading-relaxed">
        {message}
      </p>
    </Modal>
  );
}

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  buttonLabel?: string;
  variant?: 'primary' | 'danger' | 'success' | 'info';
  icon?: ReactNode;
  children?: ReactNode;
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  buttonLabel = 'OK',
  variant = 'primary',
  icon,
  children
}: AlertModalProps) {
  const handleButtonClick = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      primaryButton={{
        label: buttonLabel,
        onClick: handleButtonClick,
        variant: variant === 'danger' ? 'danger' : 'primary'
      }}
      size="sm"
    >
      {children ? children : (
        <p className="text-gray-600 leading-relaxed">
          {message}
        </p>
      )}
    </Modal>
  );
}
