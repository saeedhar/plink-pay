/**
 * Comprehensive validation utilities for Saudi-specific business rules
 * Implements BRD requirements for phone, OTP, CR, ID, KYB, and password validation
 */

// ==========================================
// PHONE VALIDATION (BRD Requirements)
// ==========================================

/**
 * Converts Arabic numerals to English numerals
 */
export function convertArabicToEnglish(input: string): string {
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  const englishNumerals = '0123456789';
  
  return input.replace(/[٠-٩]/g, (match) => {
    const index = arabicNumerals.indexOf(match);
    return englishNumerals[index];
  });
}

/**
 * Validates Saudi phone number format
 * Must start with "05" and be exactly 10 digits (BRD)
 */
export function validateSaudiPhone(phone: string): string | null {
  if (!phone.trim()) {
    return "Phone number is required";
  }

  // Convert Arabic numerals and remove non-digits
  const cleanPhone = convertArabicToEnglish(phone).replace(/\D/g, '');
  
  if (cleanPhone.length !== 10) {
    return "Phone number must be exactly 10 digits";
  }
  
  if (!cleanPhone.startsWith('05')) {
    return "Phone number must start with 05";
  }
  
  // Additional Saudi mobile operator validation
  const validPrefixes = ['050', '051', '052', '053', '054', '055', '056', '057', '058', '059'];
  const prefix = cleanPhone.substring(0, 3);
  
  if (!validPrefixes.includes(prefix)) {
    return "Invalid Saudi mobile operator";
  }
  
  return null;
}

/**
 * Formats phone number as user types: 05X XXX XXXX
 */
export function formatPhoneNumber(input: string): string {
  const cleaned = convertArabicToEnglish(input).replace(/\D/g, '').substring(0, 10);

  const segments: string[] = [];

  if (cleaned.length === 0) {
    return '';
  }

  segments.push(cleaned.substring(0, Math.min(3, cleaned.length)));

  if (cleaned.length > 3) {
    segments.push(cleaned.substring(3, Math.min(6, cleaned.length)));
  }

  if (cleaned.length > 6) {
    segments.push(cleaned.substring(6));
  }

  return segments.join(' ');
}

// ==========================================
// OTP VALIDATION (BRD Requirements)
// ==========================================

/**
 * Validates OTP code - 6 digits
 */
export function validateOTP(otp: string): string | null {
  if (!otp.trim()) {
    return "Verification code is required";
  }
  
  const cleaned = convertArabicToEnglish(otp).replace(/\D/g, '');
  
  if (cleaned.length !== 6) {
    return "Verification code must be 6 digits";
  }
  
  return null;
}

/**
 * OTP Timer utilities
 */
export const OTP_CONFIG = {
  EXPIRY_MINUTES: 5,
  RESEND_SECONDS: 30
} as const;

// ==========================================
// CR NUMBER VALIDATION (BRD Requirements)  
// ==========================================

/**
 * Validates Saudi CR Number - numeric only, 10 digits
 */
export function validateCRNumber(crNumber: string): string | null {
  if (!crNumber.trim()) {
    return "CR Number is required";
  }
  
  const cleaned = convertArabicToEnglish(crNumber).replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return "CR Number must be exactly 10 digits";
  }
  
  return null;
}

/**
 * Formats CR number as user types: XXXX-XXX-XXX
 */
export function formatCRNumber(input: string): string {
  const cleaned = convertArabicToEnglish(input).replace(/\D/g, '').substring(0, 10);
  
  if (cleaned.length >= 7) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length >= 4) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
  }
  
  return cleaned;
}

// ==========================================
// SAUDI ID VALIDATION (BRD Requirements)
// ==========================================

/**
 * Validates Saudi ID using standard Saudi checksum algorithm
 * Supports both citizen (1*) and iqama (2*) variants
 */
export function isValidSaudiId(id: string): boolean {
  const cleaned = convertArabicToEnglish(id).replace(/\D/g, '');
  
  if (cleaned.length !== 10) return false;
  
  // Must start with 1 (Saudi citizen) or 2 (Iqama)
  if (!/^[12]/.test(cleaned)) return false;
  
  // Apply Saudi ID checksum algorithm (Luhn-like)
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cleaned[i]);
    
    // For odd positions (1st, 3rd, 5th, 7th, 9th), multiply by 1
    // For even positions (2nd, 4th, 6th, 8th), multiply by 2
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cleaned[9]);
}

/**
 * Validates Saudi ID with detailed error messages
 */
export function validateSaudiId(id: string): string | null {
  if (!id.trim()) {
    return "ID Number is required";
  }
  
  const cleaned = convertArabicToEnglish(id).replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return "ID Number must be exactly 10 digits";
  }
  
  if (!/^[12]/.test(cleaned)) {
    return "ID Number must start with 1 (Saudi) or 2 (Iqama)";
  }
  
  if (!isValidSaudiId(cleaned)) {
    return "Invalid ID Number checksum";
  }
  
  return null;
}

/**
 * Formats ID number as user types: XXXX XXX XXX
 */
