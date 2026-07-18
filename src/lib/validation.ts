import dns from 'dns';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'yopmail.com',
  'tempmail.com',
  'guerrillamail.com',
  'dispostable.com',
  'sharklasers.com',
  '10minutemail.com',
  'trashmail.com',
  'getairmail.com',
  'maildrop.cc'
]);

export async function validateEmailFormatAndDomain(email: string): Promise<{ valid: boolean; reason?: string }> {
  // 1. Format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email address format' };
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { valid: false, reason: 'Could not parse email domain' };
  }

  // 2. Check for temporary / disposable email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Disposable or temporary email domains are not allowed' };
  }

  // 3. DNS MX record lookup
  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'Domain has no valid MX records and cannot receive mail' };
    }
  } catch (error: any) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return { valid: false, reason: 'Email domain does not exist or has no mail servers' };
    }
    // For other errors (like dns server timeout), log a warning but don't hard block
    console.warn(`DNS resolution error for domain ${domain}:`, error.message);
  }

  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; normalized?: string; reason?: string } {
  if (!phone) {
    return { valid: false, reason: 'Phone number is required' };
  }

  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Match Indian phone format:
  // Starts with 91 or 0 followed by 10 digits starting with 6-9, OR just 10 digits starting with 6-9
  const indianPhoneRegex = /^(?:91|0)?[6-9]\d{9}$/;
  if (!indianPhoneRegex.test(digits)) {
    return { valid: false, reason: 'Phone number must be a valid Indian mobile number (+91 or 10-digit starting with 6-9)' };
  }

  // Normalize: get the last 10 digits
  const normalized = digits.slice(-10);

  // Logical checks:
  // 1. Repeating digits (e.g., all 9s, all 8s)
  if (/^(\d)\1{9}$/.test(normalized)) {
    return { valid: false, reason: 'Phone number cannot contain all repeating digits' };
  }

  // 2. Simple sequential patterns (e.g., 1234567890, 9876543210)
  const sequentialPatterns = [
    '0123456789',
    '1234567890',
    '9876543210',
    '0987654321'
  ];
  if (sequentialPatterns.includes(normalized)) {
    return { valid: false, reason: 'Phone number cannot be a simple sequential sequence' };
  }

  return { valid: true, normalized };
}
