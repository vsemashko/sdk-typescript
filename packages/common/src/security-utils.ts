/**
 * Security utility functions for sensitive data handling
 * @module
 */

/**
 * Masks sensitive string values for logging purposes.
 * Shows first and last few characters with asterisks in between.
 *
 * @param value - The sensitive string to mask
 * @param visibleChars - Number of characters to show at start and end (default: 4)
 * @returns Masked string, or undefined if input is undefined
 *
 * @example
 * ```ts
 * maskSensitiveString('sk_live_abc123def456ghi789')
 * // Returns: 'sk_l****************789'
 *
 * maskSensitiveString('short')
 * // Returns: '****'
 * ```
 */
export function maskSensitiveString(value: string | undefined, visibleChars = 4): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value.length <= visibleChars * 2) {
    // For short strings, mask completely
    return '*'.repeat(Math.max(4, value.length));
  }

  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const maskedLength = value.length - (visibleChars * 2);

  return `${start}${'*'.repeat(maskedLength)}${end}`;
}

/**
 * Masks API keys, tokens, and other credentials in objects for logging.
 * Recursively processes nested objects and arrays.
 *
 * @param obj - The object containing potentially sensitive data
 * @param sensitiveKeys - Array of key names to mask (case-insensitive)
 * @returns A new object with sensitive values masked
 *
 * @example
 * ```ts
 * const config = {
 *   apiKey: 'secret123',
 *   timeout: 5000,
 *   nested: { token: 'bearer_xyz' }
 * };
 *
 * maskSensitiveData(config, ['apiKey', 'token']);
 * // Returns: {
 * //   apiKey: '****',
 * //   timeout: 5000,
 * //   nested: { token: '****' }
 * // }
 * ```
 */
export function maskSensitiveData(
  obj: any,
  sensitiveKeys: string[] = ['apikey', 'api_key', 'password', 'secret', 'token', 'authorization', 'bearer']
): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => maskSensitiveData(item, sensitiveKeys));
  }

  const masked: any = {};
  const lowerSensitiveKeys = sensitiveKeys.map((k) => k.toLowerCase());

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = lowerSensitiveKeys.some((sk) => lowerKey.includes(sk));

    if (isSensitive && typeof value === 'string') {
      masked[key] = maskSensitiveString(value, 0); // Completely mask sensitive values in objects
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value, sensitiveKeys);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Masks Authorization header values (Bearer tokens, Basic auth, etc.)
 *
 * @param authHeader - The Authorization header value
 * @returns Masked authorization header
 *
 * @example
 * ```ts
 * maskAuthorizationHeader('Bearer sk_live_abc123def456')
 * // Returns: 'Bearer sk_l***********456'
 *
 * maskAuthorizationHeader('Basic dXNlcjpwYXNz')
 * // Returns: 'Basic dXNl*****YXNz'
 * ```
 */
export function maskAuthorizationHeader(authHeader: string | undefined): string | undefined {
  if (!authHeader) {
    return authHeader;
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2) {
    const [scheme, credentials] = parts;
    return `${scheme} ${maskSensitiveString(credentials)}`;
  }

  return maskSensitiveString(authHeader);
}

/**
 * Sanitizes error messages by removing potentially sensitive information
 *
 * @param error - Error object or message
 * @param replacements - Additional sensitive patterns to replace
 * @returns Sanitized error message
 */
export function sanitizeErrorMessage(
  error: Error | string,
  replacements: Record<string, string> = {}
): string {
  let message = error instanceof Error ? error.message : error;

  // Remove common sensitive patterns
  const patterns = [
    // API keys and tokens
    /\b[A-Za-z0-9_-]{20,}\b/g,
    // Email addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // IPv4 addresses (optional - might be needed for debugging)
    // /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    // File paths (Unix and Windows)
    /(?:\/[a-z_\-\d.]+)+/gi,
    /(?:[A-Z]:\\(?:[a-z_\-\d.]+\\)+)/gi,
  ];

  for (const pattern of patterns) {
    message = message.replace(pattern, '[REDACTED]');
  }

  // Apply custom replacements
  for (const [find, replace] of Object.entries(replacements)) {
    message = message.replace(new RegExp(find, 'g'), replace);
  }

  return message;
}

/**
 * Validates input length to prevent ReDoS and DoS attacks
 *
 * @param input - Input string to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field for error message
 * @throws Error if input exceeds maxLength
 */
export function validateInputLength(input: string, maxLength: number, fieldName = 'Input'): void {
  if (input.length > maxLength) {
    throw new Error(
      `${fieldName} exceeds maximum length of ${maxLength} characters (got ${input.length})`
    );
  }
}

/**
 * Validates URI format and length to prevent injection attacks
 *
 * @param uri - URI string to validate
 * @param maxLength - Maximum allowed URI length (default: 2048)
 * @returns true if valid, false otherwise
 */
export function isValidUri(uri: string, maxLength = 2048): boolean {
  if (!uri || uri.length > maxLength) {
    return false;
  }

  try {
    // Basic validation - can be enhanced based on requirements
    new URL(uri);
    return true;
  } catch {
    // For relative URIs or specific formats, add custom validation
    // This is a basic check - extend as needed
    const relativeUriPattern = /^[a-zA-Z0-9_\-./:[\]@]+$/;
    return relativeUriPattern.test(uri);
  }
}
