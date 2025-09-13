/**
 * Validation utilities for Saudi-specific patterns and business rules
 * Used across all onboarding forms
 */

// Saudi-specific validation patterns
export const SAUDI_PATTERNS = {
  // Saudi mobile numbers: must start with 5, followed by 8 digits (total 9 digits)
  MOBILE: /^5[0-9]{8}$/,
  
  // Saudi National ID: starts with 1 (Saudi) or 2 (Resident), followed by 9 digits (total 10 digits)
  NATIONAL_ID: /^[12][0-9]{9}$/,
  
  // Saudi CR Number: exactly 10 digits
  CR_NUMBER: /^[0-9]{10}$/,
  
  // Iqama numbers: start with 2, followed by 9 digits
  IQAMA: /^[2][0-9]{9}$/,
  
  // Saudi passport: starts with specific letters
  PASSPORT: /^[A-Z][0-9]{8}$/
};

/**
 * Normalizes Saudi mobile number to E.164 format (+9665XXXXXXXX)
 * Accepts: +9665XXXXXXXX, 05XXXXXXXX, or 5XXXXXXXX
 */
export const normalizeSaudiMobile = (mobile: string): string => {
  // Remove all non-digit characters
  const cleaned = mobile.replace(/\D/g, '');
  
  // Handle different input formats
  if (cleaned.startsWith('9665') && cleaned.length === 13) {
    // +9665XXXXXXXX format
    return `+${cleaned}`;
  } else if (cleaned.startsWith('05') && cleaned.length === 10) {
    // 05XXXXXXXX format
    return `+966${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    // 5XXXXXXXX format  
    return `+966${cleaned}`;
  }
  
  // Return as-is if doesn't match expected patterns
  return mobile;
};

/**
 * Validates Saudi mobile number format
 * Accepts: +9665XXXXXXXX, 05XXXXXXXX, or 5XXXXXXXX
 * Stores: E.164 format (+9665XXXXXXXX)
 */
export const validateSaudiMobile = (mobile: string): string | undefined => {
  if (!mobile.trim()) {
    return "Mobile number is required";
  }
  
  const normalized = normalizeSaudiMobile(mobile);
  
  // Check if normalized number is valid E.164 Saudi mobile
  const e164Pattern = /^\+9665[0-9]{8}$/;
  if (!e164Pattern.test(normalized)) {
    return "Enter a valid Saudi mobile number";
  }
  
  return undefined;
};

/**
 * Validates Saudi National ID or Iqama number
 * Format: 1XXXXXXXXX (Saudi National) or 2XXXXXXXXX (Resident)
 */
export const validateSaudiNationalID = (id: string): string | undefined => {
  if (!id.trim()) {
    return "National ID is required";
  }
  
  const cleanId = id.replace(/\s+/g, '');
  
  if (cleanId.length !== 10) {
    return "Saudi National ID must be exactly 10 digits";
  }
  
  if (!SAUDI_PATTERNS.NATIONAL_ID.test(cleanId)) {
    return "Invalid Saudi National ID. Must be 10 digits starting with 1 or 2";
  }
  
  // Validate checksum using Saudi ID algorithm
  if (!validateSaudiIDChecksum(cleanId)) {
    return "Invalid Saudi National ID checksum";
  }
  
  return undefined;
};

/**
 * Validates Saudi Commercial Registration (CR) number
 * Format: 10 digits exactly
 */
export const validateSaudiCR = (cr: string): string | undefined => {
  if (!cr.trim()) {
    return "CR Number is required";
  }
  
  const cleanCr = cr.replace(/\s+/g, '');
  
  if (cleanCr.length !== 10) {
    return "CR Number must be exactly 10 digits";
  }
  
  if (!SAUDI_PATTERNS.CR_NUMBER.test(cleanCr)) {
    return "Invalid CR Number. Must contain only digits";
  }
  
  return undefined;
};

/**
 * Saudi National ID Luhn algorithm validation
 * Based on the official Saudi ID validation using Luhn checksum
 */
const validateSaudiIDChecksum = (id: string): boolean => {
  if (id.length !== 10) return false;
  
  let sum = 0;
  
  // Process first 9 digits
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(id[i]);
    
    // Every second digit from right gets doubled (positions 1,3,5,7)
    if ((9 - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
  }
  
  // Calculate check digit
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(id[9]);
};

/**
 * Validates password strength according to security requirements
 */
export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return "Password is required";
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return "Password must contain at least one number";
  }
  
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    return "Password must contain at least one special character";
  }
  
  return undefined;
};

/**
 * Validates password confirmation
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  return undefined;
};

/**
 * Checks password strength and returns requirements status
 */
export const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUpper: /(?=.*[A-Z])/.test(password),
    hasLower: /(?=.*[a-z])/.test(password),
    hasNumber: /(?=.*\d)/.test(password),
    hasSpecial: /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)
  };
};

/**
 * Input formatters for better UX
 */
export const formatters = {
  /**
   * Formats phone number as user types: supports multiple formats
   * Handles: +966 5XXXX XXXX, 05XXXX XXXX, or 5XXXX XXXX
   */
  phone: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    // Handle +966 format
    if (numbers.startsWith('9665') || numbers.startsWith('966')) {
      const digits = numbers.startsWith('9665') ? numbers.substring(4) : numbers.substring(3);
      if (digits.length >= 6) {
        return `+966 ${digits.substring(0, 1)} ${digits.substring(1, 5)} ${digits.substring(5, 9)}`;
      } else if (digits.length >= 1) {
        return `+966 ${digits.substring(0, 1)} ${digits.substring(1)}`;
      }
      return '+966 ';
    }
    
    // Handle 05 format
    if (numbers.startsWith('05')) {
      const digits = numbers.substring(1);
      if (digits.length >= 6) {
        return `0${digits.substring(0, 1)} ${digits.substring(1, 5)} ${digits.substring(5, 9)}`;
      } else if (digits.length >= 1) {
        return `0${digits.substring(0, 1)} ${digits.substring(1)}`;
      }
      return '05';
    }
    
    // Handle 5 format
    if (numbers.startsWith('5')) {
      if (numbers.length >= 6) {
        return `${numbers.substring(0, 1)} ${numbers.substring(1, 5)} ${numbers.substring(5, 9)}`;
      } else if (numbers.length >= 1) {
        return `${numbers.substring(0, 1)} ${numbers.substring(1)}`;
      }
    }
    
    return numbers;
  },
  
  /**
   * Formats CR number as user types: 1234-56-7890
   */
  crNumber: (value: string): string => {
    const numbers = value.replace(/\D/g, '').substring(0, 10);
    if (numbers.length >= 6) {
      return `${numbers.substring(0, 4)}-${numbers.substring(4, 6)}-${numbers.substring(6)}`;
    } else if (numbers.length >= 4) {
      return `${numbers.substring(0, 4)}-${numbers.substring(4)}`;
    }
    return numbers;
  },
  
  /**
   * Formats National ID as user types: 1234 567 890
   */
  nationalId: (value: string): string => {
    const numbers = value.replace(/\D/g, '').substring(0, 10);
    if (numbers.length >= 7) {
      return `${numbers.substring(0, 4)} ${numbers.substring(4, 7)} ${numbers.substring(7)}`;
    } else if (numbers.length >= 4) {
      return `${numbers.substring(0, 4)} ${numbers.substring(4)}`;
    }
    return numbers;
  }
};

/**
 * Utility to clean formatted input (remove spaces, dashes)
 */
export const cleanInput = (value: string): string => {
  return value.replace(/[\s-]/g, '');
};

/**
 * Determines ID type based on first digit
 */
export const getIdType = (id: string): string => {
  if (!id) return 'Unknown';
  if (id.startsWith('1')) return 'Saudi National';
  if (id.startsWith('2')) return 'Resident (Iqama)';
  return 'Unknown';
};

/**
 * Validates business selection
 */
export const validateBusinessType = (businessType: string): string | undefined => {
  if (!businessType || businessType.trim() === '') {
    return "Please select a business type to continue";
  }
  return undefined;
};

/**
 * Validates KYB fields
 */
export const validateKYBField = (value: string, fieldName: string): string | undefined => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return undefined;
};

/**
 * Common patterns for validation
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_FORMAT: "Invalid format",
  TOO_SHORT: "Input is too short",
  TOO_LONG: "Input is too long",
  NUMBERS_ONLY: "Only numbers are allowed",
  LETTERS_ONLY: "Only letters are allowed"
};
