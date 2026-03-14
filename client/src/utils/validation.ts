/**
 * Shared validation utilities for form fields
 */

export function validatePhoneLength(value: string | undefined | null, min: number = 10, max: number = 12): boolean {
  if (!value) return false;
  // Strip non-digit characters
  const digits = value.replace(/\D/g, '');
  return digits.length >= min && digits.length <= max;
}

export function getPhoneLengthErrorMessage(min: number = 10, max: number = 12): string {
    return `Phone number must be between ${min} and ${max} digits`;
}
