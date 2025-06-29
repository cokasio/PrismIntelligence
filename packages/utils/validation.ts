/**
 * Validation utilities for Prism Intelligence
 * These functions ensure data quality and consistency
 * Think of these as quality control inspectors for your data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate email addresses using a comprehensive pattern
 * This goes beyond basic validation to catch common typos
 */
export function validateEmail(email: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    result.isValid = false;
    result.errors.push('Invalid email format');
    return result;
  }

  // Check for common typos in domain
  const commonDomainTypos = [
    'gmial.com', 'gmai.com', 'gmail.co',
    'yahool.com', 'yaho.com', 'yahoo.co',
    'hotmial.com', 'hotmai.com'
  ];
  
  const domain = email.split('@')[1];
  if (commonDomainTypos.includes(domain)) {
    result.warnings.push(`Possible typo in domain: ${domain}`);
  }

  return result;
}
