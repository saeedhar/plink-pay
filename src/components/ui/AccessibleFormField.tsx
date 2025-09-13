/**
 * Accessible Form Field Components
 * Implements BRD requirements for WCAG compliance and screen reader support
 */

import React, { useId, forwardRef } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface AccessibleFormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  formatter?: (value: string) => string;
  validator?: (value: string) => string | null;
  onValidationError?: (error: string) => void;
}

export interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

/**
 * Accessible Form Field Wrapper
 */
export function AccessibleFormField({
  label,
  children,
  error,
  helperText,
  required = false,
  className = '',
  disabled = false
}: AccessibleFormFieldProps) {
  const fieldId = useId();
  const errorId = useId();
  const helperId = useId();
  const { announceError } = useAccessibility();

  // Announce errors when they change
  React.useEffect(() => {
    if (error) {
      announceError(label, error);
    }
  }, [error, label, announceError]);

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null
  ].filter(Boolean).join(' ');

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={fieldId}
        className={`block text-sm font-medium ${
          disabled ? 'text-gray-400' : 'text-gray-700'
        }`}
      >
        {label}
        {required && (
          <span 
            className="text-red-500 ml-1" 
            aria-label="required"
            role="img"
          >
            *
          </span>
        )}
      </label>

      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': describedBy || undefined,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required,
          disabled
        })}
      </div>

      {helperText && (
        <p 
          id={helperId}
          className="text-sm text-gray-500"
          role="note"
        >
          {helperText}
        </p>
      )}

      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Accessible Input Component
 */
export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  function AccessibleInput({
    label,
    error,
    helperText,
    icon,
    suffix,
    formatter,
    validator,
    onValidationError,
    onChange,
    onBlur,
    className = '',
    type = 'text',
    required = false,
    disabled = false,
    ...props
  }, ref) {
    const { toEnglishNumerals, isRTL } = useAccessibility();
    const [internalError, setInternalError] = React.useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      // Convert Arabic numerals for numeric inputs
      if (type === 'tel' || type === 'number') {
        value = toEnglishNumerals(value);
        event.target.value = value;
      }

      // Apply formatter
      if (formatter) {
        value = formatter(value);
        event.target.value = value;
      }

      // Validate
      if (validator) {
        const validationError = validator(value);
        setInternalError(validationError || '');
        if (validationError && onValidationError) {
          onValidationError(validationError);
        }
      }

      if (onChange) {
        onChange(event);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      // Validate on blur
      if (validator) {
        const validationError = validator(event.target.value);
        setInternalError(validationError || '');
        if (validationError && onValidationError) {
          onValidationError(validationError);
        }
      }

      if (onBlur) {
        onBlur(event);
      }
    };

    const finalError = error || internalError;

    return (
      <AccessibleFormField
        label={label}
        error={finalError}
        helperText={helperText}
        required={required}
        disabled={disabled}
      >
        <div className="relative">
          {icon && (
            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
              <div className="text-gray-400" aria-hidden="true">
                {icon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`
              block w-full rounded-lg border-gray-300 shadow-sm
              focus:border-[#2E248F] focus:ring-[#2E248F] focus:ring-1
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${icon ? (isRTL ? 'pr-10' : 'pl-10') : ''}
              ${suffix ? (isRTL ? 'pl-10' : 'pr-10') : ''}
              ${finalError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              ${isRTL ? 'text-right' : 'text-left'}
              ${className}
            `}
            required={required}
            disabled={disabled}
            {...props}
          />

          {suffix && (
            <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
              <div className="text-gray-400" aria-hidden="true">
                {suffix}
              </div>
            </div>
          )}
        </div>
      </AccessibleFormField>
    );
  }
);

/**
 * Accessible Select Component
 */
export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  function AccessibleSelect({
    label,
    error,
    helperText,
    options,
    placeholder,
    className = '',
    required = false,
    disabled = false,
    ...props
  }, ref) {
    const { isRTL } = useAccessibility();

    return (
      <AccessibleFormField
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
      >
        <select
          ref={ref}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-[#2E248F] focus:ring-[#2E248F] focus:ring-1
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${isRTL ? 'text-right' : 'text-left'}
            ${className}
          `}
          required={required}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </AccessibleFormField>
    );
  }
);

/**
 * Accessible Button Component
 */
export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  function AccessibleButton({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText = 'Loading...',
    icon,
    iconPosition = 'left',
    disabled,
    className = '',
    ...props
  }, ref) {
    const { isRTL } = useAccessibility();

    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-lg
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors duration-200
    `;

    const variantClasses = {
      primary: 'bg-[#2E248F] text-white hover:bg-[#1a1a5a] focus:ring-[#2E248F]',
      secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg 
            className={`w-4 h-4 animate-spin ${children ? (isRTL ? 'ml-2' : 'mr-2') : ''}`}
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {icon && !loading && iconPosition === 'left' && (
          <span className={`${children ? (isRTL ? 'ml-2' : 'mr-2') : ''}`} aria-hidden="true">
            {icon}
          </span>
        )}

        <span className={loading ? 'sr-only' : ''}>
          {loading ? loadingText : children}
        </span>

        {icon && !loading && iconPosition === 'right' && (
          <span className={`${children ? (isRTL ? 'mr-2' : 'ml-2') : ''}`} aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);
