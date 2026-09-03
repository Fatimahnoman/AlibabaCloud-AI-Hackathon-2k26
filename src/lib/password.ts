import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456', '12345678', 'qwerty',
  'abc123', 'monkey', 'master', 'dragon', 'login', 'princess', 'football',
  'shadow', 'sunshine', 'trustno1', 'iloveyou', 'batman', 'access',
  'hello', 'charlie', 'letmein', 'welcome', 'admin', 'passw0rd',
  'p@ssword', 'p@ssw0rd', 'pass123', 'pass1234', 'welcome1',
]);

const KEYBOARD_PATTERNS = [
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'qwerty', 'asdfgh', 'zxcvbn',
  '1234567890', '0987654321',
];

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  // Check for keyboard patterns
  const lowerPass = password.toLowerCase();
  for (const pattern of KEYBOARD_PATTERNS) {
    if (lowerPass.includes(pattern) || lowerPass.includes(pattern.split('').reverse().join(''))) {
      errors.push('Password contains a keyboard pattern. Please choose a stronger password');
      break;
    }
  }

  // Check for repeated characters (e.g., "aaaaaa")
  if (/(.)\1{4,}/.test(password)) {
    errors.push('Password contains too many repeated characters');
  }

  // Check for sequential characters (e.g., "abcde", "12345")
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    errors.push('Password contains sequential characters. Please choose a stronger password');
  }
  if (/(?:012|123|234|345|456|567|678|789)/.test(password)) {
    errors.push('Password contains sequential numbers. Please choose a stronger password');
  }

  return { valid: errors.length === 0, errors };
}
