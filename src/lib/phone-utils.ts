// Utility functions for phone number normalization

export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove all spaces, dots, dashes, and parentheses
  const cleaned = phone.replace(/[\s\.\-\(\)]/g, "");

  // For French phone numbers, ensure it starts with 0 if it's a mobile number
  // This is a basic implementation - you might want more sophisticated validation
  return cleaned;
}

export function formatPhoneNumberForDisplay(phone: string): string {
  if (!phone) return "";

  const normalized = normalizePhoneNumber(phone);

  // Format French mobile numbers as "06 12 34 56 78"
  if (normalized.length === 10 && normalized.startsWith("0")) {
    return `${normalized.slice(0, 2)} ${normalized.slice(2, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 8)} ${normalized.slice(8, 10)}`;
  }

  return normalized;
}