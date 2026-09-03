const SENSITIVE_FIELDS = new Set([
  'passwordHash', 'password_hash',
  'accessToken', 'refreshToken',
  'resetToken', 'verificationToken',
  'secret', 'apiKey', 'api_key',
  'creditCard', 'credit_card',
  'ssn', 'socialSecurity',
  'bankAccount', 'bank_account',
]);

export function sanitizeResponse<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponse(item)) as T;
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.has(key)) {
        continue; // Skip sensitive fields
      }
      sanitized[key] = sanitizeResponse(value);
    }
    return sanitized as T;
  }

  return data;
}

export function sanitizeUser<T extends Record<string, unknown>>(user: T): Omit<T, 'passwordHash'> {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
