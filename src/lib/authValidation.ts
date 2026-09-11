/**
 * Client-Side Validation Rules for CivicFix Authentication
 *
 * Implements strict format verification, password strength rules,
 * duplicate email checks against the mock user store, and password match validation.
 */

import { isEmailRegistered } from './mockUsers';

export interface RegistrationFields {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Standard RFC 5322-compliant email regex
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Clean phone number to digits only
 */
export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Validate Full Name
 */
export const validateFullName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Full name is required';
  }
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters';
  }
  return null;
};

/**
 * Validate Email address (format + duplicate check)
 */
export const validateEmail = (
  email: string,
  options: { checkDuplicate?: boolean } = { checkDuplicate: true }
): string | null => {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  if (options.checkDuplicate && isEmailRegistered(trimmed)) {
    return 'Email already registered';
  }
  return null;
};

/**
 * Validate Phone Number (10 digits, with optional +91 Indian country code or 0 trunk prefix)
 * Enforces valid character set (no letters/illegal symbols) and valid mobile start digits [6-9].
 */
export const validatePhoneNumber = (phone: string): string | null => {
  const trimmed = phone.trim();
  if (!trimmed) {
    return 'Phone number is required';
  }

  // Reject strings containing letters or illegal characters
  if (!/^\+?[0-9\s\-()]+$/.test(trimmed)) {
    return 'Please enter a valid 10-digit phone number';
  }

  const digits = sanitizePhoneNumber(trimmed);

  // Standard 10-digit mobile number, 12-digit with 91 prefix, or 11-digit with trunk 0
  const isTen = digits.length === 10 && /^[6-9]/.test(digits);
  const isTwelve = digits.length === 12 && /^91[6-9]/.test(digits);
  const isEleven = digits.length === 11 && /^0[6-9]/.test(digits);

  if (isTen || isTwelve || isEleven) {
    return null;
  }

  return 'Please enter a valid 10-digit phone number';
};

/**
 * Validate Password (8+ characters with basic strength rule: letters & numbers)
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return 'Password must contain both letters and numbers';
  }

  return null;
};

/**
 * Validate Confirm Password
 */
export const validateConfirmPassword = (
  confirmPassword: string,
  password: string
): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (confirmPassword !== password) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Comprehensive registration form validation returning all field errors
 */
export const validateRegistrationForm = (
  fields: RegistrationFields,
  options: { checkDuplicate?: boolean } = { checkDuplicate: true }
): RegistrationErrors => {
  const errors: RegistrationErrors = {};

  const nameError = validateFullName(fields.fullName);
  if (nameError) errors.fullName = nameError;

  const emailError = validateEmail(fields.email, options);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhoneNumber(fields.phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;

  const passwordError = validatePassword(fields.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    fields.confirmPassword,
    fields.password
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
};

/**
 * Check if the registration form is completely valid and ready for submission
 */
export const isRegistrationFormValid = (
  fields: RegistrationFields,
  options: { checkDuplicate?: boolean } = { checkDuplicate: true }
): boolean => {
  const errors = validateRegistrationForm(fields, options);
  return Object.keys(errors).length === 0;
};
