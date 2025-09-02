import React, { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";

export interface CustomInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "password" | "text";
  className?: string;
  error?: string;
  showError?: boolean;
  validation?: (value: string) => string | undefined;
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
  validation
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine the state based on value and focus
  const isEmpty = !value;
  const isPassword = type === "password";
  
  // Get current validation error if validation function exists
  const validationError = validation ? validation(value) : undefined;
  const hasError = showError && (error || validationError);
  
  // Handle input change
  const handleChange = (newValue: string) => {
    onChange(newValue);
  };
  
  // State-based styling
  const getInputStyles = () => {
    if (hasError) {
      // Error state - red border, white background
      return "border-2 border-red-500 bg-white text-gray-900";
    } else if (isEmpty) {
      // Non-active/empty state - gray border, light background
      return "border-2 border-gray-300 bg-gray-50 text-gray-400";
    } else {
      // Filled state - purple border, white background
      return "border-2 border-[#2E248F] bg-white text-gray-900";
    }
  };

  const getLabelStyles = () => {
    if (hasError) {
      return "text-red-500 font-medium";
    } else if (isEmpty) {
      return "text-gray-500";
    } else {
      return "text-gray-700 font-medium";
    }
  };

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-sm mb-2 transition-colors ${getLabelStyles()}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : "text"}
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-md focus:outline-none transition-all duration-200 ${getInputStyles()} ${
            isPassword ? "pr-12" : ""
          }`}
          style={{
            borderRadius: "20px" // Extra rounded for pill shape
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <BiHide size={20} /> : <BiShow size={20} />}
          </button>
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
