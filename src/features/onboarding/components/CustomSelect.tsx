import React, { useState } from "react";
import { BiChevronDown } from "react-icons/bi";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  error?: string;
  showError?: boolean;
  validation?: (value: string) => string | undefined;
  disabled?: boolean;
}

export function CustomSelect({
  id,
  label,
  placeholder = "Select an option",
  value,
  onChange,
  options,
  className = "",
  error,
  showError = false,
  validation,
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine the state based on value and focus
  const isEmpty = !value;
  
  // Get current validation error if validation function exists
  const validationError = validation ? validation(value) : undefined;
  const hasError = showError && (error || validationError);
  
  // Get selected option label
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // State-based styling
  const getSelectStyles = () => {
    if (disabled) {
      return "border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed";
    } else if (hasError) {
      // Error state - red border, white background
      return "border-2 border-red-500 bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200";
    } else if (isOpen || isFocused) {
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

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only close if clicking outside the dropdown
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-sm mb-2 transition-colors ${getLabelStyles()}`}>
        {label}
      </label>
      
      <div className="relative" onBlur={handleBlur}>
        {/* Select Button */}
        <button
          type="button"
          id={id}
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-md focus:outline-none transition-all duration-200 text-left flex items-center justify-between ${getSelectStyles()}`}
          style={{
            borderRadius: "20px" // Extra rounded for pill shape
          }}
        >
          <span className={isEmpty ? "text-gray-400" : "text-gray-900"}>
            {displayText}
          </span>
          <BiChevronDown 
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
              disabled ? 'text-gray-400' : 'text-gray-500'
            }`} 
          />
        </button>

        {/* Dropdown Options */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                  option.value === value 
                    ? 'bg-[#2E248F]/10 text-[#2E248F] font-medium' 
                    : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <div className="mt-2">
          <p className="text-sm text-red-500 font-medium">
            {error || validationError}
          </p>
        </div>
      )}
    </div>
  );
}
