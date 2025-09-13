import React, { useState } from "react";
import { BiChevronDown, BiCheck } from "react-icons/bi";
import { FormField } from "./FormField";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  id: string;
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  className?: string;
  error?: string;
  showError?: boolean;
  validation?: (value: string[]) => string | undefined;
  disabled?: boolean;
  required?: boolean;
}

export function MultiSelect({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
  className = "",
  error,
  showError = false,
  validation,
  disabled = false,
  required = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validationError = validation ? validation(value) : undefined;
  const hasError = showError && (error || validationError);
  const isEmpty = value.length === 0;

  const handleToggleOption = (optionValue: string) => {
    if (disabled) return;
    
    if (value.includes(optionValue)) {
      // Remove option
      onChange(value.filter(v => v !== optionValue));
    } else {
      // Add option
      onChange([...value, optionValue]);
    }
  };

  const getSelectStyles = () => {
    if (disabled) {
      return "border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed";
    } else if (hasError) {
      return "border-2 border-red-500 bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200";
    } else if (isFocused || isOpen) {
      return "border-2 border-[#2E248F] bg-white text-gray-900 ring-2 ring-[#2E248F]/20";
    } else if (isEmpty) {
      return "border-2 border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400";
    } else {
      return "border-2 border-[#2E248F] bg-white text-gray-900 hover:border-[#2E248F]/80";
    }
  };

  const getDisplayText = () => {
    if (isEmpty) return placeholder;
    if (value.length === 1) {
      const option = options.find(opt => opt.value === value[0]);
      return option?.label || value[0];
    }
    return `${value.length} selected`;
  };

  return (
    <FormField
      id={id}
      label={label}
      error={hasError ? (error || validationError) : undefined}
      className={className}
      htmlFor={id}
    >
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            // Delay closing to allow click on options
            setTimeout(() => setIsOpen(false), 200); 
          }}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-md text-left focus:outline-none transition-all duration-200 relative flex items-center justify-between ${getSelectStyles()}`}
          style={{ borderRadius: "20px" }}
        >
          <span className={`${isEmpty ? 'text-gray-400' : 'text-gray-900'}`}>
            {getDisplayText()}
          </span>
          <BiChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ borderRadius: "20px" }}>
            {options.filter(option => option.value !== "").map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleToggleOption(option.value)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer text-gray-800 hover:bg-gray-100 transition-colors duration-150 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className={isSelected ? 'text-[#2E248F] font-medium' : ''}>{option.label}</span>
                  {isSelected && (
                    <BiCheck className="w-5 h-5 text-[#2E248F]" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Display selected items as chips */}
        {!isEmpty && (
          <div className="mt-3 flex flex-wrap gap-2">
            {value.map((selectedValue) => {
              const option = options.find(opt => opt.value === selectedValue);
              if (!option) return null;
              
              return (
                <div
                  key={selectedValue}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[#2E248F]/10 text-[#2E248F] rounded-full text-sm font-medium"
                >
                  <span>{option.label}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleOption(selectedValue)}
                    className="text-[#2E248F] hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FormField>
  );
}