export function formatIdNumber(input: string): string {
  const cleaned = convertArabicToEnglish(input).replace(/\D/g, '').substring(0, 10);
  
  if (cleaned.length >= 7) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  } else if (cleaned.length >= 4) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;
  }
  
  return cleaned;
}

/**
 * Determines ID type from first digit
 */
export function getIdType(id: string): 'saudi' | 'iqama' | 'unknown' {
  const cleaned = convertArabicToEnglish(id).replace(/\D/g, '');
  if (cleaned.startsWith('1')) return 'saudi';
  if (cleaned.startsWith('2')) return 'iqama';
  return 'unknown';
}

// ==========================================
// KYB VALIDATION (BRD Requirements)
// ==========================================

export const KYB_OPTIONS = {
  annualRevenue: [
    { value: 'less-than-100k', label: 'Less than $100K' },
    { value: '100k-500k', label: '$100K–$500K' },
    { value: '500k-1m', label: '$500K–$1M' },
    { value: '1m-5m', label: '$1M–$5M' },
    { value: '5m-10m', label: '$5M–$10M' },
    { value: 'above-10m', label: 'Above $10M' }
  ],
  
  businessActivity: [
    { value: 'retail', label: 'Retail Trade' },
    { value: 'wholesale', label: 'Wholesale Trade' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'services', label: 'Professional Services' },
    { value: 'technology', label: 'Technology & Software' },
    { value: 'healthcare', label: 'Healthcare Services' },
    { value: 'education', label: 'Education & Training' },
    { value: 'construction', label: 'Construction & Real Estate' },
    { value: 'transportation', label: 'Transportation & Logistics' },
    { value: 'hospitality', label: 'Hospitality & Tourism' },
    { value: 'agriculture', label: 'Agriculture & Food' },
    { value: 'finance', label: 'Financial Services' },
    { value: 'other', label: 'Other' }
  ],
  
  purposeOfAccount: [
    { value: 'receiving-payments', label: 'Receiving payments' },
    { value: 'paying-suppliers', label: 'Paying suppliers' },
    { value: 'managing-petty-cash', label: 'Managing petty cash' },
    { value: 'distributing-funds', label: 'Distributing funds' },
    { value: 'receiving-disbursements', label: 'Receiving disbursements' },
    { value: 'donations', label: 'Donations' },
    { value: 'other', label: 'Other' }
  ],
  
  // Sub-layer options for Expected Volume/Value
  expectedVolume: {
    payroll: [
      { value: 'none', label: 'None' },
      { value: 'under-10k', label: 'Under $10K monthly' },
      { value: '10k-50k', label: '$10K-$50K monthly' },
      { value: '50k-100k', label: '$50K-$100K monthly' },
      { value: 'above-100k', label: 'Above $100K monthly' }
    ],
    domestic: [
      { value: 'none', label: 'None' },
      { value: 'under-25k', label: 'Under $25K monthly' },
      { value: '25k-100k', label: '$25K-$100K monthly' },
      { value: '100k-500k', label: '$100K-$500K monthly' },
      { value: 'above-500k', label: 'Above $500K monthly' }
    ],
    international: [
      { value: 'none', label: 'None' },
      { value: 'under-10k', label: 'Under $10K monthly' },
      { value: '10k-50k', label: '$10K-$50K monthly' },
      { value: '50k-250k', label: '$50K-$250K monthly' },
      { value: 'above-250k', label: 'Above $250K monthly' }
    ],
    deposits: [
      { value: 'none', label: 'None' },
      { value: 'under-50k', label: 'Under $50K monthly' },
      { value: '50k-200k', label: '$50K-$200K monthly' },
      { value: '200k-1m', label: '$200K-$1M monthly' },
      { value: 'above-1m', label: 'Above $1M monthly' }
    ]
  }
} as const;

/**
 * Validates KYB field
 */
export function validateKYBField(value: string | string[], fieldName: string, isRequired: boolean = true): string | null {
  if (isRequired) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return `${fieldName} is required`;
    }
    if (typeof value === 'string' && !value.trim()) {
      return `${fieldName} is required`;
    }
  }
  
  return null;
}

/**
 * Validates "Other" text input when selected
 */
export function validateOtherText(text: string): string | null {
  if (!text.trim()) {
    return "Please specify details";
  }
  
  if (text.trim().length < 3) {
    return "Please provide more details (minimum 3 characters)";
  }
  
  if (text.length > 100) {
    return "Details too long (maximum 100 characters)";
  }
  
  return null;
}

// ==========================================
// PASSWORD VALIDATION (BRD Requirements)
// ==========================================

export interface PasswordRequirements {
  minLength: boolean;
  hasLetters: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
}

/**
 * Validates password against security requirements
 * >=8 chars, includes letters, numbers, symbols
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain letters";
  }
  
  if (!/\d/.test(password)) {
    return "Password must contain numbers";
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain symbols";
  }
  
  return null;
}

/**
 * Gets password requirements status for live checklist
 */
export function getPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasLetters: /[a-zA-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSymbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
}

/**
 * Validates password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  if (!confirmation) {
    return "Please confirm your password";
  }
  
  if (password !== confirmation) {
    return "Passwords do not match";
  }
  
  return null;
}
