import React, { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";

export interface CustomInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "password" | "text" | "tel";
  className?: string;
  error?: string;
  showError?: boolean;
  validation?: (value: string) => string | undefined;
  formatter?: (value: string) => string;
  realTimeValidation?: boolean;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function CustomInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  error,
  showError = false,
  validation,
  formatter,
  realTimeValidation = false,
  maxLength,
  prefix,
  suffix,
  disabled = false,
  autoComplete
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Determine the state based on value and focus
  const isEmpty = !value;
  const isPassword = type === "password";
  
  // Get current validation error if validation function exists
  const validationError = validation ? validation(value) : undefined;
  const hasError = showError && (error || validationError);
  
  // Handle input change with formatting
  const handleChange = (newValue: string) => {
    // Apply maxLength limit
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    // Apply formatter if provided
    const formattedValue = formatter ? formatter(newValue) : newValue;
    onChange(formattedValue);
  };
  
  // State-based styling
  const getInputStyles = () => {
    if (disabled) {
      return "border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed";
    } else if (hasError) {
      // Error state - red border, white background
      return "border-2 border-red-500 bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200";
    } else if (isFocused) {
      // Focused state - purple border with ring
      return "border-2 border-[#2E248F] bg-white text-gray-900 ring-2 ring-[#2E248F]/20";
    } else if (isEmpty) {
      // Non-active/empty state - gray border, light background
      return "border-2 border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400";
    } else {
      // Filled state - purple border, white background
      return "border-2 border-[#2E248F] bg-white text-gray-900 hover:border-[#2E248F]/80";
    }
  };

  const getLabelStyles = () => {
    if (hasError) {
      return "text-red-500 font-medium";
    } else if (isFocused || !isEmpty) {
      return "text-gray-700 font-medium";
    } else {
      return "text-gray-500";
    }
  };

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-sm mb-2 transition-colors ${getLabelStyles()}`}>
        {label}
      </label>
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 font-medium z-10">
            {prefix}
          </span>
        )}
        
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 rounded-md focus:outline-none transition-all duration-200 ${getInputStyles()} ${
            prefix ? "pl-16" : ""
          } ${
            isPassword || suffix ? "pr-12" : ""
          }`}
          style={{
            borderRadius: "20px" // Extra rounded for pill shape
          }}
        />
        
        {/* Suffix */}
        {suffix && (
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            {suffix}
          </span>
        )}
        
        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors z-10"
            disabled={disabled}
          >
            {showPassword ? <BiHide size={20} /> : <BiShow size={20} />}
          </button>
        )}
      </div>
      
      {/* Real-time validation message */}
      {realTimeValidation && !showError && validationError && value && (
        <div className="mt-2">
          <p className="text-sm text-orange-500 font-medium">
            {validationError}
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {hasError && (
        <div className="mt-2">
          <p className="text-sm text-red-500 font-medium">
            {error || validationError}
          </p>
        </div>
      )}
      
      {/* Character count */}
      {maxLength && (
        <div className="mt-1 text-right">
          <span className={`text-xs ${value.length > maxLength * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
