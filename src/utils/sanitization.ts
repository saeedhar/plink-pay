/**
 * Input Sanitization Utilities
 * Implements BRD requirements for XSS protection and input validation
 */

export interface SanitizationOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  maxLength?: number;
  trimWhitespace?: boolean;
  removeNullBytes?: boolean;
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(
  input: string | null | undefined,
  options: SanitizationOptions = {}
): string {
  if (!input) return '';

  const {
    allowHtml = false,
    allowedTags = [],
    maxLength = 1000,
    trimWhitespace = true,
    removeNullBytes = true
  } = options;

  let sanitized = String(input);

  // Remove null bytes
  if (removeNullBytes) {
    sanitized = sanitized.replace(/\0/g, '');
  }

  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Enforce max length
  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Handle HTML content
  if (!allowHtml) {
    // Escape all HTML entities
    sanitized = escapeHtml(sanitized);
  } else if (allowedTags.length > 0) {
    // Strip all HTML except allowed tags
    sanitized = stripHtmlExcept(sanitized, allowedTags);
  }

  return sanitized;
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(input: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(input: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/'
  };

  return input.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (match) => htmlUnescapes[match]);
}

/**
 * Strip HTML tags except allowed ones
 */
export function stripHtmlExcept(input: string, allowedTags: string[]): string {
  const allowedTagsSet = new Set(allowedTags.map(tag => tag.toLowerCase()));
  
  return input.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName) => {
    return allowedTagsSet.has(tagName.toLowerCase()) ? match : '';
  });
}

/**
 * Sanitize phone number input
 */
export function sanitizePhoneNumber(input: string): string {
  if (!input) return '';
  
  // Remove all non-digit characters except + and spaces
  let sanitized = input.replace(/[^\d+\s]/g, '');
  
  // Ensure it starts with + or digit
  if (sanitized && !sanitized.match(/^[\d+]/)) {
    sanitized = sanitized.substring(1);
  }
  
  // Limit length
  return sanitized.substring(0, 20);
}

/**
 * Sanitize numeric input (ID numbers, CR numbers, etc.)
 */
export function sanitizeNumericInput(input: string, maxLength: number = 20): string {
  if (!input) return '';
  
  // Remove all non-digit characters
  const sanitized = input.replace(/\D/g, '');
  
  // Limit length
  return sanitized.substring(0, maxLength);
}

/**
 * Sanitize name input (first name, last name, company name)
 */
export function sanitizeName(input: string): string {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  // Remove HTML and script tags
  sanitized = escapeHtml(sanitized);
  
  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Remove leading/trailing special characters
  sanitized = sanitized.replace(/^[^\w\u0600-\u06FF]+|[^\w\u0600-\u06FF]+$/g, '');
  
  // Limit length
  return sanitized.substring(0, 100);
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string): string {
  if (!input) return '';
  
  let sanitized = input.trim().toLowerCase();
  
  // Remove HTML
  sanitized = escapeHtml(sanitized);
  
  // Basic email character validation
  sanitized = sanitized.replace(/[^\w@.-]/g, '');
  
  // Limit length
  return sanitized.substring(0, 254); // RFC 5321 limit
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(input: string): string {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  // Remove HTML
  sanitized = escapeHtml(sanitized);
  
  // Ensure it starts with http:// or https://
  if (sanitized && !sanitized.match(/^https?:\/\//i)) {
    sanitized = 'https://' + sanitized;
  }
  
  try {
    const url = new URL(sanitized);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize search query input
 */
export function sanitizeSearchQuery(input: string): string {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  // Remove HTML
  sanitized = escapeHtml(sanitized);
  
  // Remove SQL injection patterns
  sanitized = sanitized.replace(/[';\\]/g, '');
  
  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Limit length
  return sanitized.substring(0, 200);
}

/**
 * Validate and sanitize file name
 */
export function sanitizeFileName(input: string): string {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  // Remove path traversal attempts
  sanitized = sanitized.replace(/[\/\\:*?"<>|]/g, '');
  
  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[.\s]+/, '');
  
  // Limit length
  sanitized = sanitized.substring(0, 255);
  
  // Ensure it's not empty after sanitization
  if (!sanitized) {
    sanitized = 'file';
  }
  
  return sanitized;
}

/**
 * Deep sanitize object properties
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldRules: Record<keyof T, SanitizationOptions> = {}
): T {
  const sanitized = { ...obj };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      const rules = fieldRules[key as keyof T] || {};
      sanitized[key as keyof T] = sanitizeInput(value, rules) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' 
          ? sanitizeInput(item, fieldRules[key as keyof T] || {})
          : item
      ) as T[keyof T];
    }
  }
  
  return sanitized;
}

/**
 * Generate Content Security Policy (CSP) header value
 */
export function generateCSPHeader(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Vite requires unsafe-inline/eval in dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  return directives.join('; ');
}

/**
 * Rate limiting key generator
 */
export function generateRateLimitKey(
  action: string,
  identifier: string,
  timeWindow: 'minute' | 'hour' | 'day' = 'minute'
): string {
  const now = new Date();
  let timeKey: string;
  
  switch (timeWindow) {
    case 'minute':
      timeKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
      break;
    case 'hour':
      timeKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
      break;
    case 'day':
      timeKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      break;
  }
  
  return `rate_limit:${action}:${identifier}:${timeKey}`;
}
