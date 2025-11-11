import React from 'react';
import { FormField, Input } from './FormField';

interface SignupInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  maxLength?: number;
  autoComplete?: string;
  type?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helper?: string;
  required?: boolean;
  error?: string;
  addLeftPadding?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function SignupInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  hasError = false,
  maxLength,
  autoComplete,
  type = "text",
  leftIcon,
  rightIcon,
  helper,
  required = false,
  error,
  addLeftPadding = true,
  onBlur
}: SignupInputProps) {
  return (
    <FormField
      id={id}
      label={label}
      helper={helper}
      required={required}
      error={error}
    >
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        hasError={hasError}
        maxLength={maxLength}
        autoComplete={autoComplete}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onBlur={onBlur}
        className={leftIcon && addLeftPadding ? "pl-16" : ""}
        style={{ borderRadius: '20px' }}
      />
    </FormField>
  );
}
