/**
 * Shared FormField component with consistent styling
 * Matches Figma design specifications
 */

import React, { ReactNode } from 'react';

export interface FormFieldProps {
  /** Form field label */
  label: string;
  /** Helper text shown below input */
  helper?: string;
  /** Error message - when present, shows error state */
  error?: string;
  /** Unique identifier for the field */
  id: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom class names */
  className?: string;
  /** Input element */
  children: ReactNode;
}

export function FormField({
  label,
  helper,
  error,
  id,
  required = false,
  className = '',
  children
}: FormFieldProps) {
  const hasError = !!error;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label 
        htmlFor={id}
        className={`block text-sm font-medium transition-colors text-left ml-3 ${
          hasError 
            ? 'text-red-600' 
            : 'text-gray-700'
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {children}
      </div>

      {/* Helper Text or Error */}
      {(helper || error) && (
        <div 
          id={`${id}-description`}
          className={`text-sm text-left ml-3 ${
            hasError 
              ? 'text-red-600' 
              : 'text-gray-500'
          }`}
          role={hasError ? 'alert' : undefined}
          aria-live={hasError ? 'polite' : undefined}
        >
          {error || helper}
        </div>
      )}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Whether input has an error state */
  hasError?: boolean;
  /** Left icon */
  leftIcon?: ReactNode;
  /** Right icon */
  rightIcon?: ReactNode;
}

export function Input({
  hasError = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {/* Left Icon */}
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      
      {/* Input */}
      <input
        className={`
          w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400
          transition-all duration-200 focus:outline-none focus:ring-2
          ${leftIcon ? 'pl-10' : ''}
          ${rightIcon ? 'pr-10' : ''}
          ${hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
            : 'border-gray-300 focus:border-[#2E248F] focus:ring-[#2E248F]/20 bg-white hover:border-gray-400'
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
          ${className}
        `}
        aria-describedby={props.id ? `${props.id}-description` : undefined}
        {...props}
      />
      
      {/* Right Icon */}
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Whether select has an error state */
  hasError?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Options for the select */
  options: { value: string; label: string }[];
}

export function Select({
  hasError = false,
  placeholder,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        className={`
          w-full px-4 py-3 border rounded-lg text-gray-900 
          transition-all duration-200 focus:outline-none focus:ring-2
          appearance-none bg-white
          ${hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
            : 'border-gray-300 focus:border-[#2E248F] focus:ring-[#2E248F]/20 hover:border-gray-400'
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
          ${className}
        `}
        aria-describedby={props.id ? `${props.id}-description` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Dropdown Arrow */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
